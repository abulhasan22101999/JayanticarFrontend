
import { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";

// ✅ TYPE
type Car = {
  _id: string;
  carNumber: string;
  carModel: string;
  carName:string;
  ownership: "self" | "others";
  status: "active" | "booked";
};

const BookedCar = () => {
  const [cars, setCars] = useState<Car[]>([]);

  // ✅ FETCH ONLY BOOKED CARS
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cars");
      const data = await res.json();

      const bookedOnly = (data.data || []).filter(
        (car: Car) => car.status === "booked"
      );

      setCars(bookedOnly);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-6">Booked Cars</h2>

      {/* GRID (same dashboard style) */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {cars.map((car) => (
          <div
            key={car._id}
            className="bg-white border border-gray-200 p-5 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="bg-red-400 text-white p-3 rounded-xl">
                <FaCar size={18} />
              </div>

              <span className="text-white text-sm font-semibold bg-red-400 px-2 py-1 rounded-full">
                Booked
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

export default BookedCar;