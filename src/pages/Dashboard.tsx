import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../utils/api";

// ✅ ICONS (UPDATED)
import { FaUserTie } from "react-icons/fa";

import {
  MdEventBusy,
  // MdToday,
  MdDirectionsCar,
} from "react-icons/md";


// import BookingManagement from "./BookingManagement";
import Booking from "./Booking";

// ✅ TYPES
type Car = {
  _id: string;
  status: "active" | "booked";

  ownership: "self" | "others";
};

type Driver = {
  _id: string;
  status: "active" | "booked";
};

type BookingType = {
  _id: string;
  pickupDate: string;
  createdAt: string; // 🔥 add this
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    bookedCars: 0,
    availableCars: 0,
    selfCars: 0,
    otherCars: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    bookedDrivers: 0,
    todayBookings: 0,
  });

  // ✅ FETCH DATA
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [carRes, driverRes, bookingRes] = await Promise.all([
        fetch(`${API_URL}/cars`),
        fetch(`${API_URL}/drivers`),
        fetch(`${API_URL}/bookings`),
      ]);

      const carData = await carRes.json();
      const driverData = await driverRes.json();
      const bookingData = await bookingRes.json();

      const cars: Car[] = carData.data || [];
      const drivers: Driver[] = driverData.data || [];
      const bookings: BookingType[] = bookingData.data || [];

      // 🔥 CAR STATS
      const totalCars = cars.length;
      const bookedCars = cars.filter((c) => c.status === "booked").length;
      const availableCars = cars.filter((c) => c.status === "active").length;
      const selfCars = cars.filter((c) => c.ownership === "self").length;
      const otherCars = cars.filter((c) => c.ownership === "others").length;

      // 🔥 DRIVER STATS
      const totalDrivers = drivers.length;
      const availableDrivers = drivers.filter(
        (d) => d.status === "active",
      ).length;
      const bookedDrivers = drivers.filter((d) => d.status === "booked").length;

      // 🔥 TODAY BOOKINGS (FIXED - LOCAL TIME)
      const today = new Date().toLocaleDateString("en-CA");

      const todayBookings = bookings.filter(
        (b: BookingType) => b.createdAt.slice(0, 10) === today,
      ).length;

      setStats({
        totalCars,
        bookedCars,
        availableCars,
        selfCars,
        otherCars,
        totalDrivers,
        availableDrivers,
        bookedDrivers,
        todayBookings,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
  

  <>
  <div className="p-4 md:p-6 space-y-6">

    {/* HEADER */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <span className="text-sm text-gray-400">
        Overview of your system
      </span>
    </div>

    {/* GRID */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

      {/* TODAY BOOKINGS (HIGHLIGHT CARD) */}
      <Link to="/booking">
        <div className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-md hover:shadow-xl transition">

          <div className="flex justify-between items-center mb-4">
            <div className="bg-white/20 p-2 rounded-xl">
              📅
            </div>
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          <h1 className="text-3xl font-bold">{stats.todayBookings}</h1>
          <p className="text-sm mt-1 opacity-90">Today's Bookings</p>

          {/* Glow effect */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition"></div>
        </div>
      </Link>

      {/* AVAILABLE CARS */}
      <Link to="/availablecar">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-lg transition group">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
               <MdDirectionsCar size={20} />
            </div>
          </div>

          <h1 className="text-3xl font-bold">{stats.availableCars}</h1>
          <p className="text-gray-500 text-sm">Available Cars</p>
        </div>
      </Link>

      {/* BOOKED CARS */}
      <Link to="/bookedcar">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-lg transition group">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <MdEventBusy size={20} />
            </div>
          </div>

          <h1 className="text-3xl font-bold">{stats.bookedCars}</h1>
          <p className="text-gray-500 text-sm">Booked Cars</p>
        </div>
      </Link>

      {/* AVAILABLE DRIVERS */}
      <Link to="/availabledriver">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-lg transition group">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <FaUserTie size={18} />
            </div>
          </div>

          <h1 className="text-3xl font-bold">{stats.availableDrivers}</h1>
          <p className="text-gray-500 text-sm">Available Drivers</p>
        </div>
      </Link>

      {/* BOOKED DRIVERS */}
      <Link to="/bookeddriver">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-lg transition group">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
               <MdEventBusy size={20} />
            </div>
          </div>

          <h1 className="text-3xl font-bold">{stats.bookedDrivers}</h1>
          <p className="text-gray-500 text-sm">Booked Drivers</p>
        </div>
      </Link>
    </div>

    {/* SECTION DIVIDER */}
    <div className=" ">

      {/* YOUR BOOKING COMPONENT */}
      {/* <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"> */}
        <Booking />
      {/* </div> */}
    </div>

  </div>
  </>
);


  
};

export default Dashboard;
