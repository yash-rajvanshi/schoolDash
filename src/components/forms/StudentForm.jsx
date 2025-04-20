"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "school");

  const response = await fetch(
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
}

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  // studentId: z.coerce.number().int().nonnegative(),
  email: z.string().email({ message: "Invalid email address!" }),
  // password: z
  //   .string()
  //   .min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["male", "female", "OTHER"], { message: "Sex is required!" }),
  photo: z.string().url({ message: "Image URL is required after upload!" }).optional(),
  class: z.string().min(1, { message: "Class is required!" }),
  // grade: z.coerce.number().int().nonnegative().min(1, { message: "Grade is required!" }),
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  classId: z.string().min(1, { message: "Combined class ID is required!" }),
  results: z.array(z.string()).optional(),
});

const StudentForm = ({ type, data }) => {
  const [uploading, setUploading] = useState(false);
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
      attendance: data?.attendance || [],
      results: data?.results || [],
    },
  });

  const selectedClass = watch("class");
  const selectedGrade = watch("gradeId");

  const handleClassChange = (e) => {
    const value = e.target.value;
    setValue("class", value);
    if (selectedGrade) {
      setValue("classId", `${value}${selectedGrade}`);
    }
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setValue("gradeId", value);
    if (selectedClass) {
      setValue("classId", `${selectedClass}${value}`);
    }
  };


  // const onSubmit = async (values) => {
  //   try {
  //     const payload = {
  //       ...values,
  //       studentId: 1,
  //       grade: values.class || values.grade,
  //       class: values.classId || values.class, // 👈 override 'class' with 'classId'
  //     };

  //     console.log("Final Payload: ", payload);

  //     await fetch("http://localhost:9000/api/student", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     reset();
  //   } catch (error) {
  //     console.error("Error submitting form", error);
  //   }
  // };

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        studentId: data?.studentId || 1,
        grade: values.class || values.grade,
        class: values.classId || values.class, // 👈 override 'class' with 'classId'
        password: values.email + values.username,
      };
  
      console.log("Final Payload: ", payload);
  
      const url =
        type === "update"
          ? `http://localhost:9000/api/student/${data?._id}`
          : "http://localhost:9000/api/student";
  
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
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">Create a new student</h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        {/* <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        /> */}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (1-6)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("class")}
            onChange={handleClassChange}
            defaultValue={data?.class || ""}
          >
            <option value="">Select Class</option>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {errors.class?.message && (
            <p className="text-xs text-red-400">
              {errors.class.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade (A-D)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            onChange={handleGradeChange}
            defaultValue={data?.gradeId || ""}
          >
            <option value="">Select Grade</option>
            {["A", "B", "C", "D"].map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        {/* <InputField
          label="Student ID"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors?.studentId}
        /> */}


        <input type="hidden" {...register("classId")} />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors.firstName}
        />
        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors.lastName}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday}
          register={register}
          error={errors.birthday}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            htmlFor="photo"
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </label>
          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                setUploading(true); // 👈 prevent form submit
                const uploadedUrl = await uploadToCloudinary(file);
                setValue("photo", uploadedUrl);
                setUploading(false); // 👈 enable submit again
              }
            }}
          />
          <input type="hidden" {...register("photo")} />
          {errors.photo?.message && (
            <p className="text-xs text-red-400">
              {errors.photo.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button> */}
      <button
        className={`bg-blue-400 text-white p-2 rounded-md ${uploading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        type="submit"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;