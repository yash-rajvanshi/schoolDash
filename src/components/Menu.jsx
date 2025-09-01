"use client";

import { useAuth } from '@/app/hooks/useAuthHook';
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

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
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        action: "logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = () => {
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState('');

  const router = useRouter();
  const pathName = usePathname();
  
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      // router.push('/sign-in');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

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
            if (item.visible.includes(userRole)) {
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
              
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition 
                    ${pathName.startsWith(item.href) 
                      ? "bg-[#FAE27C] text-black " 
                      : "text-gray-500 hover:bg-lamaSkyLight"}`}
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;