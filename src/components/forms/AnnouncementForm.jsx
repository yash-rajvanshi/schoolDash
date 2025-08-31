"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-dashboard-l273.onrender.com';

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters!" }).max(100, { message: "Title cannot exceed 100 characters!" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters!" }).max(2000, { message: "Content cannot exceed 2000 characters!" }),
  classes: z
    .string()
    .min(1, { message: "Classes are required!" })
    .transform((val) => val.split(",").map((s) => s.trim()))
    .refine((arr) => arr.length > 0, { message: "At least one class is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], { message: "Please select a valid priority level!" }),
});

const AnnouncementForm = ({ type, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title || '',
      content: data?.content || '',
      classes: data?.classes?.join(", ") || '',
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : '',
      priority: data?.priority || 'medium',
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        // Ensure date is properly formatted
        date: new Date(values.date).toISOString(),
        // Include authorId if available
        ...(currentUser?._id && { authorId: currentUser._id }),
      };

      console.log("Final Payload: ", payload);

      const url =
        type === "update"
          ? `${API_BASE_URL}/api/announcement/${data?._id}`
          : `${API_BASE_URL}/api/announcement`;

      const response = await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        }
        if (type !== "update") reset();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Error: ${errorData.error || 'Failed to save announcement'}`);
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
        {type === "update" ? "Update Announcement" : "Create a new Announcement"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Announcement Information
      </span>
      
      <div className="flex flex-col gap-6">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors?.title}
          placeholder="Enter announcement title"
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("content")}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.content ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            placeholder="Enter announcement content (10-2000 characters)"
          />
          {errors?.content && (
            <span className="text-xs text-red-500">{errors.content.message}</span>
          )}
        </div>

        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Classes (comma-separated)"
            name="classes"
            register={register}
            error={errors?.classes}
            placeholder="e.g., Class 10A, Class 10B"
          />
          
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register("priority")}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.priority ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors?.priority && (
              <span className="text-xs text-red-500">{errors.priority.message}</span>
            )}
          </div>
          
          <InputField
            label="Date"
            name="date"
            register={register}
            error={errors.date}
            type="date"
          />
        </div>

        {currentUser && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <strong>Author:</strong> {currentUser.name || currentUser.email || 'Unknown User'}
          </div>
        )}
      </div>

      <button
        className={`bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium`}
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : type === "update"
            ? "Update Announcement"
            : "Create Announcement"}
      </button>
    </form>
  );
};

export default AnnouncementForm;