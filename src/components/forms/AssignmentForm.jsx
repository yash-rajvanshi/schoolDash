"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  subject: z.string().min(1, { message: "Subject is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
  teacher: z.string().min(1, { message: "Teacher is required!" }),
});

const AssignmentForm = ({ type, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
      };
  
      console.log("Final Payload: ", payload);
  
      const url =
        type === "update"
          ? `${API_BASE_URL}/api/assignment/${data?._id}`
          : `${API_BASE_URL}/api/assignment`;
  
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
        //alert(`Assignment ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        //alert(`Error: ${errorData.error || 'Failed to save assignment'}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      //alert('Network error occurred. Please try again.');
    } finally {
        setSubmitting(false); // ✅ end submitting
    }
  };

  return (
    <form className="flex flex-col gap-6 md:gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-lg md:text-xl font-semibold text-gray-800">
        {type === "create" ? "Create New Assignment" : "Update Assignment"}
      </h1>
      
      {/* Assignment Information */}
      <div className="space-y-4">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
          Assignment Details
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Subject"
            name="subject"
            defaultValue={data?.subject}
            register={register}
            error={errors?.subject}
            placeholder="Enter subject name"
          />
          <InputField
            label="Class"
            name="class"
            defaultValue={data?.class}
            register={register}
            error={errors?.class}
            placeholder="Enter class name"
          />
          <InputField
            label="Due Date"
            name="dueDate"
            defaultValue={data?.dueDate}
            register={register}
            error={errors.dueDate}
            type="date"
          />
          <InputField
            label="Teacher's Name"
            name="teacher"
            defaultValue={data?.teacher}
            register={register}
            error={errors.teacher}
            placeholder="Enter teacher name"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium text-sm md:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            submitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : type === "create" ? "Create Assignment" : "Update Assignment"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;