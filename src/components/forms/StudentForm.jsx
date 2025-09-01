"use client";

import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  studentId: z.coerce.number().int().nonnegative().optional(),
  email: z.string().email({ message: "Invalid email address!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Please select a valid blood type!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["male", "female", "OTHER"], { message: "Sex is required!" }),
  // photo: z.string().url({ message: "Image URL is required after upload!" }).optional(),
  class: z.string().min(1, { message: "Class is required!" }),
  grade: z.coerce.number().int().nonnegative().min(1, { message: "Grade is required!" }),
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  classId: z.string().min(1, { message: "Combined class ID is required!" }),
  results: z.array(z.string()).optional(),
});

const StudentForm = ({ type, data, onSuccess }) => {
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
  console.log(data);
  const selectedClass = watch("class");
  const selectedGrade = watch("gradeId");

  // Generate and set studentId on component mount for new students
  useEffect(() => {
    if (type === "create" && !data?.studentId) {
      const generatedId = Math.floor(Math.random() * 1000000);
      setValue("studentId", generatedId);
    }
  }, [type, data?.studentId, setValue]);

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


  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        studentId: values.studentId || Math.floor(Math.random() * 1000000),
        grade: values.class || values.grade,
        class: values.classId || values.class, // 👈 override 'class' with 'classId'
        password: values.email + values.username,
      };
  
      console.log("Final Payload: ", payload);
  
      const url =
        type === "update"
          ? `${API_BASE_URL}/api/student/${data?._id}`
          : `${API_BASE_URL}/api/student`;
  
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
        //alert(`Student ${type === "update" ? "updated" : "created"} successfully!`);
      } else {
        const errorData = await response.json();
        //alert(`Error: ${errorData.error || 'Failed to save student'}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      //alert('Network error occurred. Please try again.');
    }
  };

      return (
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4 md:pb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {type === "create" ? "Create New Student" : "Update Student Information"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Fill in the student details below</p>
        </div>
        
        {/* Authentication Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Authentication Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                {...register("username")}
                defaultValue={data?.username}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter username"
              />
              {errors?.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                defaultValue={data?.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter email"
              />
              {errors?.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Student ID</label>
              <input
                {...register("studentId")}
                defaultValue={data?.studentId}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Auto-generated"
              />
              {errors?.studentId && (
                <p className="text-sm text-red-600">{errors.studentId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">2</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Academic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Class</label>
              <select
                {...register("class")}
                onChange={handleClassChange}
                defaultValue={data?.class || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Class</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
              {errors.class?.message && (
                <p className="text-sm text-red-600">{errors.class.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <select
                {...register("grade")}
                defaultValue={data?.grade || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Grade</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
              {errors.grade?.message && (
                <p className="text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Section</label>
              <select
                {...register("gradeId")}
                onChange={handleGradeChange}
                defaultValue={data?.gradeId || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Section</option>
                {["A", "B", "C", "D"].map((section) => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
              {errors.gradeId?.message && (
                <p className="text-sm text-red-600">{errors.gradeId.message}</p>
              )}
            </div>
          </div>
          <input type="hidden" {...register("classId")} />
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                {...register("firstName")}
                defaultValue={data?.firstName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                {...register("lastName")}
                defaultValue={data?.lastName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register("phone")}
                defaultValue={data?.phone}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <textarea
                {...register("address")}
                defaultValue={data?.address}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Blood Type</label>
              <select
                {...register("bloodType")}
                defaultValue={data?.bloodType}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Blood Type</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.bloodType && (
                <p className="text-sm text-red-600">{errors.bloodType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Birthday</label>
              <input
                type="date"
                {...register("birthday")}
                defaultValue={data?.birthday}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.birthday && (
                <p className="text-sm text-red-600">{errors.birthday.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sex</label>
              <select
                {...register("sex")}
                defaultValue={data?.sex}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.sex && (
                <p className="text-sm text-red-600">{errors.sex.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">4</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
          </div>
          
          <div className="max-w-md">
            <label
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              htmlFor="photo"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image src="/upload.png" alt="" width={32} height={32} className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUploading(true);
                    try {
                      const uploadedUrl = await uploadToCloudinary(file);
                      setValue("photo", uploadedUrl);
                    } catch (error) {
                      console.error("Upload error:", error);
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
                className="hidden"
              />
            </label>
            <input type="hidden" {...register("photo")} />
            {errors.photo && (
              <p className="text-sm text-red-600 mt-2">{errors.photo.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 md:pt-6">
          <button
            className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              uploading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : type === "create" ? "Create Student" : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;