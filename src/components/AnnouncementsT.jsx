import React from 'react';

const AnnouncementsT = () => {
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-lamaSkyLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Final Grade Submission Deadline</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-22
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Please submit all final grades through the faculty portal by May 15th. Contact the registrar's office if you need an extension or assistance with the grading system.
          </p>
        </div>
        <div className="bg-lamaPurpleLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Professional Development Workshop</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-18
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Join us on May 2nd for a workshop on "Integrating AI Tools in the Classroom." All faculty members are encouraged to attend. Lunch will be provided and attendance counts toward required PD hours.
          </p>
        </div>
        <div className="bg-lamaYellowLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Fall Course Scheduling Reminder</h2>
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              2025-04-24
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Department chairs: Please submit your Fall 2025 course schedules and faculty assignments by May 10th. The new scheduling system requires additional lead time for classroom assignments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsT;