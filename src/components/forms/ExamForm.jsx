"use client";

import { useState, useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters!" }).max(100, { message: "Title cannot exceed 100 characters!" }),
  subjectId: z.string().min(1, { message: "Subject is required!" }),
  classId: z.string().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
  date: z.string().min(1, { message: "Exam Date is required!" }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time in HH:MM format" }),
  duration: z.coerce.number().int().min(15, { message: "Duration must be at least 15 minutes" }).max(300, { message: "Duration cannot exceed 300 minutes" }),
  maxScore: z.coerce.number().int().min(1, { message: "Max score must be at least 1" }).max(1000, { message: "Max score cannot exceed 1000" }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters" }).optional(),
});

const ExamForm = ({ type, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Dropdown states
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  
  // Refs for click outside detection
  const subjectDropdownRef = useRef(null);
  const classDropdownRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  
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
      title: data?.title || "",
      subjectId: data?.subjectId || "",
      classId: data?.classId || "",
      teacherId: data?.teacherId || "",
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : "",
      startTime: data?.startTime || "09:00",
      duration: data?.duration || 60,
      maxScore: data?.maxScore || 100,
      description: data?.description || "",
    },
  });
  
  // Watch values to display selected items
  const selectedSubjectId = watch("subjectId") || "";
  const selectedClassId = watch("classId") || "";
  const selectedTeacherId = watch("teacherId") || "";

  // Get display names for selected IDs
  const selectedSubject = subjects.find(s => s._id === selectedSubjectId)?.name || "";
  const selectedClass = classes.find(c => c._id === selectedClassId)?.name || "";
  const selectedTeacher = teachers.find(t => t._id === selectedTeacherId) ? 
    `${teachers.find(t => t._id === selectedTeacherId).firstName} ${teachers.find(t => t._id === selectedTeacherId).lastName}` : "";

  // Fetch subjects, classes, and teachers on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/subject`);
        const json = await res.json();
        console.log("Fetched Subjects:", json);
        setSubjects(json.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    };
    
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/class`);
        const json = await res.json();
        console.log("Fetched Classes:", json);
        setClasses(json.classes || []);
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };
    
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/teacher`);
        const json = await res.json();
        console.log("Fetched Teachers:", json);
        setTeachers(json.teachers || []);
      } catch (error) {
        console.error("Error fetching teachers", error);
      }
    };
    
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, []);

  // Handle clicks outside the dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setSubjectDropdownOpen(false);
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target)) {
        setClassDropdownOpen(false);
      }
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
        setTeacherDropdownOpen(false);
      }
    }
    
    // Add event listener when any dropdown is open
    if (subjectDropdownOpen || classDropdownOpen || teacherDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [subjectDropdownOpen, classDropdownOpen, teacherDropdownOpen]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        isActive: true
      };
  
      console.log("Final Payload: ", payload);
  
      const url =
        type === "update"
          ? `${API_BASE_URL}/api/exam/${data?._id}`
          : `${API_BASE_URL}/api/exam`;
  
      const response = await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Exam saved:", result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        if (type !== "update") reset();
        //alert(`Exam ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        //alert(`Error: ${errorData.error || 'Failed to save exam'}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      //alert('Network error occurred. Please try again.');
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
            {type === "create" ? "Create New Exam" : "Update Exam"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Schedule and configure examination details</p>
        </div>
        
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Exam Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Exam Title</label>
              <input
                {...register("title")}
                defaultValue={data?.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter exam title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Exam Date</label>
              <input
                type="date"
                {...register("date")}
                defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Time and Duration Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Time & Duration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                {...register("startTime")}
                defaultValue={data?.startTime || "09:00"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                {...register("duration")}
                defaultValue={data?.duration || 60}
                min="15"
                max="300"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="60"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Score</label>
              <input
                type="number"
                {...register("maxScore")}
                defaultValue={data?.maxScore || 100}
                min="1"
                max="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="100"
              />
              {errors.maxScore && (
                <p className="text-sm text-red-600">{errors.maxScore.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Exam Configuration Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Exam Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Subject Dropdown */}
            <div className="space-y-2 relative" ref={subjectDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex items-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
              >
                {selectedSubject ? (
                  <span>{selectedSubject}</span>
                ) : (
                  <span className="text-gray-500">Select subject</span>
                )}
              </div>
              
              {subjectDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedSubjectId === subject._id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setValue("subjectId", subject._id);
                        setSubjectDropdownOpen(false);
                      }}
                    >
                      {subject.name}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="subjectId" 
                value={selectedSubjectId} 
                {...register("subjectId")} 
              />
              
              {errors?.subjectId && (
                <p className="text-sm text-red-600">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Class Dropdown */}
            <div className="space-y-2 relative" ref={classDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Class</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex items-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              >
                {selectedClass ? (
                  <span>{selectedClass}</span>
                ) : (
                  <span className="text-gray-500">Select class</span>
                )}
              </div>
              
              {classDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {classes.map((cls) => (
                    <div
                      key={cls._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedClassId === cls._id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setValue("classId", cls._id);
                        setClassDropdownOpen(false);
                      }}
                    >
                      {cls.name}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="classId" 
                value={selectedClassId} 
                {...register("classId")} 
              />
              
              {errors?.classId && (
                <p className="text-sm text-red-600">{errors.classId.message}</p>
              )}
            </div>

            {/* Teacher Dropdown */}
            <div className="space-y-2 relative" ref={teacherDropdownRef}>
              <label className="text-sm font-medium text-gray-700">Teacher</label>
              <div 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex items-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px]"
                onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
              >
                {selectedTeacher ? (
                  <span>{selectedTeacher}</span>
                ) : (
                  <span className="text-gray-500">Select teacher</span>
                )}
              </div>
              
              {teacherDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className={`p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                        selectedTeacherId === teacher._id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setValue("teacherId", teacher._id);
                        setTeacherDropdownOpen(false);
                      }}
                    >
                      {teacher.firstName} {teacher.lastName}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hidden input for form validation */}
              <input 
                type="hidden" 
                name="teacherId" 
                value={selectedTeacherId} 
                {...register("teacherId")} 
              />
              
              {errors?.teacherId && (
                <p className="text-sm text-red-600">{errors.teacherId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">4</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              {...register("description")}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter exam description, instructions, or additional notes..."
              defaultValue={data?.description}
            />
            {errors.description?.message && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
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
            {submitting ? "Saving..." : type === "create" ? "Create Exam" : "Update Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;