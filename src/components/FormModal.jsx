"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-dashboard-l273.onrender.com';

// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
});

const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});

const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});

const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});

const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms = {
  teacher: (type, data, onSuccess) => <TeacherForm type={type} data={data} onSuccess={onSuccess} />,
  student: (type, data, onSuccess) => <StudentForm type={type} data={data} onSuccess={onSuccess} />,
  assignment: (type, data, onSuccess) => <AssignmentForm type={type} data={data} onSuccess={onSuccess} />,
  exam: (type, data, onSuccess) => <ExamForm type={type} data={data} onSuccess={onSuccess} />,
  announcement: (type, data, onSuccess) => <AnnouncementForm type={type} data={data} onSuccess={onSuccess} />,
  class: (type, data, onSuccess) => <ClassForm type={type} data={data} onSuccess={onSuccess} />,
  subject: (type, data, onSuccess) => <SubjectForm type={type} data={data} onSuccess={onSuccess} />,
  event: (type, data, onSuccess) => <EventForm type={type} data={data} onSuccess={onSuccess} />,
};

const FormModal = ({ table, type, data, id, onSuccess, handleDelete }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  
  // Function to handle successful operations and close modal
  const handleSuccess = (result) => {
    setOpen(false);
    if (onSuccess) {
      onSuccess(result);
    }
  };
  
  const handleDeleteAction = async (e) => {
    e.preventDefault();
    if (!id || !table) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/${table}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        // alert(`${table} deleted successfully!`);
        setOpen(false);
        // Call the provided handleDelete function if it exists
        if (handleDelete) {
          handleDelete(id);
        }
        // Call the onSuccess callback if it exists
        if (onSuccess) {
          onSuccess(id);
        }
      } else {
        alert(result.error || "Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred during deletion.");
    }
  };

  const Form = () => {
    return type === "delete" && id ? (
      <form onSubmit={handleDeleteAction} action="" className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data ?? {}, handleSuccess)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;