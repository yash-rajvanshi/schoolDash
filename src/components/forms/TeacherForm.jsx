"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-h÷ook-form";
import { useState } from "react";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.date({ message: "Birthday is required!" }),
  sex: z.enum(["male", "female"], { message: "Sex is required!" }),
  img: z.instanceof(File, { message: "Image is required" }),
});

/**
 * @param {{ type: "create" | "update", data?: any }} props
 */
const TeacherForm = ({ type, data }) => {
  const [form, setForm] = useState({});

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  }
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm({
  //   resolver: zodResolver(schema),
  //   defaultValues: data || {},
  // });

  const onSubmit = (formData) => {
    console.log(formData);
    // You can handle create/update here
  };

  return (
    // <form onSubmit={handleSubmit(onSubmit)}>
    //   <InputField
    //     label="Username"
    //     {...register("username")}
    //     error={errors.username?.message}
    //   />
    //   <InputField
    //     label="Email"
    //     {...register("email")}
    //     error={errors.email?.message}
    //   />
    //   <InputField
    //     label="Password"
    //     type="password"
    //     {...register("password")}
    //     error={errors.password?.message}
    //   />
    //   <InputField
    //     label="First Name"
    //     {...register("firstName")}
    //     error={errors.firstName?.message}
    //   />
    //   <InputField
    //     label="Last Name"
    //     {...register("lastName")}
    //     error={errors.lastName?.message}
    //   />
    //   <InputField
    //     label="Phone"
    //     {...register("phone")}
    //     error={errors.phone?.message}
    //   />
    //   <InputField
    //     label="Address"
    //     {...register("address")}
    //     error={errors.address?.message}
    //   />
    //   <InputField
    //     label="Blood Type"
    //     {...register("bloodType")}
    //     error={errors.bloodType?.message}
    //   />
    //   <InputField
    //     label="Birthday"
    //     type="date"
    //     {...register("birthday")}
    //     error={errors.birthday?.message}
    //   />
    //   <select {...register("sex")}>
    //     <option value="">Select Gender</option>
    //     <option value="male">Male</option>
    //     <option value="female">Female</option>
    //   </select>
    //   {errors.sex && <p>{errors.sex.message}</p>}

    //   <InputField
    //     label="Upload Image"
    //     type="file"
    //     {...register("img")}
    //     error={errors.img?.message}
    //   />

    //   <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
    //     {type === "create" ? "Create" : "Update"} Teacher
    //   </button>
    // </form>
    <form>
      <input type="text" name="username" value={form.username} onChange={handleChange}/>
      <input type="text" name="name" value={form.name} onChange={handleChange}/>
      <input type="text" name="surname" value={form.surname} onChange={handleChange}/>
      <input type="email" name="email" value={form.email} onChange={handleChange}/>
    </form>
  );
};

export default TeacherForm;