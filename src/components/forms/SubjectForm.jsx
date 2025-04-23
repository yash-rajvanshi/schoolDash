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

const SubjectForm = ({ type, data }) => {
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
          const res = await fetch("http://localhost:9000/api/teacher");
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
        const response = await fetch(`http://localhost:9000/api/teacher/${teacherId}`, {
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
      try {
        const payload = {
          ...values,
        };
    
        console.log("Final Payload: ", payload);
    
        // Step 1: Save/update the subject
        const url =
          type === "update"
            ? `http://localhost:9000/api/subject/${data?._id}`
            : "http://localhost:9000/api/subject";
    
        const response = await fetch(url, {
          method: type === "update" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save subject");
        }
        
        const savedSubject = await response.json();
        const subjectId = savedSubject._id || data?._id;
        
        // Step 2: Update the teacher-subject relationships
        
        if (type === "update") {
          // For update operations:
          // 1. Find teachers removed from the subject
          const removedTeachers = originalTeacherIds.filter(
            id => !selectedTeachers.includes(id)
          );
          
          // 2. Find teachers added to the subject
          const addedTeachers = selectedTeachers.filter(
            id => !originalTeacherIds.includes(id)
          );
          
          // 3. Update removed teachers to remove this subject
          for (const teacherId of removedTeachers) {
            await updateTeacherSubjects(teacherId, subjectId, 'remove');
          }
          
          // 4. Update added teachers to add this subject
          for (const teacherId of addedTeachers) {
            await updateTeacherSubjects(teacherId, subjectId, 'add');
          }
        } else {
          // For create operations, add this subject to all selected teachers
          for (const teacherId of selectedTeachers) {
            await updateTeacherSubjects(teacherId, subjectId, 'add');
          }
        }
    
        if (type !== "update") reset();
      } catch (error) {
        console.error("Error submitting form", error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-xl font-semibold">
          {type === "update" ? "Update Subject" : "Create a new Subject"}
        </h1>
        <span className="text-xs text-gray-400 font-medium">
          Subject Information
        </span>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Subject Name"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
          />
          
          {/* Multi-select dropdown for teachers */}
          <div className="flex flex-col w-[48%] relative" ref={teacherDropdownRef}>
            <label className="font-medium text-sm text-gray-700 mb-1">
              Teachers
            </label>
            <div 
              className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex flex-wrap gap-1"
              onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
            >
              {selectedTeachers.length > 0 ? (
                selectedTeachers.map((_id) => (
                  <div 
                    key={_id} 
                    className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm flex items-center"
                  >
                    {getTeacherName(_id)}
                    <button
                      type="button"
                      className="ml-1 text-blue-600 hover:text-blue-800"
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
                <span className="text-gray-500">Select teachers</span>
              )}
            </div>
            
            {teacherDropdownOpen && (
              <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${
                      selectedTeachers.includes(teacher._id) ? "bg-blue-50" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTeacher(teacher._id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    {teacher.firstName} {teacher.lastName}
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
              <p className="text-red-500 text-xs mt-1">
                {errors.teachers.message}
              </p>
            )}
          </div>
        </div>

        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Submitting..."
            : type === "update"
            ? "Update"
            : "Create"}
        </button>
      </form>
    );
};

export default SubjectForm;