"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const data = [
  {
    name: "Girls",
    count: val.female,
    fill: "#FAE27C",
  },
  {
    name: "Boys",
    count: val.male,
    fill: "#C3EBFA",
  },
];
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={25}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src="/maleFemale.png"
          alt=""
          width={30}
          height={50}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      {/* BOTTOM */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaSky rounded-full" />
          <h1 className="font-bold">{val.male}</h1>
          <h2 className="text-xs text-gray-300">Boys ({((val.male / (val.female + val.male)) * 100).toFixed(2)}%)</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaYellow rounded-full" />
          <h1 className="font-bold">{val.female}</h1>
          <h2 className="text-xs text-gray-300">Girls ({((val.female / (val.female + val.male)) * 100).toFixed(2)}%)</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
