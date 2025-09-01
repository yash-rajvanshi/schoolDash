"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Events from "./Events";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const EventCalendar = () => {
  const [value, onChange] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/event`);
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

  // Format time for display
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

  return (
    <div className="bg-white p-4 rounded-md">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-20 bg-gray-200 rounded-md"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events available
          </div>
        ) : (
          events.slice(0, 3).map((event) => (
            <div
              className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
              key={event._id}
            >
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-gray-600">{event.title}</h1>
                <span className="text-gray-300 text-xs">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                {event.description || 'No description available'}
              </p>
              {event.location && (
                <p className="mt-2 text-xs text-gray-500">
                  📍 {event.location}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
