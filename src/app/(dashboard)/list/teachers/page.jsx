"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/hooks/useAuthHook';
import { PropagateLoader, SyncLoader } from "react-spinners";

const fetchTeachersFromApi = async (page, limit, setTeachers, setTotalPages, setLoading) => {
  try {
    setLoading(true);
    const response = await fetch(`http://localhost:9000/api/teacher?page=${page}&limit=${limit}`);
    const data = await response.json();
    setTeachers(data.teachers);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Error fetching teachers:", error);
  } finally {
    setLoading(false);
  }
};

// Table Columns
const columns = [
  { header: "Info", accessor: "info" },
  { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell" },
  { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
  { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const TeacherListPage = () => {
  // Move ALL hooks to the top of the component
  const { loading: authLoading, user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]); // Initialize as empty array
  const [subjects, setSubjects] = useState([]); // Initialize subjects as empty array
  const [classesLoading, setClassesLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true); // Loading state for subjects
  const [query, setQuery] = useState("");
  const [role, setRole] = useState('');
  const limit = 10;

  // Fetch classes data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const res = await fetch("http://localhost:9000/api/class");
        const data = await res.json();
        // Make sure we're setting an array
        setClasses(Array.isArray(data) ? data : (data.classes || []));
      } catch (error) {
        console.error("Failed to fetch classes", error);
        setClasses([]); // Set to empty array on error
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch subjects data
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);
        const res = await fetch("http://localhost:9000/api/subject");
        const data = await res.json();
        // Make sure we're setting an array
        setSubjects(Array.isArray(data) ? data : (data.subjects || []));
      } catch (error) {
        console.error("Failed to fetch subjects", error);
        setSubjects([]); // Set to empty array on error
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Modified function to handle both single ID and array of IDs for classes
  const getClassName = (idOrIds) => {
    if (!Array.isArray(classes)) {
      return "Loading...3";
    }

    // Handle array of IDs
    if (Array.isArray(idOrIds)) {
      return idOrIds.map(id => {
        const foundClass = classes.find((t) => t && t._id === id);
        return foundClass ? foundClass.name : "Unknown";
      }).join(", ");
    }

    // Handle comma-separated string of IDs
    if (typeof idOrIds === 'string' && idOrIds.includes(',')) {
      const idArray = idOrIds.split(',').map(id => id.trim());
      return idArray.map(id => {
        const foundClass = classes.find((t) => t && t._id === id);
        return foundClass ? foundClass.name : "Unknown";
      }).join(", ");
    }

    // Handle single ID (original functionality)
    const foundClass = classes.find((t) => t && t._id === idOrIds);
    return foundClass ? `${foundClass.name}` : "Unknown";
  };

  // Function to get subject names from subject IDs
  const getSubjectName = (idOrIds) => {
    if (!Array.isArray(subjects)) {
      return "Loading...1";
    }

    // Handle array of IDs
    if (Array.isArray(idOrIds)) {
      return idOrIds.map(id => {
        const foundSubject = subjects.find((s) => s && s._id === id);
        return foundSubject ? foundSubject.name : "Unknown";
      }).join(", ");
    }

    // Handle comma-separated string of IDs
    if (typeof idOrIds === 'string' && idOrIds.includes(',')) {
      const idArray = idOrIds.split(',').map(id => id.trim());
      return idArray.map(id => {
        const foundSubject = subjects.find((s) => s && s._id === id);
        return foundSubject ? foundSubject.name : "Unknown";
      }).join(", ");
    }

    // Handle single ID
    const foundSubject = subjects.find((s) => s && s._id === idOrIds);
    return foundSubject ? `${foundSubject.name}` : "Unknown";
  };

  // Effects should be after all hooks but before any returns
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (role === 'admin' || role === 'teacher') {
      fetchTeachersFromApi(page, limit, setTeachers, setTotalPages, setLoading);
    }
  }, [page, role]);

  const handleCreateTeacher = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      const response = await fetch("http://localhost:9000/api/teacher", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Teacher created successfully!");
        fetchTeachersFromApi(page, limit, setTeachers, setTotalPages, setLoading);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to create Teacher.");
      }
    } catch (error) {
      console.error("Error creating Teacher:", error);
      alert("An error occurred while creating the Teacher.");
    }
  };

  const handleDeleteTeacher = (id) => {
    // Immediately update the UI by removing the item
    setTeachers((prev) => prev.filter((item) => item._id !== id));
    
    // Check if we should go to the previous page
    if (teachers.length === 1 && page > 1) {
      setPage(prev => prev - 1);
    } else {
      // Re-fetch data to ensure consistency
      fetchTeachersFromApi(page, limit, setTeachers, setTotalPages, setLoading);
    }
  };
  
  // Add this function to handle any form success (create/update)
  const handleFormSuccess = () => {
    // Re-fetch data after successful create/update
    fetchTeachersFromApi(page, limit, setTeachers, setTotalPages, setLoading);
  };

  const renderRow = (teacher) => (
    <tr key={teacher._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ySkyLight">
      <td className="flex items-center gap-4 p-4">
        <Image
          src={teacher.photo || "/noavatar.png"} alt="Teacher Photo" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <h3 className="font-semibold">{teacher.firstName}</h3>
          <span className="text-gray-500 text-xs">
            {subjectsLoading ? "Loading...4" : getSubjectName(teacher.subjects)}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell">{teacher.teacherId}</td>
      <td className="hidden md:table-cell">
        {subjectsLoading ? "Loading...5" : getSubjectName(teacher.subjects)}
      </td>
      <td className="hidden md:table-cell">
        {classesLoading ? "Loading...6" : getClassName(teacher.classes.join(","))}
      </td>
      <td className="hidden lg:table-cell">{teacher.phone}</td>
      <td className="hidden lg:table-cell">{teacher.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${teacher._id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormModal
              table="teacher"
              type="delete"
              id={teacher._id}
              handleDelete={handleDeleteTeacher}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      </td>
    </tr>
  );

  // Handle conditional rendering here, after all hooks
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SyncLoader
          color="#6366f1"
          margin={5}
          size={10}
          speedMultiplier={0.8}
        />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return <p className="text-center mt-10">Access denied</p>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yPurple">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yPurple">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="teacher" type="create" data={{ onCreate: handleCreateTeacher }} />}
          </div>
        </div>
      </div>

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
        <Table columns={columns} renderRow={renderRow} data={teachers} />
      )}

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default TeacherListPage;