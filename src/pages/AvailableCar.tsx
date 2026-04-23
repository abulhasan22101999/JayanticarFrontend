
import { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { API_URL } from "../utils/api";

// ✅ TYPE
type Car = {
  _id: string;
  carNumber: string;
  carModel: string;
  carName:string;
  ownership: "self" | "others";
  status: "active" | "booked";
};

const AvailableCar = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");

  // ✅ FETCH ONLY AVAILABLE CARS
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch(`${API_URL}/cars`);
      const data = await res.json();

      const availableOnly = (data.data || []).filter(
        (car: Car) => car.status === "active"
      );

      setCars(availableOnly);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ SEARCH FILTER
  const filteredCars = cars.filter(
    (car) =>
      car.carNumber.toLowerCase().includes(search.toLowerCase()) ||
      car.carModel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-4">Available Cars</h2>

      {/* 🔍 SEARCH BAR */}
      <div className="flex items-center border border-gray-200 px-3 rounded-lg bg-gray-50 w-[250px] mb-6">
        <FiSearch className="text-gray-400" />
        <input
          placeholder="Search car..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 outline-none bg-transparent"
        />
      </div>

      {/* GRID (same dashboard style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCars.map((car) => (
          <div
            key={car._id}
            className="bg-white border border-gray-200 p-5 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="bg-green-100 text-green-500 p-3 rounded-xl">
                <FaCar size={18} />
              </div>

              <span className="text-green-500 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full">
                Available
              </span>
            </div>

            <h1 className="text-xl font-bold">{car.carNumber}</h1>

            <h2 className="text-gray-900 text-[18px]">{car.carName} | {car.carModel}</h2>

            <p className="text-xs mt-2 text-gray-400">
              {car.ownership === "self" ? "Self Car" : "Others Car"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableCar;