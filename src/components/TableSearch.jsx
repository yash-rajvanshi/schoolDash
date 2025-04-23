"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const TableSearch = ({ entityType, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Define search fields for each entity type
  const searchFields = {
    teacher: [
      { value: "all", label: "All Fields" },
      { value: "firstName", label: "First Name" },
      { value: "lastName", label: "Last Name" },
      { value: "email", label: "Email" },
      { value: "subject", label: "Subject" }
    ],
    student: [
      { value: "all", label: "All Fields" },
      { value: "firstName", label: "First Name" },
      { value: "lastName", label: "Last Name" },
      { value: "email", label: "Email" },
      { value: "grade", label: "Grade" }
    ],
    class: [
      { value: "all", label: "All Fields" },
      { value: "name", label: "Class Name" },
      { value: "grade", label: "Grade" },
      { value: "capacity", label: "Capacity" }
    ],
    event: [
      { value: "all", label: "All Fields" },
      { value: "title", label: "Title" },
      { value: "date", label: "Date" },
      { value: "className", label: "Class" }
    ],
    announcement: [
      { value: "all", label: "All Fields" },
      { value: "title", label: "Title" },
      { value: "content", label: "Content" },
      { value: "author", label: "Author" }
    ]
  };

  // Set default fields based on entity type
  useEffect(() => {
    const fields = searchFields[entityType] || searchFields.class;
    setSearchField(fields[0].value);
  }, [entityType]);

  // Handle input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    console.log("Search term changed:", value);
    
    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set a new timeout to trigger search after typing stops
  const timeout = setTimeout(() => {
    if (onSearch) {
      console.log("Calling onSearch with:", { term: value, field: searchField });
      onSearch({
        term: value,
        field: searchField
      });
    }
  }, 500); // 500ms debounce
    
    setDebounceTimeout(timeout);
  };

  // Handle field change
  const handleFieldChange = (e) => {
    const field = e.target.value;
    setSearchField(field);
    
    // Immediately trigger search with new field
    if (onSearch && searchTerm) {
      onSearch({
        term: searchTerm,
        field: field
      });
    }
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch({
        term: "",
        field: searchField
      });
    }
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 relative">
      <Image src="/search.png" alt="Search" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
      
      {searchTerm && (
        <button 
          onClick={handleClearSearch}
          className="absolute right-16 text-gray-400 hover:text-gray-600"
        >
          <span className="text-xs">✕</span>
        </button>
      )}
      
      <select
        value={searchField}
        onChange={handleFieldChange}
        className="text-xs border-none bg-transparent outline-none cursor-pointer"
      >
        {(searchFields[entityType] || searchFields.class).map(field => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableSearch;