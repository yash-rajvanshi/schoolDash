"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';

// This function doesn't use hooks, so it can stay outside the component
const fetchEventsFromApi = async (page, limit, searchParams, setEvents, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    
    // Build query string for search parameters
    let queryString = `page=${page}&limit=${limit}`;
    if (searchParams?.term) {
      queryString += `&searchTerm=${searchParams.term}&searchField=${searchParams.field}`;
    }
    
    const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/event?${queryString}`);
    const data = await response.json();
    setEvents(data.events);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    setLoading(false);
  }
};

const EventListPage = () => {
  const { loading: authLoading, user } = useAuth();
  const [role, setRole] = useState('');
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState(null);
  const limit = 10;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time for display (HH:MM format without timezone)
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    
    // If timeString is already in HH:MM format, return it as is
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString;
    }
    
    // Otherwise, parse as Date and format
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeString; // Return original if parsing fails
    }
  };

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (role === 'admin' || role === 'teacher' || role === 'student') {
      fetchEventsFromApi(page, limit, searchParams, setEvents, setTotalPages, setLoading);
    }
  }, [page, role, searchParams]);

  // Handle search
  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(1); // Reset to first page when searching
  };

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`https://backend-dashboard-sy1c.onrender.com/api/event/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully!");
        setEvents((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete Event.");
      }
    } catch (error) {
      console.error("Error deleting Event:", error);
      alert("An error occurred while deleting the Event.");
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item) => (
    <tr key={item._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.title}</td>
      <td className="hidden md:table-cell">{formatDate(item.date)}</td>
      <td className="hidden md:table-cell">{formatTime(item.startTime)}</td>
      <td className="hidden md:table-cell">{formatTime(item.endTime)}</td>
      <td className="hidden md:table-cell">
        {item.classId ? item.classId.name : "None"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal table="event" type="update" data={item} />
              <FormModal table="event" type="delete" id={item._id} handleDelete={() => handleDeleteEvent(item._id)} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch entityType="event" onSearch={handleSearch} />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <p className="mt-6">Loading events...</p>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={events} />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default EventListPage;