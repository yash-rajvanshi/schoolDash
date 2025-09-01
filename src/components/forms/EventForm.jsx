"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters!" }).max(100, { message: "Title cannot exceed 100 characters!" }),
  description: z.string().max(1000, { message: "Description cannot exceed 1000 characters!" }).optional(),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  classId: z.string().optional(),
  location: z.string().max(100, { message: "Location cannot exceed 100 characters!" }).optional(),
  eventType: z.enum(['academic', 'sports', 'cultural', 'other'], { message: "Please select a valid event type!" }),
});

const EventForm = ({ type, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);

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
      description: data?.description || '',
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : "",
      startTime: data?.startTime || "",
      endTime: data?.endTime || "",
      classId: data?.classId || "",
      location: data?.location || "",
      eventType: data?.eventType || 'other',
    },
  });

  // Fetch classes on mount
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
    fetchClasses();
  }, []);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Ensure time fields are in proper HH:MM format
      const formatTime = (timeString) => {
        if (!timeString) return '';
        // If it's already in HH:MM format, return as is
        if (/^\d{1,2}:\d{2}$/.test(timeString)) {
          return timeString;
        }
        // If it's in HH:MM:SS format, remove seconds
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
          return timeString.substring(0, 5);
        }
        // If it's a Date object or other format, try to extract time
        try {
          const date = new Date(timeString);
          if (!isNaN(date.getTime())) {
            return date.toTimeString().substring(0, 5);
          }
        } catch (e) {
          console.error('Time parsing error:', e);
        }
        return timeString;
      };

      const payload = {
        ...values,
        // Ensure date is properly formatted
        date: new Date(values.date).toISOString(),
        // Ensure time fields are in HH:MM format
        startTime: formatTime(values.startTime),
        endTime: formatTime(values.endTime),
      };
      if (!payload.classId || payload.classId === "") {
        delete payload.classId;
      }

      console.log("Final Payload: ", payload);

      const url =
        type === "update"
          ? `${API_BASE_URL}/api/event/${data?._id}`
          : `${API_BASE_URL}/api/event`;

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
        //alert(`Error: ${errorData.error || 'Failed to save event'}`);
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
            {type === "create" ? "Create New Event" : "Update Event"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Schedule and manage school events</p>
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
              <label className="text-sm font-medium text-gray-700">Event Title</label>
              <input
                {...register("title")}
                defaultValue={data?.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter event title"
              />
              {errors?.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Event Type</label>
              <select
                {...register("eventType")}
                defaultValue={data?.eventType || "other"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="other">Other</option>
              </select>
              {errors.eventType?.message && (
                <p className="text-sm text-red-600">{errors.eventType.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
              <label className="text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                {...register("startTime")}
                defaultValue={data?.startTime}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors?.startTime && (
                <p className="text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                {...register("endTime")}
                defaultValue={data?.endTime}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors?.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                {...register("location")}
                defaultValue={data?.location}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Event location (optional)"
              />
              {errors?.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Target Class Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Target Class</h2>
          </div>
          
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Target Class (Optional)</label>
              <select
                {...register("classId")}
                defaultValue={data?.classId || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Select a specific class or leave empty for all classes</p>
              {errors.classId?.message && (
                <p className="text-sm text-red-600">{errors.classId.message}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Event Description</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter event description (optional)"
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
            {submitting ? "Saving..." : type === "create" ? "Create Event" : "Update Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;