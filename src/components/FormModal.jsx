"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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
  const size = type === "create" ? "w-7 h-7 md:w-10 md:h-10" : "w-7 h-7 md:w-8 md:h-8";
  const bgColor =
    type === "create"
      ? "bg-[#40cf64]"
      : type === "update"
      ? "bg-[#fbc75b]"
      : "bg-[#fc6e68]";

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
        // //alert(`${table} deleted successfully!`);
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
        //alert(result.error || "Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      //alert("An error occurred during deletion.");
    }
  };

  const Form = () => {
    return type === "delete" && id ? (
      <form onSubmit={handleDeleteAction} action="" className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
        <span className="text-center font-medium text-sm md:text-base">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md border-none text-sm md:text-base font-medium transition-colors duration-200"
          >
            Delete
          </button>
          <button 
            type="button"
            onClick={() => setOpen(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md border-none text-sm md:text-base font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
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
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <Form />
            </div>
            <button
              className="absolute top-3 right-3 md:top-4 md:right-4 cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setOpen(false)}
              aria-label="Close modal"
            >
              <Image src="/close.png" alt="Close" width={16} height={16} className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;