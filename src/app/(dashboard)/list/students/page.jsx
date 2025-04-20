"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/hooks/useAuthHook'; //for role
// import fetchWithAuth from "@/app/lib/api";

const fetchStudentsFromApi = async (page, limit, setStudents, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:9000/api/student?page=${page}&limit=${limit}`); //fetchWithAuth can be used
    const data = await response.json();
    setStudents(data.students);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching students:", error);
  } finally {
    setLoading(false);
  }
};

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
  { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const StudentlistPage = () => {
  // Move ALL hooks to the top before any conditional logic
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [students, setStudents] = useState([]);
  const limit = 10;
  
  // Move role state here
  const [role, setRole] = useState(''); //for role
  
  // Effects also need to be before any returns
  useEffect(() => {
    if (user?.role) {
      setRole(user.role); //for role
    }
  }, [user]);
  
  useEffect(() => {
    // Only fetch data if user is admin
    if (role === 'admin' || role === 'teacher') {
      fetchStudentsFromApi(page, limit, setStudents, setTotalPages, setLoading); //for role
    }
  }, [page, role]);

  const handleCreateStudent = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      const response = await fetch("http://localhost:9000/api/student", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Student created successfully!");
        fetchStudentsFromApi(page, limit, setStudents, setTotalPages, setLoading);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to create student.");
      }
    } catch (error) {
      console.error("Error creating student:", error);
      alert("An error occurred while creating the student.");
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const response = await fetch(`http://localhost:9000/api/student/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Student deleted successfully!");
        setStudents((prev) => prev.filter((student) => student._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete student.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("An error occurred while deleting the student.");
    }
  };

  const renderRow = (student) => (
    <tr key={student._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ySkyLight">
      <td className="flex items-center gap-4 p-4">
        <Image src={student.photo} alt="Student Photo" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <h3 className="font-semibold">{student.firstName}</h3>
          <span className="text-gray-500 text-xs">{student.class}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">{student.studentId}</td>
      <td className="hidden md:table-cell">{student.grade}</td>
      <td className="hidden lg:table-cell">{student.phone}</td>
      <td className="hidden lg:table-cell">{student.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${student._id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} className="rounded-full" />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal
              table="student"
              type="delete"
              id={student._id}
              handleDelete={() => handleDeleteStudent(student._id)}
            />
          )}
        </div>
      </td>
    </tr>
  );

  // Handle conditional rendering in the return statement instead of early returns
  if (authLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }
  
  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return <p className="text-center mt-10">Access denied</p>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yPurple">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yPurple">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="student" type="create" data={{ onCreate: handleCreateStudent }} />}
          </div>
        </div>
      </div>

      {loading ? <p>Loading students...</p> : <Table columns={columns} renderRow={renderRow} data={students} />}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default StudentlistPage;