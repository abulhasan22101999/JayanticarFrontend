
import { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiFilter } from "react-icons/fi";
import { MdEdit, MdDelete, MdCheckCircle, MdCancel } from "react-icons/md";
import AddBookingModal from "../components/AddBookingModal";
import toast from "react-hot-toast";
import { API_URL } from "../utils/api";

type BookingStatus = "booked" | "complete" | "cancelled";

type Booking = {
  _id: string;
  carId: {
    _id: string;
    carNumber: string;
    carName: string;
  };
  driverId: {
    _id: string;
    driverName: string;
  };
  pickupDate: string;
  dropDate: string;
  guestName: string;
  guestMobileNo: string;
  company: string;
  pickupLocation: string;
  dropLocation: string;
  status: BookingStatus;
};

const isDropDatePassed = (dropDate: string): boolean => {
  if (!dropDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const drop = new Date(dropDate);
  drop.setHours(0, 0, 0, 0);
  return drop <= today;
};

const Booking = () => {
  const [open, setOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [statusFilter, setStatusFilter] = useState("booked");
  const [pickupDateFilter, setPickupDateFilter] = useState("");
  const [dropDateFilter, setDropDateFilter] = useState("");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchBookings = async () => {
    const res = await fetch(`${API_URL}/bookings`);
    const data = await res.json();
    const fetched: Booking[] = data.data || [];

    const toAutoComplete = fetched.filter(
      (b) => b.status === "booked" && isDropDatePassed(b.dropDate)
    );

    if (toAutoComplete.length > 0) {
      await Promise.all(
        toAutoComplete.map((b) =>
          fetch(`${API_URL}/bookings/${b._id}/toggle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "complete" }),
          })
        )
      );
      const res2 = await fetch(`${API_URL}/bookings`);
      const data2 = await res2.json();
      setBookings(data2.data || []);
    } else {
      setBookings(fetched);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refresh]);

  // ✅ Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pickupDateFilter, dropDateFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return toast.error("Delete failed");
    toast.success("Deleted");
    setRefresh((p) => !p);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const booking = bookings.find((b) => b._id === id);
    if (booking?.status === "complete") {
      toast.error("Completed booking cannot be changed");
      return;
    }

    if (status === "complete" || status === "cancelled") {
      const ok = window.confirm(
        status === "complete"
          ? "Are you sure you want to COMPLETE this ride?"
          : "Are you sure you want to CANCEL this ride?"
      );
      if (!ok) return;
    }

    const res = await fetch(
      `${API_URL}/bookings/${id}/toggle`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) return toast.error("Status update failed");
    toast.success(`Booking marked as ${status}`);
    setRefresh((p) => !p);
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter
      ? b.status === statusFilter
      : b.status !== "complete";

    const keyword = search.toLowerCase();
    const matchSearch =
      b.guestName?.toLowerCase().includes(keyword) ||
      b.guestMobileNo?.toLowerCase().includes(keyword) ||
      b.company?.toLowerCase().includes(keyword) ||
      b.pickupLocation?.toLowerCase().includes(keyword) ||
      b.dropLocation?.toLowerCase().includes(keyword) ||
      b.carId?.carNumber?.toLowerCase().includes(keyword) ||
      b.driverId?.driverName?.toLowerCase().includes(keyword);

    const matchPickupDate = pickupDateFilter
      ? b.pickupDate?.slice(0, 10) === pickupDateFilter
      : true;

    const matchDropDate = dropDateFilter
      ? b.dropDate?.slice(0, 10) === dropDateFilter
      : true;

    return (
      matchStatus && matchSearch && matchPickupDate && matchDropDate
    );
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusClass = (status: BookingStatus) => {
    if (status === "booked") return "bg-blue-100 text-blue-600";
    if (status === "complete") return "bg-green-100 text-green-600";
    return "bg-red-100 text-red-600";
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        {/* <h2 className="text-xl font-bold">Booking Management</h2>
        <p className="text-sm text-gray-400">
          Booking ({bookings.filter((b) => b.status === "booked").length})
        </p> */}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center border border-gray-200 px-3 rounded-lg w-full md:w-[220px] bg-gray-50">
          <FiSearch />
          <input
            placeholder="Search guest..."
            className="w-full p-2 bg-transparent outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative flex items-center">
          <input
            type="date"
            value={pickupDateFilter}
            onChange={(e) => setPickupDateFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 pr-8"
          />
          {pickupDateFilter && (
            <button
              onClick={() => setPickupDateFilter("")}
              className="absolute right-2 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="date"
            value={dropDateFilter}
            onChange={(e) => setDropDateFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 pr-8"
          />
          {dropDateFilter && (
            <button
              onClick={() => setDropDateFilter("")}
              className="absolute right-2 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50"
        >
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* ADD BUTTON RIGHT */}
        <div className="md:ml-auto">
          <button
            onClick={() => {
              setEditBooking(null);
              setOpen(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex gap-2 items-center"
          >
            <FiPlus /> Add Booking
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-b-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-xs text-left">
              <tr>
                <th className="p-3">GUEST</th>
                <th className="p-3">MOBILE</th>
                <th className="p-3">CAR NAME</th>
                <th className="p-3">CAR NUMBER</th>
                <th className="p-3">DRIVER</th>
                <th className="p-3">COMPANY</th>
                <th className="p-3">PICKUP</th>
                <th className="p-3">DROP</th>
                <th className="p-3">DATES</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center p-6 text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                paginatedData.map((b) => (
                  <tr
                    key={b._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">{b.guestName}</td>
                    <td className="p-3">{b.guestMobileNo}</td>
                    <td className="p-3">{b.carId?.carName ?? "N/A"}</td>
                    <td className="p-3">{b.carId?.carNumber ?? "N/A"}</td>
                    <td className="p-3">{b.driverId?.driverName ?? "N/A"}</td>
                    <td className="p-3">{b.company || "—"}</td>
                    <td className="p-3">{b.pickupLocation}</td>
                    <td className="p-3">{b.dropLocation}</td>
                    <td className="p-3 whitespace-nowrap">
                      {b.pickupDate?.slice(0, 10)} →{" "}
                      {b.dropDate?.slice(0, 10) ?? "—"}
                    </td>

                    <td className="p-3">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          handleStatusChange(b._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded text-xs border-0 outline-none cursor-pointer font-medium ${statusClass(
                          b.status
                        )}`}
                      >
                        <option value="booked">Booked</option>
                        <option value="complete">Complete</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditBooking(b);
                          setOpen(true);
                        }}
                        className="border border-gray-200 p-2 rounded"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="border border-gray-200 p-2 rounded text-red-500"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm">
          <p className="text-gray-500">
            Showing {paginatedData.length} of {filtered.length} bookings
          </p>

          <div className="flex gap-2 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AddBookingModal
        open={open}
        setOpen={setOpen}
        editBooking={editBooking}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default Booking;


