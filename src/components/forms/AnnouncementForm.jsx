"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
    title: z.string().min(1, { message: "Subject name is required!" }),
    classes: z
  .string()
  .min(1, { message: "Class is required!" })
  .transform((val) => val.split(",").map((s) => s.trim()))
  .refine((arr) => arr.length > 0, { message: "At least one class is required!" }),
    date: z.string().min(1, { message: "Date is required!" }),
});

const AnnouncementForm = ({ type, data }) => {
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
          ? `https://backend-dashboard-l273.onrender.com/api/announcement/${data?._id}`
          : "https://backend-dashboard-l273.onrender.com/api/announcement";
  
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
        setSubmitting(false); // ✅ end submitting
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">Create a new Announcement</h1>
      <span className="text-xs text-gray-400 font-medium">
      Announcement Information
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
          label="Classes"
          name="classes"
          defaultValue={data?.classes?.join(", ")}
          register={register}
          error={errors?.classes}
        />
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date}
          register={register}
          error={errors.date}
          type="date"
        />
      </div>


      {/* <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button> */}
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

export default AnnouncementForm;