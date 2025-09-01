"use client";

import { useEffect, useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
    name: z.string().min(1, { message: "Name is required!" }),
    teachers: z
    .array(z.string())
    .min(1, { message: "At least one teacher is required!" }),
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SubjectForm = ({ type, data, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [teachers, setTeachers] = useState([]); // Available teachers from DB
    const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
    const teacherDropdownRef = useRef(null);
    // Track original selected teachers for update operations
    const [originalTeacherIds, setOriginalTeacherIds] = useState([]);
  
    // Add debugging to see the incoming data
    useEffect(() => {
      if (data) {
        console.log("Incoming subject data:", data);
        console.log("Teacher data format:", data.teachers);
        
        // Store original teacher IDs for later comparison
        const teacherIds = data.teachers?.map(teacher => 
          typeof teacher === 'object' && teacher._id ? teacher._id : teacher
        ) || [];
        setOriginalTeacherIds(teacherIds);
      }
    }, [data]);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
      reset,
    } = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        ...data,
        // Fix: Handle different formats of teacher data
        teachers: data?.teachers?.map(teacher => 
          typeof teacher === 'object' && teacher._id ? teacher._id : teacher
        ) || [],
      },
    });
  
    // Watch values to display selected items
    const selectedTeachers = watch("teachers") || [];
  
    // Fetch teachers on mount
    useEffect(() => {
      const fetchTeachers = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/teacher`);
          const json = await res.json();
          console.log("Fetched Teachers:", json);
          setTeachers(json.teachers);
        } catch (error) {
          console.error("Error fetching teachers", error);
        }
      };
      fetchTeachers();
    }, []);

    // Handle clicks outside the dropdowns
    useEffect(() => {
      function handleClickOutside(event) {
        if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
          setTeacherDropdownOpen(false);
        }
      }
      
      // Add event listener when dropdown is open
      if (teacherDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      
      // Clean up the event listener
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [teacherDropdownOpen]);

    // Toggle a teacher selection
    const toggleTeacher = (_id) => {
      if (selectedTeachers.includes(_id)) {
        // Remove teacher if already selected
        setValue(
          "teachers",
          selectedTeachers.filter((id) => id !== _id)
        );
      } else {
        // Add teacher if not selected
        setValue("teachers", [...selectedTeachers, _id]);
      }
    };

    // Fixed getTeacherName function - handle different teacher ID formats
    const getTeacherName = (_id) => {
      // First try to find by direct ID match
      let teacher = teachers.find(t => t._id === _id);
      
      // If not found and _id is an object with _id property, try that
      if (!teacher && typeof _id === 'object' && _id._id) {
        teacher = teachers.find(t => t._id === _id._id);
      }
      
      // If still not found, try string comparison
      if (!teacher && teachers.length > 0) {
        teacher = teachers.find(t => String(t._id) === String(_id));
      }
      
      // Log for debugging
      if (!teacher) {
        console.log(`Teacher not found for ID: ${_id}`);
        console.log("Available teachers:", teachers);
      }
      
      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
    };

    // Remove a teacher selection
    const removeTeacher = (_id) => {
      setValue(
        "teachers",
        selectedTeachers.filter((id) => id !== _id)
      );
    };

    // Helper function to update a teacher's subjects
    const updateTeacherSubjects = async (teacherId, subjectId, action) => {
      try {
        const teacher = teachers.find(t => t._id === teacherId);
        if (!teacher) {
          console.error(`Teacher with ID ${teacherId} not found`);
          return;
        }
        
        // Get current subjects
        let teacherSubjects = teacher.subjects || [];
        if (typeof teacherSubjects === 'string') {
          teacherSubjects = teacherSubjects.split(',').map(s => s.trim());
        } else if (!Array.isArray(teacherSubjects)) {
          teacherSubjects = [];
        }
        
        // Modify subjects array based on action
        if (action === 'add' && !teacherSubjects.includes(subjectId)) {
          teacherSubjects.push(subjectId);
        } else if (action === 'remove') {
          teacherSubjects = teacherSubjects.filter(s => s !== subjectId);
        }
        
        // Update teacher record
        const response = await fetch(`${API_BASE_URL}/api/teacher/${teacherId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...teacher,
            subjects: teacherSubjects
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update teacher ${teacherId}`);
        }
        
        console.log(`Successfully updated subjects for teacher ${teacherId}`);
      } catch (error) {
        console.error(`Error updating teacher ${teacherId}:`, error);
      }
    };

    const onSubmit = async (values) => {
      setSubmitting(true);
      let removedTeachers = [];
      let addedTeachers = [];

      try {
        const payload = {
          ...values,
        };
    
        console.log("Final Payload: ", payload);
        
        if (type === "update") {
          // For update operations:
          // 1. Find teachers removed from the subject
          removedTeachers = originalTeacherIds.filter(
            id => !selectedTeachers.includes(id)
          );
          
          // 2. Find teachers added to the subject
          addedTeachers = selectedTeachers.filter(
            id => !originalTeacherIds.includes(id)
          )
        } else {
          addedTeachers = selectedTeachers;
        }
    
        // Step 1: Save/update the subject
        const url =
          type === "update"
            ? `${API_BASE_URL}/api/subject/${data?._id}`
            : `${API_BASE_URL}/api/subject`;
    
        const response = await fetch(url, {
          method: type === "update" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            removedTeachers,
            addedTeachers,
          }),
        });
        
        if (response.ok) {
          const savedSubject = await response.json();
          console.log("Saved Subject:", savedSubject);
          
          // Step 2: Update the teacher-subject relationships
          // ... existing teacher update logic ...
          
          if (onSuccess) {
            onSuccess(savedSubject);
          }
          if (type !== "update") reset();
          //alert(`Subject ${type === "update" ? "updated" : "created"} successfully!`);
        } else {
          const errorData = await response.json();
          //alert(`Error: ${errorData.error || 'Failed to save subject'}`);
        }
      } catch (error) {
        console.error("Error submitting form", error);
        //alert('Network error occurred. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto p-3 md:p-6">
        <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-4 md:pb-6">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              {type === "create" ? "Create New Subject" : "Update Subject"}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Define subject details and assign teachers</p>
          </div>
          
          {/* Subject Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Subject Details</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subject Name</label>
              <input
                {...register("name")}
                defaultValue={data?.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter subject name (e.g., Mathematics, English, Science)"
              />
              {errors?.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Teacher Assignment Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Teacher Assignment</h2>
            </div>
            
            <div className="space-y-2 relative" ref={teacherDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Assigned Teachers</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex flex-wrap gap-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
              >
                {selectedTeachers.length > 0 ? (
                  selectedTeachers.map((_id) => (
                    <div 
                      key={_id} 
                      className="bg-blue-100 text-blue-800 rounded-md px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <span>{getTeacherName(_id)}</span>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTeacher(_id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Select teachers for this subject</span>
                )}
              </div>
              
              {teacherDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedTeachers.includes(teacher._id) ? "bg-blue-50" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTeacher(teacher._id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher._id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="teachers" 
                value={selectedTeachers} 
                {...register("teachers")} 
              />
              
              {errors?.teachers && (
                <p className="text-sm text-red-600">{errors.teachers.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 md:pt-6">
            <button
              className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                submitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : type === "create" ? "Create Subject" : "Update Subject"}
            </button>
          </div>
        </form>
      </div>
    );
};

export default SubjectForm;