"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// TEMPORARY
const events = [
  {
    id: 1,
    title: "Annual Science Fair",
    time: "10:00 AM - 3:00 PM",
    description: "Students showcase innovative science projects. Open to parents and community members. Judges from local universities will award prizes.",
  },
  {
    id: 2,
    title: "Spring Band Concert",
    time: "7:00 PM - 9:00 PM",
    description: "Join us for an evening of music featuring performances by the jazz band, concert band, and orchestra in the main auditorium.",
  },
  {
    id: 3,
    title: "Parent-Teacher Conferences",
    time: "4:00 PM - 8:00 PM",
    description: "Schedule appointments with your child's teachers to discuss academic progress and address any concerns.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState(new Date());

  return (
    <div className="bg-white p-4 rounded-md">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-300 text-xs">{event.time}</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
