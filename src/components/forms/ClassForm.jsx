"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required!" }),
//   class: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.string().min(1, { message: "Capacity is required!" }),
  supervisorId: z.string().min(1, { message: "Teacher's name is required!" }),
  grade: z.string().min(1, { message: "Grade is required!" }),
});

const ClassForm = ({ type, data }) => {
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
    },
  });

  const nameValue = watch("name");

  // Auto-fill grade based on first character of name
  useEffect(() => {
    if (nameValue && /^\d/.test(nameValue)) {
      const firstDigit = nameValue[0];
      setValue("grade", firstDigit);
    }
  }, [nameValue, setValue]);

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:9000/api/teacher");
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
      };

      const url =
        type === "update"
          ? `http://localhost:9000/api/class/${data?._id}`
          : "http://localhost:9000/api/class";

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
      <h1 className="text-xl font-semibold">Create a new Class</h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Capacity"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
        />
        <InputField
          label="Grade"
          name="grade"
          register={register}
          error={errors?.grade}
          readOnly
        />

        {/* Dropdown for supervisor */}
        <div className="flex flex-col w-[48%]">
          <label className="font-medium text-sm text-gray-700 mb-1">
            Supervisor's Name
          </label>
          <select
            {...register("supervisorId")}
            defaultValue={data?.supervisorId || ""}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Select Supervisor</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
          {errors?.supervisorId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.supervisorId.message}
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

export default ClassForm;