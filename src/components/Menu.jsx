"use client";

import { useAuth } from '@/app/hooks/useAuthHook';
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/admin",
        visible: ["admin"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/teacher",
        visible: ["teacher"],
      },
      {
        icon: "/home.png",
        label: "Home",
        href: "/student",
        visible: ["student"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
     
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: [],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: [],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: [],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      // {
      //   icon: "/profile.png",
      //   label: "Sign In",
      //   href: "/sign-in",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        action: "logout", // Added action identifier
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = () => {
  // Use the auth hook to get user information and logout function
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState('');
  const router = useRouter();
  
  // Update userRole when user changes
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user]);

  // Handle logout action
  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      await logout(); // Call the logout function from your auth hook
      // router.push('/sign-in'); // Redirect to sign-in page
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // If no role is available yet, show a minimal loading state
  if (!userRole) {
    return <div className="mt-4 text-sm">Loading menu...</div>;
  }

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            // Only render menu items that are visible to the current user role
            if (item.visible.includes(userRole)) {
              // Check if this is the logout item
              if (item.action === "logout") {
                return (
                  <a
                    href="#"
                    key={item.label}
                    onClick={handleLogout}
                    className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight cursor-pointer"
                  >
                    <Image src={item.icon} alt="" width={20} height={20} />
                    <span className="hidden lg:block">{item.label}</span>
                  </a>
                );
              }
              
              // Regular menu items
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null; // Important to return null for items that don't match
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;