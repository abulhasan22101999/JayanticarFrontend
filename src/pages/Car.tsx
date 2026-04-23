"use client";

import { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { API_URL } from "../utils/api";

// ✅ TYPE
type Car = {
  _id: string;
  carNumber: string;
  carModel: string;
  carName: string;
  ownership: "self" | "others";
  status: "active" | "booked" | "inactive";
};

const Car = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch(`${API_URL}/cars`);
      const data = await res.json();
      setCars(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ COUNT LOGIC
  const activeCount = cars.filter((c) => c.status === "active").length;
  const bookedCount = cars.filter((c) => c.status === "booked").length;
  const inactiveCount = cars.filter((c) => c.status === "inactive").length;

  // ✅ FILTER LOGIC
  const filteredCars = cars.filter((car) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      car.carNumber.toLowerCase().includes(keyword) ||
      car.carModel.toLowerCase().includes(keyword) ||
      car.carName.toLowerCase().includes(keyword);

    const matchStatus = statusFilter ? car.status === statusFilter : true;

    return matchSearch && matchStatus;
  });

  // ✅ STATUS STYLE
  const statusStyle = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-600";
    if (status === "booked") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-200 text-gray-500";
  };

  return (
    <div>
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4">All Cars</h2>

      {/* 🔥 COUNT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setStatusFilter("")}
          className="bg-white border border-gray-200 p-4 rounded-xl cursor-pointer"
        >
          <p className="text-gray-400 text-sm">Total</p>
          <h1 className="text-xl font-bold">{cars.length}</h1>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          className="bg-green-50 border border-gray-200 p-4 rounded-xl cursor-pointer"
        >
          <p className="text-green-600 text-sm">Active</p>
          <h1 className="text-xl font-bold">{activeCount}</h1>
        </div>

        <div
          onClick={() => setStatusFilter("booked")}
          className="bg-yellow-50 border border-gray-200 p-4 rounded-xl cursor-pointer"
        >
          <p className="text-yellow-600 text-sm">Booked</p>
          <h1 className="text-xl font-bold">{bookedCount}</h1>
        </div>

        <div
          onClick={() => setStatusFilter("inactive")}
          className="bg-gray-100 border border-gray-200  p-4 rounded-xl cursor-pointer"
        >
          <p className="text-gray-600 text-sm">Inactive</p>
          <h1 className="text-xl font-bold">{inactiveCount}</h1>
        </div>
      </div>

      {/* 🔥 FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* SEARCH */}
        <div className="flex items-center border border-gray-200 px-3 rounded-lg bg-gray-50 w-full md:w-[250px]">
          <FiSearch className="text-gray-400" />
          <input
            placeholder="Search car..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none bg-transparent"
          />
        </div>

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 w-full md:w-[180px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCars.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">
            No cars found
          </p>
        ) : (
          filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-white border border-gray-200 p-5 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="bg-blue-100 text-blue-500 p-3 rounded-xl">
                  <FaCar size={18} />
                </div>

                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full ${statusStyle(
                    car.status
                  )}`}
                >
                  {car.status}
                </span>
              </div>

              <h1 className="text-lg font-bold">{car.carNumber}</h1>

              <h2 className="text-gray-800 text-[16px]">
                {car.carName} | {car.carModel}
              </h2>

              <p className="text-xs mt-2 text-gray-400">
                {car.ownership === "self" ? "Self Car" : "Others Car"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Car;