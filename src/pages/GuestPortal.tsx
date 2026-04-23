import { useState, ChangeEvent } from "react";
import { FiSearch } from "react-icons/fi";

type Car = {
  carNumber: string;
  carModel: string;
};

type Driver = {
  driverName: string;
};

type BookingStatus = "booked" | "complete"; // 👈 completed → complete

type Booking = {
  _id: string;
  bookingId: string;
  carId: Car | null;
  driverId: Driver | null;
  guestName: string;
  guestMobileNo: string;
  pickupDate: string;
  dropDate?: string | null; // 👈 optional
  pickupLocation: string;
  dropLocation: string;
  status: BookingStatus;
};

type ApiResponse = {
  data: Booking[];
};

const GuestPortal = () => {
  const [query, setQuery] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const validate = (): boolean => {
    if (!query.trim()) {
      setError("Please enter mobile number or booking ID");
      return false;
    }
    setError("");
    return true;
  };

  const handleSearch = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setSearched(false);

      const res = await fetch(
        `http://localhost:5000/api/bookings/search?q=${query.trim()}`
      );

      const data: ApiResponse = await res.json();
      setBookings(data.data || []);
      setSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Guest Booking Portal</h2>
        <p className="text-sm text-gray-400">
          Enter mobile number or booking ID to view bookings
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <div
            className={`flex items-center border px-3 rounded-lg w-full bg-gray-50 ${
              error ? "border-red-400" : "border-gray-200"
            }`}
          >
            <FiSearch className="text-gray-400" />
            <input
              placeholder="Mobile number or Booking ID..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setQuery(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              className="w-full p-2 bg-transparent outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setBookings([]);
                  setSearched(false);
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-orange-500 text-white px-5 rounded-lg text-sm disabled:opacity-60"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-xs text-left">
              <tr>
                <th className="p-3">BOOKING ID</th>
                <th className="p-3">CAR NO</th>
                <th className="p-3">CAR MODEL</th>
                <th className="p-3">DRIVER</th>
                <th className="p-3">GUEST</th>
                <th className="p-3">PICKUP</th>
                <th className="p-3">DROP</th>
                <th className="p-3">DATES</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-400">
                    Searching...
                  </td>
                </tr>
              ) : searched && bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-400">
                    No bookings found for{" "}
                    <span className="font-semibold text-gray-600">
                      "{query}"
                    </span>
                  </td>
                </tr>
              ) : !searched ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-400">
                    Search by mobile number or booking ID
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-semibold text-orange-600">
                      {b.bookingId}
                    </td>
                    <td className="p-3">{b.carId?.carNumber ?? "N/A"}</td>
                    <td className="p-3">{b.carId?.carModel ?? "N/A"}</td>
                    <td className="p-3">{b.driverId?.driverName ?? "N/A"}</td>
                    <td className="p-3">{b.guestName}</td>
                    <td className="p-3">{b.pickupLocation}</td>
                    <td className="p-3">{b.dropLocation}</td>

                    {/* 🔥 dropDate optional fix */}
                    <td className="p-3">
                      {b.pickupDate?.slice(0, 10)} →{" "}
                      {b.dropDate ? b.dropDate.slice(0, 10) : "—"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          b.status === "booked"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuestPortal;