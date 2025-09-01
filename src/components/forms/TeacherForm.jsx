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
  email: z.string().email({ message: "Invalid email address!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Please select a valid blood type!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["male", "female", "OTHER"], { message: "Sex is required!" }),
  photo: z.string().url({ message: "Image URL is required after upload!" }),
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
const TeacherForm = ({ type, data }) => {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]); // Available classes from DB
  const [subjects, setSubjects] = useState([]); // Available subjects from DB
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [initialSubjects, setInitialSubjects] = useState([]); // Track initial subjects for updates
  
  const classDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);
  
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
        teacherId: Math.floor(Math.random() * 1000000) + 100000,
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
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "update" ? "Update Teacher" : "Create a new Teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors.lastName}
        />
        
        {/* Multi-select dropdown for classes */}
        <div className="flex flex-col w-[48%] relative" ref={classDropdownRef}>
          <label className="font-medium text-sm text-gray-700 mb-1">
            Classes
          </label>
          <div 
            className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex flex-wrap gap-1"
            onClick={() => setClassDropdownOpen(!classDropdownOpen)}
          >
            {selectedClasses.length > 0 ? (
              selectedClasses.map((classId) => (
                <div 
                  key={classId} 
                  className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm flex items-center"
                >
                  {getClassName(classId)}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-blue-800"
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
            <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedClasses.includes(cls._id) ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleClass(cls._id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls._id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {cls.name}
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
            <p className="text-red-500 text-xs mt-1">
              {errors.classes.message}
            </p>
          )}
        </div>

        {/* Multi-select dropdown for subjects */}
        <div className="flex flex-col w-[48%] relative" ref={subjectDropdownRef}>
          <label className="font-medium text-sm text-gray-700 mb-1">
            Subjects
          </label>
          <div 
            className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex flex-wrap gap-1"
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
          >
            {selectedSubjects.length > 0 ? (
              selectedSubjects.map((subjectId) => (
                <div 
                  key={subjectId} 
                  className="bg-green-100 text-green-800 rounded px-2 py-1 text-sm flex items-center"
                >
                  {getSubjectName(subjectId)}
                  <button
                    type="button"
                    className="ml-1 text-green-600 hover:text-green-800"
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
            <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedSubjects.includes(subject._id) ? "bg-green-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubject(subject._id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject._id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {subject.name}
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
            <p className="text-red-500 text-xs mt-1">
              {errors.subjects.message}
            </p>
          )}
        </div>

        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday}
          register={register}
          error={errors.birthday}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            htmlFor="photo"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </label>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                setUploading(true);
                const uploadedUrl = await uploadToCloudinary(file);
                setValue("photo", uploadedUrl);
                setUploading(false);
              }
            }}
          />
          <input type="hidden" {...register("photo")} />
          {errors.photo?.message && (
            <p className="text-xs text-red-400">
              {errors.photo.message.toString()}
            </p>
          )}
        </div>
      </div>

      <button
        className={`bg-blue-400 text-white p-2 rounded-md ${
          uploading || submitting ? "opacity-60 cursor-not-allowed" : ""
        }`}
        type="submit"
        disabled={uploading || submitting}
      >
        {uploading ? "Uploading..." : 
         submitting ? "Saving..." :
         type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;