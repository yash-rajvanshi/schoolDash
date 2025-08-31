"use client";

import React, { useState, useEffect } from 'react';

const AnnouncementsT = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('https://backend-dashboard-l273.onrender.com/api/announcement?limit=5');
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
        return 'bg-red-100 border-l-4 border-red-500';
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
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-blue-700 bg-blue-100';
      case 'low':
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

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Announcements</h1>
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
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No announcements available
          </div>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement._id} 
              className={`rounded-md p-4 ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{announcement.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-white rounded-md px-1 py-1">
                  {formatDate(announcement.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {announcement.content}
              </p>
              {announcement.classes && announcement.classes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {announcement.classes.map((className, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-white text-gray-600 px-2 py-1 rounded-md border"
                    >
                      {className}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsT;