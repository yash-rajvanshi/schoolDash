'use client';
import Announcements from "@/components/AnnouncementsT"
import AttendanceChart from "@/components/AttendanceChart"
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import UserCard from "@/components/UserCard";

import { useAuth } from '@/app/hooks/useAuthHook';

// console.log('typeof useAuth:', typeof useAuth);
function AdminPage() {
  const { loading , user } = useAuth();
  if (user?.role !== 'admin') return <p className="text-center mt-10">Access denied</p>;

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT + MIDDLE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            {/* <AttendanceChart /> */}
            <Announcements />
          </div>
        </div>
      </div>

      {/* RIGHT – scrolls independently */}
      <div className="w-full lg:w-1/3 h-screen overflow-y-auto sticky top-0 pr-2 flex flex-col gap-8">
        <EventCalendar />
      </div>
    </div>
  );
}

export default AdminPage;
