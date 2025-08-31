"use client";

import Announcements from '@/components/AnnouncementsT';
import BigCalendar from '@/components/BigCalendar';
import Performance from '@/components/Performance';
import FormModal from '@/components/FormModal';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuthHook';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SingleStudentPage = () => {
    useAuth();
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setRole(user.role);
    }
  }, []);


    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/student/${id}`);
                if (!res.ok) throw new Error("Student not found");

                const data = await res.json();
                setStudent(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStudent();
    }, [id]);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    const attendanceValue = student?.attendance || "No attendance record";
    const gradeValue = student?.grade || "N/A";
    const resultsCount = student?.results?.length ?? 0;
    const classValue = student?.class || "N/A";

    return (
        <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row'>
            <div className='w-full xl:w-2/3'>
                <div className='flex flex-col lg:flex-row gap-4'>
                    <div className='bg-ySky py-6 px-4 rounded-md flex-1 flex gap-4'>
                        <div className='w-1/3'>
                            <Image
                                src={student?.photo || "/default-user.png"}
                                alt={student?.firstName || "Student Photo"}
                                width={144}
                                height={144}
                                className='w-28 h-28 rounded-full object-cover'
                            />
                        </div>
                        <div className='w-2/3 flex flex-col justify-between gap-4'>
                            <div className='flex items-center gap-4'>
                                <h1 className='text-xl font-semibold'>{student?.firstName} {student?.lastName}</h1>
                                {role === "admin" && (
                                    <FormModal
                                        table="student"
                                        type="update"
                                        data={student}
                                        onSuccess={() => {
                                            // Refresh the student data after update
                                            window.location.reload();
                                        }}
                                    />
                                )}
                            </div>
                            <p className='text-sm text-gray-500 '>{student?.address}</p>
                            <div className='flex items-center justify-between gap-2 flex-wrap text-xs font-medium'>
                                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                                    <Image src="/blood.png" alt='' width={14} height={14} />
                                    <span>{student?.bloodType}</span>
                                </div>
                                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                                    <Image src="/date.png" alt='' width={14} height={14} />
                                    <span>{student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                                    <Image src="/mail.png" alt='' width={14} height={14} />
                                    <span>{student?.email}</span>
                                </div>
                                <div className='w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2'>
                                    <Image src="/phone.png" alt='' width={14} height={14} />
                                    <span>{student?.phone}</span>
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
                                <h1 className='text-xl font-semibold'>{classValue}</h1>
                                <span className='text-sm text-gray-400'>Class</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-4 bg-white rounded-md p-4 h-[800px]'>
                    <h1>Student's Schedule</h1>
                    <BigCalendar />
                </div>
            </div>

            <div className='w-full xl:w-1/3 flex flex-col gap-4'>
                <div className='bg-white p-4 rounded-md'>
                    <h1 className='text-xl font-semibold'>Shortcuts</h1>
                    <div className='mt-4 flex gap-4 flex-wrap text-xs text-gray-500'>
                        <Link className='p-3 rounded-md bg-yYellowLight' href="/">Student's Lessons</Link>
                        <Link className='p-3 rounded-md bg-ySkyLight' href="/">Student's Teachers</Link>
                        <Link className='p-3 rounded-md bg-pink-50' href="/">Student's Exams</Link>
                        <Link className='p-3 rounded-md bg-ySkyLight' href="/">Student's Assignments</Link>
                        <Link className='p-3 rounded-md bg-yPurpleLight' href="/">Student's Results</Link>
                    </div>
                </div>
                <Performance />
                <Announcements />
            </div>
        </div>
    );
};

export default SingleStudentPage;