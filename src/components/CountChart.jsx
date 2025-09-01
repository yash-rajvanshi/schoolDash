"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CountChart = () => {
  const [val, setVal] = useState([]);
  useEffect(() => {

    const fetchGenderCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/genderCount`)
        if (!response.ok) {
          console.log("Error occurred")
          return;
        }
        const data = await response.json();
        setVal(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchGenderCount();



  }, [])

  const totalStudents = (val.male || 0) + (val.female || 0);
  const malePercentage = totalStudents > 0 ? ((val.male || 0) / totalStudents) * 100 : 0;
  const femalePercentage = totalStudents > 0 ? ((val.female || 0) / totalStudents) * 100 : 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 flex flex-col">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      
      {/* CREATIVE VISUALIZATION */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-6">
        {/* CENTRAL ICON */}
        <div className="relative">
          <Image
            src="/maleFemale.png"
            alt=""
            width={40}
            height={60}
            className="z-10"
          />
        </div>
        
        {/* PROGRESS BARS */}
        <div className="w-full max-w-xs space-y-3">
          {/* MALE PROGRESS BAR */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Boys</span>
              <span className="font-semibold">{val.male || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-lamaSky h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${malePercentage}%` }}
              />
            </div>
          </div>
          
          {/* FEMALE PROGRESS BAR */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Girls</span>
              <span className="font-semibold">{val.female || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-lamaYellow h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${femalePercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* TOTAL COUNT */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{totalStudents}</div>
          <div className="text-sm text-gray-500">Total Students</div>
        </div>
      </div>
      
      {/* BOTTOM LEGEND */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-lamaSky rounded-full" />
          <span className="text-sm text-gray-600">Boys ({malePercentage.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-lamaYellow rounded-full" />
          <span className="text-sm text-gray-600">Girls ({femalePercentage.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
