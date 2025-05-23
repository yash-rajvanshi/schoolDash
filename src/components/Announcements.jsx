import React from 'react';

const AnnouncementsS = () => {
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-lamaSkyLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Final Exam Schedule Released</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-15
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            The Spring 2025 final exam schedule is now available. Please check your student portal for your personalized exam timetable and classroom locations.
          </p>
        </div>
        <div className="bg-lamaPurpleLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Campus Career Fair Next Week</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-20
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Don't miss the Spring Career Fair on April 30th! Over 50 companies will be recruiting for internships and full-time positions. Bring your resume and dress professionally.
          </p>
        </div>
        <div className="bg-lamaYellowLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Library Hours Extended for Finals</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-22
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Starting May 1st, the main library will be open 24/7 during finals week. Study rooms can be reserved online up to 3 days in advance. Free coffee service from 8PM-6AM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsS;