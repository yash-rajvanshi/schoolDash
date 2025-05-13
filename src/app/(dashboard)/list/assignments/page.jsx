"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';

const fetchAssignmentsFromApi = async (page, limit, setAssignments, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/assignment?page=${page}&limit=${limit}`);
    const data = await response.json();
    setAssignments(data.assignments);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching assignments:", error);
  } finally {
    setLoading(false);
  }
};

const columns = [
  { header: "Subject", accessor: "subject" },
  { header: "Class", accessor: "class" },
  { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
  { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const AssignmentListPage = () => {
  const { loading: authLoading, user } = useAuth();
  const [role, setRole] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (role === 'admin' || role === 'teacher' || role === 'student' ) {
      fetchAssignmentsFromApi(page, limit, setAssignments, setTotalPages, setLoading);
    }
  }, [page, role]);

  const handleDeleteAssignment = async (id) => {
    try {
      const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/assignment/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Assignment deleted successfully!");
        setAssignments((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete assignment.");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("An error occurred while deleting the assignment.");
    }
  };

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.subject}</td>
      <td>{item.class}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.dueDate}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher" ) && (
            <>
              <FormModal table="assignment" type="update" data={item} />
              <FormModal table="assignment" type="delete" id={item._id} handleDelete={() => handleDeleteAssignment(item._id)} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
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
              <FormModal table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <p className="mt-6">Loading assignments...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={assignments} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default AssignmentListPage;