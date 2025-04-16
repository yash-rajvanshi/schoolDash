"use client";

import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { role } from "@/lib/data";

// ✅ Fetch Teachers
const fetchTeachersFromApi = async (setTeachers, setLoading) => {
  try {
    const response = await fetch("http://localhost:9000/api/teacher");
    const data = await response.json();
    setTeachers(data);
  } catch (error) {
    console.error("Error fetching teachers:", error);
  } finally {
    setLoading(false);
  }
};

// ✅ Table Columns
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
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");    // For search functionality
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchTeachersFromApi(setTeachers, setLoading);
  }, []);

  // ✅ Search filter
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(query.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const displayedTeachers = filteredTeachers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // ✅ Render each row
  const renderRow = (teacher) => (
    <tr key={teacher._id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ySkyLight">
      <td className="flex items-center gap-4 p-4">
        <Image 
          src={teacher.photo || "/noavatar.png"} 
          alt="Teacher Photo" 
          width={40} 
          height={40} 
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover" 
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{teacher.name}</h3>
          <span className="text-gray-500 text-xs">{teacher.subjects.join(", ")}</span>
        </div>
      </td>
      <td className="hidden md:table-cell">{teacher.teacherId}</td>
      <td className="hidden md:table-cell">{teacher.subjects.join(", ")}</td>
      <td className="hidden md:table-cell">{teacher.classes.join(", ")}</td>
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
              handleDelete={() => fetchTeachersFromApi(setTeachers, setLoading)}
            />
          )}
        </div>
      </td>
    </tr>
  );

  // return (
  //   <div className="p-4">
  //     <div className="flex justify-between items-center mb-4">
  //       <h1 className="text-2xl font-semibold">Teachers</h1>
  //       <FormModal 
  //         table="teacher" 
  //         type="create" 
  //         refetch={() => fetchTeachersFromApi(setTeachers, setLoading)} 
  //       />
  //     </div>

  //     {/* <TableSearch 
  //       placeholder="Search by name or ID..." 
  //       setQuery={setQuery} 
  //     /> */}

  //     <Table 
  //       columns={columns} 
  //       data={displayedTeachers} 
  //       renderRow={renderRow} 
  //     />

  //     <Pagination 
  //       page={page} 
  //       setPage={setPage} 
  //       totalPages={totalPages} 
  //     />
  //   </div>
  // );
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
            {/* {role === "admin" && <FormModal table="teacher" type="create" data={{ onCreate: handleCreateTeacher }} />} */}
          </div>
        </div>
      </div>

      {loading ? <p>Loading teachers...</p> : <Table columns={columns} renderRow={renderRow} data={teachers} />}

      <Pagination />
    </div>
  );
};

export default TeacherListPage;