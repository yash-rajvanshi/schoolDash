"use client";

import { useState, useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  subject: z.string().min(1, { message: "Subject name is required!" }),
  class: z.string().min(1, { message: "Class name is required!" }),
  teacher: z.string().min(1, { message: "Teacher's name is required!" }),
  date: z.string().min(1, { message: "Exam Date is required!" }),
});

const EForm = ({ type, data }) => {
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
      ...data,
    },
  });
  
  // Watch values to display selected items
  const selectedSubject = watch("subject") || "";
  const selectedClass = watch("class") || "";
  const selectedTeacher = watch("teacher") || "";

  // Fetch subjects, classes, and teachers on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("https://backend-dashboard-l273.onrender.com/api/subject");
        const json = await res.json();
        console.log("Fetched Subjects:", json);
        setSubjects(json.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    };
    
    const fetchClasses = async () => {
      try {
        const res = await fetch("https://backend-dashboard-l273.onrender.com/api/class");
        const json = await res.json();
        console.log("Fetched Classes:", json);
        setClasses(json.classes || []);
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };
    
    const fetchTeachers = async () => {
      try {
        const res = await fetch("https://backend-dashboard-l273.onrender.com/api/teacher");
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
      };
  
      console.log("Final Payload: ", payload);
  
      const url =
        type === "update"
          ? `https://backend-dashboard-l273.onrender.com/api/exam/${data?._id}`
          : "https://backend-dashboard-l273.onrender.com/api/exam";
  
      const response = await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log("Exam saved:", result);
      
      if (type !== "update") reset();
      // alert(`Exam ${type === "update" ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Error saving exam. Please check the console for details.");
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
                    selectedSubject === subject.name ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setValue("subject", subject.name);
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
            name="subject" 
            value={selectedSubject} 
            {...register("subject")} 
          />
          
          {errors?.subject && (
            <p className="text-red-500 text-xs mt-1">
              {errors.subject.message}
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
                    selectedClass === cls.name ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setValue("class", cls.name);
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
            name="class" 
            value={selectedClass} 
            {...register("class")} 
          />
          
          {errors?.class && (
            <p className="text-red-500 text-xs mt-1">
              {errors.class.message}
            </p>
          )}
        </div>
        
        <InputField
          label="Exam Date"
          name="date"
          defaultValue={data?.date}
          register={register}
          error={errors.date}
          type="date"
        />
        
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
                    selectedTeacher === `${teacher.firstName} ${teacher.lastName}` ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setValue("teacher", `${teacher.firstName} ${teacher.lastName}`);
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
            name="teacher" 
            value={selectedTeacher} 
            {...register("teacher")} 
          />
          
          {errors?.teacher && (
            <p className="text-red-500 text-xs mt-1">
              {errors.teacher.message}
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
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default EForm;