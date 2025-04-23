"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  classId: z.string().optional(),
});

const EventForm = ({ type, data }) => {
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
      ...data,
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : "",
      startTime: data?.startTime || "",
      endTime: data?.endTime || "",
    },
  });

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:9000/api/class");
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
      const payload = {
        ...values,
      };

      const url =
        type === "update"
          ? `http://localhost:9000/api/event/${data?._id}`
          : "http://localhost:9000/api/event";

      await fetch(url, {
        method: type === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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
        {type === "update" ? "Update Event" : "Create a new Event"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Event Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <InputField
          label="Date"
          name="date"
          type="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ""}
          register={register}
          error={errors?.date}
        />

        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
        />

        <InputField
          label="End Time"
          name="endTime"
          type="time"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
        />

        {/* Dropdown for class selection */}
        <div className="flex flex-col w-[48%]">
          <label className="font-medium text-sm text-gray-700 mb-1">
            Class (Optional)
          </label>
          <select
            {...register("classId")}
            defaultValue={data?.classId || ""}
            className="border border-gray-300 rounded-md p-2"
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

      <button
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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

export default EventForm;