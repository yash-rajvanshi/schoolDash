"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const AnnouncementsT = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/announcement?limit=5`);
      const data = await response.json();
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-l-4 border-red-500  ';
      case 'high':
        return 'bg-orange-100 border-l-4 border-orange-500';
      case 'medium':
        return 'bg-blue-100 border-l-4 border-blue-500';
      case 'low':
        return 'bg-gray-100 border-l-4 border-gray-500';
      default:
        return 'bg-blue-100 border-l-4 border-blue-500';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 bg-red-100 ring-1 ring-red-700';
      case 'high':
        return 'text-orange-700 bg-orange-100 ring-1 ring-orange-700';
      case 'medium':
        return 'text-blue-700 bg-blue-100 ring-1 ring-blue-700';
      case 'low':
        return 'text-gray-700 bg-gray-100 ring-1 ring-gray-700';
      default:
        return 'text-blue-700 bg-blue-100 ring-1 ring-blue-700';
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  
  // Set time to midnight for both dates to compare only the date part
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowOnly - dateOnly;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  console.log("difference"+diffDays);
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays === -1) {
    return "Tomorrow";
  } else if (diffDays > 1 && diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < -1 && diffDays > -3) {
    return `${Math.abs(diffDays)} days from now`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Announcements</h1>
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
    <div className="bg-white p-[0.8rem] rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href='/list/announcements' className='text-xs text-gray-400 '>View All</Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No announcements available
          </div>
        ) : (
          announcements.map((announcement) => (
            <Link href='/list/announcements'
              key={announcement._id} 
              className={`rounded-md p-4 ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{announcement.title}</h2>
                </div>
                <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                  {formatDate(announcement.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {announcement.content}
              </p>
              <div className='flex justify-between'>
                {announcement.classes && announcement.classes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {announcement.classes.map((className, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-white text-gray-600 px-2 py-1 rounded-md border"
                    >
                      {className+" "}
                    </span>
                    
                  ))}
                </div>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(announcement.priority)}`}>
                    {announcement.priority}
              </span>

              </div>
              
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsT;