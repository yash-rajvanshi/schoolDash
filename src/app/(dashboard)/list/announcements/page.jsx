"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';
import { PropagateLoader } from "react-spinners";
import AnnouncementViewEdit from "@/components/AnnouncementView"; // Import the new component

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
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

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const handleUpdateAnnouncement = (updatedAnnouncement) => {
    // Update the announcement in the list
    setAnnouncements(prev => 
      prev.map(ann => ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann)
    );
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAnnouncement(null);
  };

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">
        <button
          onClick={() => handleViewAnnouncement(item)}
          className="text-left hover:text-blue-600 transition-colors cursor-pointer"
        >
          {item.title}
        </button>
      </td>
      <td>
        {Array.isArray(item.classes) ? (
          <div className="flex flex-wrap gap-1">
            {item.classes.slice(0, 3).map((className, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {className}
              </span>
            ))}
            {item.classes.length > 3 && (
              <span className="text-xs text-gray-500">+{item.classes.length - 3} more</span>
            )}
          </div>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            {item.classes}
          </span>
        )}
      </td>
      <td className="hidden md:table-cell">{formatDate(item.date)}</td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewAnnouncement(item)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 hover:bg-sky-200 transition-colors"
            title="View Details"
          >
            <Image src="/view.png" alt="View" width={20} height={20} className="rounded-full"/>
          </button>
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
        <h1 className="text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-1/2 md:w-auto">
          <div className="flex items-center gap-4 self-end">
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
        <Table columns={columns} renderRow={renderRow} data={announcements} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* View/Edit Modal */}
      {showViewModal && selectedAnnouncement && (
        <AnnouncementViewEdit
          announcement={selectedAnnouncement}
          onClose={closeViewModal}
          onUpdate={handleUpdateAnnouncement}
        />
      )}
    </div>
  );
};

export default AnnouncementListPage;