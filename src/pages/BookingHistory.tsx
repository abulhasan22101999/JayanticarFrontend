import { useEffect, useState, ChangeEvent } from "react";
import { FiSearch, FiShare2, FiDownload } from "react-icons/fi";
import { API_URL } from "../utils/api";

type Car = {
  _id: string;
  carNumber: string;
  carModel: string;
  carName: string;
};

type Driver = {
  _id: string;
  driverName: string;
  mobileNo: string;
};

type Booking = {
  _id: string;
  bookingId: string;
  carId: Car | null;
  driverId: Driver | null;
  guestName: string;
  guestMobileNo: string;
  pickupLocation: string;
  dropLocation: string;
  company: string;
  pickupDate: string;
  dropDate?: string | null;
  status: string;
};

type ApiResponse = {
  data: Booking[];
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fetchBookings = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/bookings`);
      const data: ApiResponse = await res.json();
      // 👈 only complete
      const completed = (data.data || []).filter(
        (b: Booking) => b.status === "complete"
      );
      setBookings(completed);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings: Booking[] = bookings.filter((b) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      b.bookingId?.toLowerCase().includes(searchText) ||
      b.guestName?.toLowerCase().includes(searchText) ||
      b.guestMobileNo?.toLowerCase().includes(searchText) ||
      b.company?.toLowerCase().includes(searchText) ||
      b.carId?.carNumber?.toLowerCase().includes(searchText) ||
      b.carId?.carName?.toLowerCase().includes(searchText) ||
      b.driverId?.driverName?.toLowerCase().includes(searchText);

    const bookingDate = new Date(b.pickupDate);
    const matchFrom = fromDate ? bookingDate >= new Date(fromDate) : true;
    const matchTo = toDate ? bookingDate <= new Date(toDate) : true;

    return matchSearch && matchFrom && matchTo;
  });

  // ✅ SINGLE BOOKING SHARE
  const handleShareSingle = async (b: Booking) => {
    const text = `📋 Booking ID: ${b.bookingId}
🚗 Car: ${b.carId?.carName ?? "N/A"} | ${b.carId?.carNumber ?? "N/A"}
👤 Driver: ${b.driverId?.driverName ?? "N/A"}
🧑 Guest: ${b.guestName}
📞 Mobile: ${b.guestMobileNo}
🏢 Company: ${b.company || "—"}
📍 Pickup: ${b.pickupLocation}
📍 Drop: ${b.dropLocation}
📅 Date: ${b.pickupDate?.slice(0, 10)} → ${b.dropDate ? b.dropDate.slice(0, 10) : "—"}
🔖 Status: ${b.status}`;

    if (navigator.share) {
      await navigator.share({ title: "Booking Details", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied! Paste in WhatsApp or Email.");
    }
  };

  // ✅ DOWNLOAD CSV
  const handleDownload = () => {
    const headers = [
      "Booking ID",
      "Car Name",
      "Car Number",
      "Driver",
      "Guest",
      "Mobile",
      "Company",
      "Pickup",
      "Drop",
      "Pickup Date",
      "Drop Date",
      "Status",
    ];

    const rows = filteredBookings.map((b) => [
      b.bookingId,
      b.carId?.carName ?? "N/A",
      b.carId?.carNumber ?? "N/A",
      b.driverId?.driverName ?? "N/A",
      b.guestName,
      b.guestMobileNo,
      b.company || "—",
      b.pickupLocation,
      b.dropLocation,
      b.pickupDate?.slice(0, 10),
      b.dropDate ? b.dropDate.slice(0, 10) : "—",
      b.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `completed-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Booking History</h2>
          <p className="text-sm text-gray-400">
            Total ({filteredBookings.length})
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          <FiDownload size={15} /> Download Excel
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex items-center border border-gray-200 px-3 rounded-lg w-full md:w-[220px] bg-gray-50">
          <FiSearch />
          <input
            placeholder="Search Booking..."
            className="w-full p-2 bg-transparent outline-none"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* FROM DATE WITH CLEAR */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFromDate(e.target.value)
            }
            className="border border-gray-200 p-2 rounded-lg bg-white pr-6"
          />
          {fromDate && (
            <button
              onClick={() => setFromDate("")}
              className="absolute right-2 text-gray-600 hover:text-gray-800 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* TO DATE WITH CLEAR */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={toDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setToDate(e.target.value)
            }
            className="border border-gray-200 p-2 rounded-lg bg-white pr-6"
          />
          {toDate && (
            <button
              onClick={() => setToDate("")}
              className="absolute right-2 text-gray-600 hover:text-gray-800 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-b-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-gray-50 text-xs text-left">
              <tr>
                <th className="p-3">BOOKING ID</th>
                <th className="p-3">GUEST NAME</th>
                <th className="p-3">MOBILE</th>
                <th className="p-3">CAR NAME</th>
                <th className="p-3">CAR NUMBER</th>
                <th className="p-3">DRIVER</th>
                <th className="p-3">PICKUP</th>
                <th className="p-3">DROP</th>
                <th className="p-3">COMPANY</th>
                <th className="p-3">DATES</th>
                {/* <th className="p-3">SHARE</th> */}
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center p-6 text-gray-400">
                    No completed bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-semibold">{b.bookingId}</td>
                    <td className="p-3">{b.guestName}</td>
                    <td className="p-3">{b.guestMobileNo}</td>
                    <td className="p-3">{b.carId?.carName ?? "N/A"}</td>
                    <td className="p-3">{b.carId?.carNumber ?? "N/A"}</td>
                    <td className="p-3">{b.driverId?.driverName ?? "N/A"}</td>
                    <td className="p-3">{b.pickupLocation}</td>
                    <td className="p-3">{b.dropLocation}</td>
                    <td className="p-3">{b.company || "—"}</td>
                    <td className="p-3">
                      {b.pickupDate?.slice(0, 10)} →{" "}
                      {b.dropDate ? b.dropDate.slice(0, 10) : "—"}
                    </td>
                    {/* <td className="p-3">
                      <button
                        onClick={() => handleShareSingle(b)}
                        className="flex items-center gap-1 border border-gray-200 px-2 py-1 rounded text-xs bg-blue-50 text-blue-400"
                      >
                        <FiShare2 size={12} /> Share
                      </button>
                    </td> */}
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

export default BookingHistory;