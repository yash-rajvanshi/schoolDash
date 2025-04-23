"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

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

const EForm = dynamic(() => import("./forms/EForm.jsx"), {
  loading: () => <h1>Loading...</h1>,
});

const ClassForm = dynamic(() => import("./forms/ClassForm.jsx"), {
  loading: () => <h1>Loading...</h1>,
});

const SubjectForm = dynamic(() => import("./forms/SubjectForm.jsx"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm.jsx"), {
  loading: () => <h1>Loading...</h1>,
});



const forms = {
  teacher: (type, data) => <TeacherForm type={type} data={data}  />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  assignment: (type, data) => <AssignmentForm type={type} data={data} />,
  exam: (type, data) => <EForm type={type} data={data} />,
  announcement: (type, data) => <AnnouncementForm type={type} data={data} />,
  class: (type, data) => <ClassForm type={type} data={data} />,
  subject: (type, data) => <SubjectForm type={type} data={data} />,
  event: (type, data) => <EventForm type={type} data={data} />,

};

const FormModal = ({ table, type, data, id }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);
  
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!id || !table) return;

    try {
      const response = await fetch(`http://localhost:9000/api/${table}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        // alert(`${table} deleted successfully!`);
        // setStudents((prev) => prev.filter((student) => student._id !== id));
        setOpen(false);
        // if (onDeleteSuccess) onDeleteSuccess(id); // notify parent
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
      <form onSubmit={handleDelete} action="" className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data)
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
