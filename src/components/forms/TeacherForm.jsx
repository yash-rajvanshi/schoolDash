"use client";

import { useEffect, useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "school");

  const response = await fetch(
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
}

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  teacherId: z.coerce.number().int().nonnegative().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Please select a valid blood type!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["male", "female", "OTHER"], { message: "Sex is required!" }),
  // Both classes and subjects use array of strings
  classes: z
    .array(z.string())
    .min(1, { message: "At least one class is required!" }),
  subjects: z
    .array(z.string())
    .min(1, { message: "At least one subject is required!" }),
});

/**
 * @param {{ type: "create" | "update", data?: any }} props
 */
const TeacherForm = ({ type, data, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]); // Available classes from DB
  const [subjects, setSubjects] = useState([]); // Available subjects from DB
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [initialSubjects, setInitialSubjects] = useState([]); // Track initial subjects for updates
  
  const classDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      // Fix: Check if classes are objects (with _id property) or just strings
      classes: data?.classes?.map(cls => typeof cls === 'object' && cls?._id ? cls?._id : cls) || [],
      // Convert subjects from array or comma-separated string to array
      subjects: Array.isArray(data?.subjects) 
        ? (data.subjects.map(subj => typeof subj === 'object' && subj?._id ? subj?._id : subj))
        : data?.subjects?.split(',').map(s => s.trim()) || [],
    },
  });

  // This is the key part for debugging - log the incoming data
  useEffect(() => {
    if (data) {
      console.log("Incoming teacher data:", data);
      // Log the specific class data format
      console.log("Class data format:", data.classes);
      
      // Store initial subjects for later comparison during updates
      const subjectIds = Array.isArray(data?.subjects) 
        ? data.subjects.map(subj => typeof subj === 'object' && subj?._id ? subj?._id : subj)
        : data?.subjects?.split(',').map(s => s.trim()) || [];
      
      setInitialSubjects(subjectIds);
    }
  }, [data]);

  // Generate and set teacherId on component mount for new teachers
  useEffect(() => {
    if (type === "create" && !data?.teacherId) {
      const generatedId = Math.floor(Math.random() * 1000000) + 100000;
      setValue("teacherId", generatedId);
    }
  }, [type, data?.teacherId, setValue]);

  // Watch values to display selected items
  const selectedClasses = watch("classes") || [];
  const selectedSubjects = watch("subjects") || [];

  // Fetch classes and subjects on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/class`);
        const json = await res.json();
        console.log("Fetched Classes:", json);
        setClasses(json.classes);
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };
    
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/subject`);
        const json = await res.json();
        console.log("Fetched Subjects:", json);
        setSubjects(json.subjects || []); // Ensure we have an array even if API returns differently
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    };
    
    fetchClasses();
    fetchSubjects();
  }, []);

  // Handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target)) {
        setClassDropdownOpen(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setSubjectDropdownOpen(false);
      }
    }
    
    // Add event listener when either dropdown is open
    if (classDropdownOpen || subjectDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [classDropdownOpen, subjectDropdownOpen]);

  // Toggle a class selection
  const toggleClass = (classId) => {
    if (selectedClasses.includes(classId)) {
      // Remove class if already selected
      setValue(
        "classes",
        selectedClasses.filter((id) => id !== classId)
      );
    } else {
      // Add class if not selected
      setValue("classes", [...selectedClasses, classId]);
    }
  };

  // Toggle a subject selection
  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      // Remove subject if already selected
      setValue(
        "subjects",
        selectedSubjects.filter((id) => id !== subjectId)
      );
    } else {
      // Add subject if not selected
      setValue("subjects", [...selectedSubjects, subjectId]);
    }
  };

  // Fixed getClassName function - handle different class ID formats
  const getClassName = (classId) => {
    // First try to find by direct ID match
    let cls = classes.find(c => c._id === classId);
    
    // If not found and classId is an object with _id property, try that
    if (!cls && typeof classId === 'object' && classId._id) {
      cls = classes.find(c => c._id === classId._id);
    }
    
    // If still not found, try string comparison (in case IDs are stored differently)
    if (!cls && classes.length > 0) {
      cls = classes.find(c => String(c._id) === String(classId));
    }
    
    // Log for debugging
    if (!cls) {
      console.log(`Class not found for ID: ${classId}`);
      console.log("Available classes:", classes);
    }
    
    return cls ? cls.name : 'Unknown';
  };

  // Similarly fix getSubjectName function
  const getSubjectName = (subjectId) => {
    let subject = subjects.find(s => s._id === subjectId);
    
    if (!subject && typeof subjectId === 'object' && subjectId?._id) {
      subject = subjects.find(s => s._id === subjectId?._id);
    }
    
    if (!subject && subjects.length > 0) {
      subject = subjects.find(s => String(s._id) === String(subjectId));
    }
    
    return subject ? subject.name : 'Unknown';
  };

  // Remove a class selection
  const removeClass = (classId) => {
    setValue(
      "classes",
      selectedClasses.filter((id) => id !== classId)
    );
  };

  // Remove a subject selection
  const removeSubject = (subjectId) => {
    setValue(
      "subjects",
      selectedSubjects.filter((id) => id !== subjectId)
    );
  };

  // New function to update subjects with teacher ID
  const updateSubjectsWithTeacher = async (teacherId, selectedSubjectIds, previousSubjectIds = []) => {
    try {
      // Determine which subjects need teacher added (new subjects)
      const subjectsToAdd = selectedSubjectIds.filter(id => !previousSubjectIds.includes(id));
      
      // Determine which subjects need teacher removed (removed subjects)
      const subjectsToRemove = previousSubjectIds.filter(id => !selectedSubjectIds.includes(id));
      
      console.log("Updating subjects for teacher:", teacherId);
      console.log("Adding teacher to subjects:", subjectsToAdd);
      console.log("Removing teacher from subjects:", subjectsToRemove);
      
      // Process subjects to add teacher to
      for (const subjectId of subjectsToAdd) {
        // First get the current subject data
        const getResponse = await fetch(`${API_BASE_URL}/api/subject/${subjectId}`);
        const subjectData = await getResponse.json();
        
        // Prepare updated teachers array - ensure we don't add duplicates
        let teachers = Array.isArray(subjectData.teachers) ? [...subjectData.teachers] : [];
        if (!teachers.includes(teacherId) && !teachers.some(t => t._id === teacherId)) {
          teachers.push(teacherId);
        }
        
        // Update the subject
        await fetch(`${API_BASE_URL}/api/subject/${subjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...subjectData, teachers }),
        });
      }
      
      // Process subjects to remove teacher from
      for (const subjectId of subjectsToRemove) {
        // First get the current subject data
        const getResponse = await fetch(`${API_BASE_URL}/api/subject/${subjectId}`);
        const subjectData = await getResponse.json();
        
        // Prepare updated teachers array - filter out this teacher
        let teachers = Array.isArray(subjectData.teachers) 
          ? subjectData.teachers.filter(t => 
              t !== teacherId && 
              (typeof t === 'object' ? t._id !== teacherId : true)
            )
          : [];
        
        // Update the subject
        await fetch(`${API_BASE_URL}/api/subject/${subjectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...subjectData, teachers }),
        });
      }
      
      console.log("Subject updates completed successfully");
    } catch (error) {
      console.error("Error updating subjects with teacher:", error);
      throw error; // Re-throw so the main function can handle it
    }
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        ...values,
        teacherId: values.teacherId || Math.floor(Math.random() * 1000000) + 100000,
        password: values.email + values.username,
      };

      console.log("Final Payload: ", payload);

      const url =
        type === "update"
          ? `${API_BASE_URL}/api/teacher/${data?._id}`
          : `${API_BASE_URL}/api/teacher`;

      const response = await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const teacherData = await response.json();
        const teacherId = type === "update" ? data?._id : teacherData._id;
        
        console.log("Teacher saved successfully:", teacherData);
        
        // Now update the subjects with this teacher ID
        await updateSubjectsWithTeacher(
          teacherId, 
          values.subjects, 
          type === "update" ? initialSubjects : []
        );

        if (onSuccess) {
          onSuccess(teacherData);
        }
        if (type !== "update") reset();
        
        //alert("Teacher " + (type === "update" ? "updated" : "created") + " successfully!");
      } else {
        const errorData = await response.json();
        //alert(`Error: ${errorData.error || 'Failed to save teacher'}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      //alert("There was an error " + (type === "update" ? "updating" : "creating") + " the teacher. Please check the console for details.");
    } finally {
      setSubmitting(false);
    }
  };

      return (
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4 md:pb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {type === "create" ? "Create New Teacher" : "Update Teacher Information"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Fill in the teacher details below</p>
        </div>
        
        {/* Authentication Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Authentication Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                {...register("username")}
                defaultValue={data?.username}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter username"
              />
              {errors?.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                defaultValue={data?.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter email"
              />
              {errors?.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teacher ID</label>
              <input
                {...register("teacherId")}
                defaultValue={data?.teacherId}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Auto-generated"
              />
              {errors?.teacherId && (
                <p className="text-sm text-red-600">{errors.teacherId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                {...register("firstName")}
                defaultValue={data?.firstName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                {...register("lastName")}
                defaultValue={data?.lastName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register("phone")}
                defaultValue={data?.phone}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <textarea
                {...register("address")}
                defaultValue={data?.address}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Blood Type</label>
              <select
                {...register("bloodType")}
                defaultValue={data?.bloodType}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Blood Type</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.bloodType && (
                <p className="text-sm text-red-600">{errors.bloodType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Birthday</label>
              <input
                type="date"
                {...register("birthday")}
                defaultValue={data?.birthday}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.birthday && (
                <p className="text-sm text-red-600">{errors.birthday.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sex</label>
              <select
                {...register("sex")}
                defaultValue={data?.sex}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.sex && (
                <p className="text-sm text-red-600">{errors.sex.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Assignment Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Teaching Assignment</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Multi-select dropdown for classes */}
            <div className="space-y-2 relative" ref={classDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Classes</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex flex-wrap gap-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              >
                {selectedClasses.length > 0 ? (
                  selectedClasses.map((classId) => (
                    <div 
                      key={classId} 
                      className="bg-blue-100 text-blue-800 rounded-md px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <span>{getClassName(classId)}</span>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeClass(classId);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Select classes</span>
                )}
              </div>
              
              {classDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedClasses.includes(cls._id) ? "bg-blue-50" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleClass(cls._id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls._id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{cls.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="classes" 
                value={selectedClasses} 
                {...register("classes")} 
              />
              
              {errors?.classes && (
                <p className="text-sm text-red-600">{errors.classes.message}</p>
              )}
            </div>

            {/* Multi-select dropdown for subjects */}
            <div className="space-y-2 relative" ref={subjectDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Subjects</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex flex-wrap gap-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
              >
                {selectedSubjects.length > 0 ? (
                  selectedSubjects.map((subjectId) => (
                    <div 
                      key={subjectId} 
                      className="bg-green-100 text-green-800 rounded-md px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <span>{getSubjectName(subjectId)}</span>
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-800 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSubject(subjectId);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Select subjects</span>
                )}
              </div>
              
              {subjectDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedSubjects.includes(subject._id) ? "bg-green-50" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubject(subject._id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject._id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">{subject.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="subjects" 
                value={selectedSubjects} 
                {...register("subjects")} 
              />
              
              {errors?.subjects && (
                <p className="text-sm text-red-600">{errors.subjects.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">4</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
          </div>
          
          <div className="max-w-md">
            <label
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              htmlFor="photo"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image src="/upload.png" alt="" width={32} height={32} className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUploading(true);
                    try {
                      const uploadedUrl = await uploadToCloudinary(file);
                      setValue("photo", uploadedUrl);
                    } catch (error) {
                      console.error("Upload error:", error);
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
                className="hidden"
              />
            </label>
            <input type="hidden" {...register("photo")} />
            {errors.photo && (
              <p className="text-sm text-red-600 mt-2">{errors.photo.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 md:pt-6">
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              uploading || submitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={uploading || submitting}
          >
            {uploading ? "Uploading..." : 
             submitting ? "Saving..." :
             type === "create" ? "Create Teacher" : "Update Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;