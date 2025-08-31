"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-dashboard-l273.onrender.com';

const fetchAnnouncementsFromApi = async (page, limit, setAnnouncements, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/announcement?page=${page}&limit=${limit}`);
    const data = await response.json();
    setAnnouncements(data.announcements);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching announcements:", error);
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
    header: "Concerned",
    accessor: "classes",
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

const AnnouncementListPage = () => {
  const { loading: authLoading, user } = useAuth();
  const [role, setRole] = useState('');
  const [announcements, setAnnouncements] = useState([]);
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
      fetchAnnouncementsFromApi(page, limit, setAnnouncements, setTotalPages, setLoading);
    }
  }, [page, role]);

  const handleDeleteAnnouncement = (id) => {
    // Immediately update the UI by removing the item
    setAnnouncements((prev) => prev.filter((item) => item._id !== id));
    
    // Check if we should go to the previous page
    if (announcements.length === 1 && page > 1) {
      setPage(prev => prev - 1);
    } else {
      // Re-fetch data to ensure consistency
      fetchAnnouncementsFromApi(page, limit, setAnnouncements, setTotalPages, setLoading);
    }
  };

  const handleFormSuccess = () => {
    // Re-fetch data after successful create/update
    fetchAnnouncementsFromApi(page, limit, setAnnouncements, setTotalPages, setLoading);
  };

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.classes}</td>
      <td className="hidden md:table-cell">{new Date(item.date).toLocaleDateString()}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher" ) && (
            <>
              <FormModal 
                table="announcement" 
                type="update" 
                data={item} 
                onSuccess={handleFormSuccess}
              />
              <FormModal 
                table="announcement" 
                type="delete" 
                id={item._id} 
                handleDelete={handleDeleteAnnouncement}
                onSuccess={handleFormSuccess}
              />
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
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
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
              <FormModal 
                table="announcement" 
                type="create" 
                onSuccess={handleFormSuccess}
              />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <p className="mt-6">Loading announcements...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={announcements} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default AnnouncementListPage;