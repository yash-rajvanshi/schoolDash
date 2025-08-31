"use client";

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/event?limit=5`);
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'academic':
        return 'bg-blue-100 border-l-4 border-blue-500';
      case 'sports':
        return 'bg-green-100 border-l-4 border-green-500';
      case 'cultural':
        return 'bg-purple-100 border-l-4 border-purple-500';
      case 'other':
        return 'bg-gray-100 border-l-4 border-gray-500';
      default:
        return 'bg-blue-100 border-l-4 border-blue-500';
    }
  };

  const getEventTypeBadge = (eventType) => {
    switch (eventType) {
      case 'academic':
        return 'text-blue-700 bg-blue-100';
      case 'sports':
        return 'text-green-700 bg-green-100';
      case 'cultural':
        return 'text-purple-700 bg-purple-100';
      case 'other':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-blue-700 bg-blue-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Events</h1>
          <span className="text-xs text-gray-400">View All</span>
        </div>
        <div className="mt-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-20 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Events</h1>
        <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events available
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event._id} 
              className={`rounded-md p-4 ${getEventTypeColor(event.eventType)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{event.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEventTypeBadge(event.eventType)}`}>
                    {event.eventType}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                  {formatDate(event.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {event.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
                {event.location && (
                  <span className="bg-white px-2 py-1 rounded-md border">
                    📍 {event.location}
                  </span>
                )}
              </div>
              {event.classId && (
                <div className="mt-2">
                  <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded-md border">
                    {event.classId.name}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
