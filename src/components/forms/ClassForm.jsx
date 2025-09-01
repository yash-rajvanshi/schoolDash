"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  name: z.string().min(1, { message: "Name is required!" }).regex(/^\d[A-Za-z]$/, { message: "Name must be exactly 2 characters: a number followed by a letter (e.g., 1A, 2B)" }),
//   class: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.string().min(1, { message: "Capacity is required!" }),
  supervisorId: z.string().min(1, { message: "Teacher's name is required!" }),
});

const ClassForm = ({ type, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      capacity: data?.capacity ? String(data.capacity) : "",
    },
  });

  const nameValue = watch("name");

  // Auto-fill grade based on first character of name
  useEffect(() => {
    if (nameValue && /^\d/.test(nameValue)) {
      const firstDigit = nameValue[0];
      setValue("grade", firstDigit, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  }, [nameValue, setValue]);

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

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        grade: values.name[0],
      };

      const url =
        type === "update"
          ? `${API_BASE_URL}/api/class/${data?._id}`
          : `${API_BASE_URL}/api/class`;

      const response = await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (onSuccess) {
          onSuccess(result);
        }
        if (type !== "update") reset();
        //alert(`Class ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        //alert(`Error: ${errorData.error || 'Failed to save class'}`);
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
            {type === "create" ? "Create New Class" : "Update Class"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Set up class details and assign a supervisor</p>
        </div>
        
        {/* Class Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Class Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Class Name</label>
              <input
                {...register("name")}
                defaultValue={data?.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., 1A, 2B, 3C"
              />
              <p className="text-xs text-gray-500">Format: Number + Letter (e.g., 1A, 2B, 3C)</p>
              {errors?.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                {...register("capacity")}
                defaultValue={data?.capacity}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter class capacity"
                min="1"
                max="50"
              />
              {errors?.capacity && (
                <p className="text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <input
                {...register("grade")}
                defaultValue={data?.grade}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Auto-filled from class name"
              />
              <p className="text-xs text-gray-500">Automatically set from class name</p>
              {errors?.grade && (
                <p className="text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Supervisor Assignment Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Supervisor Assignment</h2>
          </div>
          
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Class Supervisor</label>
              <select
                {...register("supervisorId")}
                defaultValue={data?.supervisorId || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a teacher as supervisor</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Choose a teacher to supervise this class</p>
              {errors?.supervisorId && (
                <p className="text-sm text-red-600">{errors.supervisorId.message}</p>
              )}
            </div>
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
            {submitting ? "Saving..." : type === "create" ? "Create Class" : "Update Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;