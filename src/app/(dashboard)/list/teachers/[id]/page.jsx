"use client";

import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import Performance from '@/components/Performance';
import FormModal from '@/components/FormModal';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { role } from '@/lib/data';

const SingleTeacherPage = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:9000/api/teacher/${id}`);
        if (!res.ok) throw new Error("Teacher not found");

        const data = await res.json();
        setTeacher(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTeacher();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const attendanceValue = teacher?.attendance || "N/A";
  const gradeValue = teacher?.grade || "N/A";
  const resultsCount = teacher?.results?.length ?? 0;
  const classValue = teacher?.classes || "N/A";

  return (
    <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
      <div className='w-full xl:w-2/3'>
        <div className='flex flex-col lg:flex-row gap-4'>
          <div className='bg-ySky py-6 px-4 rounded-md flex-1 flex gap-4'>
            <div className='w-1/3'>
              <Image
                src={teacher?.photo || "/default-user.png"}
                alt={teacher?.name || "Teacher Photo"}
                width={144}
                height={144}
                className='w-36 h-36 rounded-full object-cover'
              />
            </div>
            <div className='w-2/3 flex flex-col justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <h1 className='text-xl font-semibold'>{teacher?.name} {teacher?.surname}</h1>
                {role === "admin" && (
                  <FormModal
                    table="teacher"
                    type="update"
                    data={teacher}
                  />
                )}
              </div>
              <p className='text-sm text-gray-500 '>{teacher?.address}</p>
              <div className='flex items-center justify-between gap-2 flex-wrap text-xs font-medium'>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src="/blood.png" alt='' width={14} height={14} />
                  <span>{teacher?.bloodType}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src="/date.png" alt='' width={14} height={14} />
                  <span>{teacher?.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src="/mail.png" alt='' width={14} height={14} />
                  <span>{teacher?.email}</span>
                </div>
                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                  <Image src="/phone.png" alt='' width={14} height={14} />
                  <span>{teacher?.phone}</span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex-1 flex gap-4 justify-between flex-wrap'>
            <div className='bg-white rounded-md p-4 flex w-full gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleAttendance.png' alt="" width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>{attendanceValue}</h1>
                <span className='text-sm text-gray-400'>Attendance Records</span>
              </div>
            </div>
            <div className='bg-white rounded-md p-4 flex w-full gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleBranch.png' alt="" width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>{gradeValue}</h1>
                <span className='text-sm text-gray-400'>Grade</span>
              </div>
            </div>
            <div className='bg-white rounded-md p-4 flex w-full gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleLesson.png' alt="" width={24} height={24} className='w-6 h-6' />
              <div>
                <h1 className='text-xl font-semibold'>{resultsCount}</h1>
                <span className='text-sm text-gray-400'>Results</span>
              </div>
            </div>
            <div className='bg-white rounded-md p-4 flex w-full gap-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]'>
              <Image src='/singleClass.png' alt="" width={24} height={24} className='w-6 h-6' />
              <div>
                <div className="flex flex-wrap gap-2">
                  {classValue.map((classItem, index) => (
                    <h1 key={index} className="text-xl font-semibold">
                      {classItem}
                    </h1>
                  ))}
                </div>
                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4 bg-white rounded-md p-4 h-[800px]'>
          <h1>Teacher's Schedule</h1>
          <BigCalendar />
        </div>
      </div>

      <div className='w-full xl:w-1/3 flex flex-col gap-4'>
        <div className='bg-white p-4 rounded-md'>
          <h1 className='text-xl font-semibold'>Shortcuts</h1>
          <div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
            <Link className='p-3 rounded-md bg-yYellowLight' href="/">Teacher's Lessons</Link>
            <Link className='p-3 rounded-md bg-ySkyLight' href="/">Teacher's Classes</Link>
            <Link className='p-3 rounded-md bg-ySkyLight' href="/">Teacher's Assignments</Link>
            <Link className='p-3 rounded-md bg-yPurpleLight' href="/">Student's Results</Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;