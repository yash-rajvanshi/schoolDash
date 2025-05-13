"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';

// This function doesn't use hooks, so it can stay outside the component
const fetchClasssFromApi = async (page, limit, setClasss, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/class?page=${page}&limit=${limit}`);
    const data = await response.json();
    setClasss(data.classes);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching classes:", error);
  } finally {
    setLoading(false);
  }
};

const ClassListPage = () => {
  const { loading: authLoading, user } = useAuth();
  const [role, setRole] = useState('');
  const [classes, setClasss] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]); // Initialize as empty array
  const [teachersLoading, setTeachersLoading] = useState(true);
  const limit = 10;

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        const res = await fetch("https://backend-dashboard-sy1c.onrender.com/api/teacher");
        const data = await res.json();
        // Make sure we're setting an array
        setTeachers(Array.isArray(data) ? data : (data.teachers || []));
      } catch (error) {
        console.error("Failed to fetch teachers", error);
        setTeachers([]); // Set to empty array on error
      } finally {
        setTeachersLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Helper function with array check
  const getSupervisorName = (id) => {
    if (!Array.isArray(teachers)) {
      return "Loading...";
    }
    const teacher = teachers.find((t) => t && t._id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";
  };

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (role === 'admin' || role === 'teacher' || role === 'student') {
      fetchClasssFromApi(page, limit, setClasss, setTotalPages, setLoading);
    }
  }, [page, role]);

  const handleDeleteClass = async (id) => {
    try {
      const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/class/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Class deleted successfully!");
        setClasss((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete Class.");
      }
    } catch (error) {
      console.error("Error deleting Class:", error);
      alert("An error occurred while deleting the Class.");
    }
  };

  const columns = [
    {
      header: "Class Name",
      accessor: "name",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.name}</td>
      <td>{item.capacity}</td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden md:table-cell">
        {teachersLoading ? "Loading..." : getSupervisorName(item.supervisorId)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="class" type="update" data={item} />
              <FormModal table="class" type="delete" id={item._id} handleDelete={() => handleDeleteClass(item._id)} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (authLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (user?.role !== 'admin' && user?.role !== 'teacher' && user?.role !== 'student') {
    return <p className="text-center mt-10">Access denied</p>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal table="class" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <p className="mt-6">Loading classes...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={classes} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default ClassListPage;