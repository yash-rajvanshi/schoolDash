"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-dashboard-l273.onrender.com';

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

      console.log("Final Payload: ", payload);

      // Validate time format before sending
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(payload.startTime)) {
        alert('Start time must be in HH:MM format (e.g., 14:30)');
        setSubmitting(false);
        return;
      }
      if (!timeRegex.test(payload.endTime)) {
        alert('End time must be in HH:MM format (e.g., 15:30)');
        setSubmitting(false);
        return;
      }

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
        const result = await response.json();
        if (onSuccess) {
          onSuccess(result);
        }
        if (type !== "update") reset();
        alert(`Event ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save event'}`);
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
        {type === "update" ? "Update Event" : "Create a new Event"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Event Information
      </span>
      
      <div className="flex flex-col gap-6">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors?.title}
          placeholder="Enter event title"
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            {...register("description")}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.description ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
            placeholder="Enter event description (max 1000 characters)"
          />
          {errors?.description && (
            <span className="text-xs text-red-500">{errors.description.message}</span>
          )}
        </div>

        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Date"
            name="date"
            type="date"
            register={register}
            error={errors?.date}
          />

          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            register={register}
            error={errors?.startTime}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="time"
            register={register}
            error={errors?.endTime}
          />
        </div>

        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Location (Optional)"
            name="location"
            register={register}
            error={errors?.location}
            placeholder="Enter event location"
          />

          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Event Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("eventType")}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.eventType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="other">Other</option>
            </select>
            {errors?.eventType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.eventType.message}
              </p>
            )}
          </div>

          {/* Dropdown for class selection */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">
              Class (Optional)
            </label>
            <select
              {...register("classId")}
              className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors?.classId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.classId.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? "Submitting..."
          : type === "update"
          ? "Update Event"
          : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;