"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
        //alert(`Error: ${errorData.error || 'Failed to save announcement'}`);
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
            {type === "create" ? "Create New Announcement" : "Update Announcement"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Share important information with the school community</p>
        </div>
        
        {/* Basic Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                {...register("title")}
                defaultValue={data?.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter announcement title"
              />
              {errors?.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority Level</label>
              <select
                {...register("priority")}
                defaultValue={data?.priority || "medium"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority?.message && (
                <p className="text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Date and Target Classes Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Date & Target Classes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register("date")}
                defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors?.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Target Classes</label>
              <input
                {...register("classes")}
                defaultValue={data?.classes?.join(", ")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., 1A, 2B, 3C (comma separated)"
              />
              <p className="text-xs text-gray-500">Enter class names separated by commas, or leave empty for all classes</p>
              {errors?.classes && (
                <p className="text-sm text-red-600">{errors.classes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Announcement Content</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <textarea
              {...register("content")}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter the announcement content here..."
              defaultValue={data?.content}
            />
            {errors.content?.message && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
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
            {submitting ? "Saving..." : type === "create" ? "Create Announcement" : "Update Announcement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;