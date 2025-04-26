'use client';

import Image from "next/image";
import { useAuth } from '@/app/hooks/useAuthHook';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const items = [
  { icon: "/home.png", label: "Home", href: "/admin", visible: ["admin", "teacher", "student", "parent"] },
  { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
  { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
  { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
  { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
  { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
  { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: [] },
  { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
  { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: [] },
  { icon: "/result.png", label: "Results", href: "/list/results", visible: [] },
  { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
  { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
];

const Navbar = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const router = useRouter();

  // Filter items based on user role and search term
  const filteredItems = items.filter(item => 
    item.visible.includes(user?.role) && 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle key navigation in dropdown
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!isDropdownOpen && searchTerm) {
        setIsDropdownOpen(true);
      } else if (filteredItems.length > 0) {
        router.push(filteredItems[selectedIndex].href);
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : 0);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Handle input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(e.target.value !== "");
    setSelectedIndex(0); // Reset selection when search changes
  };

  // Handle item click
  const handleItemClick = (href) => {
    router.push(href);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  if (loading) return null; // Or show a loading spinner

  return (
    <div className='flex items-center justify-between p-4 relative'>
      {/* SEARCH BAR */}
      <div 
        ref={searchRef}
        className='hidden md:flex flex-col items-start gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 relative'
      >
        <div className="flex items-center gap-2">
          <Image src="/search.png" alt="" width={14} height={14} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onClick={() => searchTerm && setIsDropdownOpen(true)}
            className="w-[200px] p-2 bg-transparent outline-none" 
          />
        </div>

        {/* Dropdown list */}
        {isDropdownOpen && filteredItems.length > 0 && (
          <div className="absolute top-9 left-0 w-full bg-white shadow-lg rounded-md py-2 z-10">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(item.href)}
                className={`flex items-center gap-2 p-2 cursor-pointer ${
                  index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                } text-gray-700`}
              >
                <Image src={item.icon} alt={item.label} width={16} height={16} />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* No results found */}
        {isDropdownOpen && searchTerm && filteredItems.length === 0 && (
          <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-md py-2 z-10 text-center text-gray-400 text-sm">
            No results found
          </div>
        )}
      </div>

      {/* ICONS AND USER */}
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>1</div>
        </div>
        <div className='flex flex-col'>
          <span className="text-xs leading-3 font-medium">{user ? `${user.firstName} ${user.lastName}` : "User"}</span>
          <span className="text-[10px] text-gray-500 text-right">{user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}</span>
        </div>
        <Image
          src={user ? user.photo : '/avatar.png'}
          alt=""
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover"
        />
      </div>
    </div>
  );
};

export default Navbar;