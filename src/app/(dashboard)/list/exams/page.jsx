"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';
import { PropagateLoader } from "react-spinners";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchExamsFromApi = async (page, limit, setExams, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/exam?page=${page}&limit=${limit}`);
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
    header: "Title",
    accessor: "title",
  },
  {
    header: "Subject",
    accessor: "subjectId.name",
  },
  {
    header: "Class",
    accessor: "classId.name",
  },
  {
    header: "Teacher",
    accessor: "teacherId",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Time",
    accessor: "startTime",
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
      const response = await fetch(`${API_BASE_URL}/api/exam/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        //alert("Exam deleted successfully!");
        setExams((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        //alert(data.error || "Failed to delete Exam.");
      }
    } catch (error) {
      console.error("Error deleting Exam:", error);
      //alert("An error occurred while deleting the Exam.");
    }
  };

  // Add this function to handle any form success (create/update)
  const handleFormSuccess = () => {
    // Re-fetch data after successful create/update
    fetchExamsFromApi(page, limit, setExams, setTotalPages, setLoading);
  };

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.subjectId?.name || 'N/A'}</td>
      <td>{item.classId?.name || 'N/A'}</td>
      <td className="hidden md:table-cell">
        {item.teacherId?.firstName && item.teacherId?.lastName 
          ? `${item.teacherId.firstName} ${item.teacherId.lastName}` 
          : 'N/A'}
      </td>
      <td className="hidden md:table-cell">{formatDate(item.date)}</td>
      <td className="hidden lg:table-cell">{item.startTime || 'N/A'}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher" ) && (
            <>
              <FormModal table="exam" type="update" data={item} onSuccess={handleFormSuccess} />
              <FormModal table="exam" type="delete" id={item._id} handleDelete={() => handleDeleteExam(item._id)} onSuccess={handleFormSuccess} />
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
        <h1 className="text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* <TableSearch /> */}
          <div className="flex items-center gap-4 self-end">
            
            {(role === "admin" || role === "teacher") && (
              <FormModal table="exam" type="create" onSuccess={handleFormSuccess} />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        
        <div className="flex items-center justify-center py-8">
          <PropagateLoader
            color="#6366f1" // Using a more visible color (indigo)
            cssOverride={{}}
            loading
            size={10}
            speedMultiplier={1}
          />
        </div>
      
      ) : (
        <Table columns={columns} renderRow={renderRow} data={exams} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default ExamListPage;