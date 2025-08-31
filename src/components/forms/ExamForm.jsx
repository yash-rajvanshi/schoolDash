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
  duration: z.number().min(15, { message: "Duration must be at least 15 minutes" }).max(300, { message: "Duration cannot exceed 300 minutes" }),
  maxScore: z.number().min(1, { message: "Max score must be at least 1" }).max(1000, { message: "Max score cannot exceed 1000" }),
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
        alert(`Exam ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save exam'}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "update" ? "Update Exam" : "Create a new Exam"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Exam Information
      </span>
      
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
          type="text"
          placeholder="Enter exam title"
        />
        
        <InputField
          label="Exam Date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ""}
          register={register}
          error={errors.date}
          type="date"
        />
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={data?.startTime || "09:00"}
          register={register}
          error={errors.startTime}
          type="time"
        />
        
        <InputField
          label="Duration (minutes)"
          name="duration"
          defaultValue={data?.duration || 60}
          register={register}
          error={errors.duration}
          type="number"
          min="15"
          max="300"
        />
        
        <InputField
          label="Max Score"
          name="maxScore"
          defaultValue={data?.maxScore || 100}
          register={register}
          error={errors.maxScore}
          type="number"
          min="1"
          max="1000"
        />
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Subject Dropdown */}
        <div className="flex flex-col w-[48%] relative" ref={subjectDropdownRef}>
          <label className="font-medium text-sm text-gray-700 mb-1">
            Subject
          </label>
          <div 
            className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex items-center"
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
          >
            {selectedSubject ? (
              <span>{selectedSubject}</span>
            ) : (
              <span className="text-gray-500">Select subject</span>
            )}
          </div>
          
          {subjectDropdownOpen && (
            <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
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
            <p className="text-red-500 text-xs mt-1">
              {errors.subjectId.message}
            </p>
          )}
        </div>

        {/* Class Dropdown */}
        <div className="flex flex-col w-[48%] relative" ref={classDropdownRef}>
          <label className="font-medium text-sm text-gray-700 mb-1">
            Class
          </label>
          <div 
            className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex items-center"
            onClick={() => setClassDropdownOpen(!classDropdownOpen)}
          >
            {selectedClass ? (
              <span>{selectedClass}</span>
            ) : (
              <span className="text-gray-500">Select class</span>
            )}
          </div>
          
          {classDropdownOpen && (
            <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
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
            <p className="text-red-500 text-xs mt-1">
              {errors.classId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Teacher Dropdown */}
        <div className="flex flex-col w-[48%] relative" ref={teacherDropdownRef}>
          <label className="font-medium text-sm text-gray-700 mb-1">
            Teacher
          </label>
          <div 
            className="border border-gray-300 rounded-md p-2 min-h-10 cursor-pointer flex items-center"
            onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
          >
            {selectedTeacher ? (
              <span>{selectedTeacher}</span>
            ) : (
              <span className="text-gray-500">Select teacher</span>
            )}
          </div>
          
          {teacherDropdownOpen && (
            <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
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
            <p className="text-red-500 text-xs mt-1">
              {errors.teacherId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Description (Optional)"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
          type="textarea"
          placeholder="Enter exam description"
        />
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

export default ExamForm;