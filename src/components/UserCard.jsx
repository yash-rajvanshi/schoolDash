import Image from "next/image";
import { useEffect ,useState} from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const UserCard = ({ type }) => {
  const [count, setCount] = useState("loading..");

useEffect(() => {
  const fetchCount = async () => {
    try {
      const endpoint =
        type == "student"
          ? `${API_BASE_URL}/api/student/countStudent`
          : `${API_BASE_URL}/api/teacher/countTeachers`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch count");

      const data = await response.json();
      setCount(data.count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  fetchCount();
}, [type]);
  
  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
