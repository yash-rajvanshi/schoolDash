"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';

const fetchExamsFromApi = async (page, limit, setExams, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/exam?page=${page}&limit=${limit}`);
    const data = await response.json();
    setExams(data.exams);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching exams:", error);
  } finally {
    setLoading(false);
  }
};

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ExamListPage = () => {
  const { loading: authLoading, user } = useAuth();
  const [role, setRole] = useState('');
  const [exams, setExams] = useState([]);
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
      fetchExamsFromApi(page, limit, setExams, setTotalPages, setLoading);
    }
  }, [page, role]);

  const handleDeleteExam = async (id) => {
    try {
      const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/exam/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Exam deleted successfully!");
        setExams((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete Exam.");
      }
    } catch (error) {
      console.error("Error deleting Exam:", error);
      alert("An error occurred while deleting the Exam.");
    }
  };

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.subject}</td>
      <td>{item.class}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{new Date(item.date).toLocaleDateString()}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher" ) && (
            <>
              <FormModal table="exam" type="update" data={item} />
              <FormModal table="exam" type="delete" id={item._id} handleDelete={() => handleDeleteExam(item._id)} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
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
              <FormModal table="exam" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <p className="mt-6">Loading exams...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={exams} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default ExamListPage;