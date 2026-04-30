import { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiEye } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";
import AddBookingModal from "../components/AddBookingModal";
import BookingViewModal from "../components/BookingViewModal";
import toast from "react-hot-toast";
import { API_URL } from "../utils/api";

type BookingStatus = "pending" | "booked" | "complete" | "cancelled";

type Booking = {
  _id: string;
  bookingId?: string;
  carId: {
    _id: string;
    carNumber: string;
    carName: string;
    carModel?: string;
  } | null;
  driverId: {
    _id: string;
    driverName: string;
    mobileNo?: string;
  } | null;
  pickupDate: string;
  dropDate: string;
  guestName: string;
  guestMobileNo: string;
  company: string;
  pickupLocation: string;
  dropLocation: string;
  status: BookingStatus;
  reportingAddress?: string;
  reportingTime?: string;
};

// ✅ Format date to dd/mm/yyyy
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// ✅ Sort: upcoming nearest first, past dates after
const sortByPickupDate = (bookings: Booking[]): Booking[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.pickupDate);
    const dateB = new Date(b.pickupDate);
    const aFuture = dateA >= today;
    const bFuture = dateB >= today;

    if (aFuture && bFuture) return dateA.getTime() - dateB.getTime();
    if (!aFuture && !bFuture) return dateB.getTime() - dateA.getTime();
    return aFuture ? -1 : 1;
  });
};

const BookingPage = () => {
  const [open, setOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [pickupDateFilter, setPickupDateFilter] = useState("");
  const [dropDateFilter, setDropDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBookings = async () => {
    const res = await fetch(`${API_URL}/bookings`);
    const data = await res.json();
    setBookings(data.data || []);
  };

  useEffect(() => {
    fetchBookings();
  }, [refresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pickupDateFilter, dropDateFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const res = await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE" });
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

    if (booking?.status === "pending" && status === "complete") {
      toast.error("Cannot complete a pending booking. Please fill all details first ❌");
      return;
    }

    if (status === "complete" && (!booking?.carId || !booking?.driverId)) {
      toast.error("Cannot complete: Car or Driver is not assigned ❌");
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

    const res = await fetch(`${API_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || "Status update failed");
      return;
    }

    toast.success(`Booking marked as ${status}`);
    setRefresh((p) => !p);
  };

  const filtered = bookings.filter((b) => {
  // ✅ hide completed + cancelled rides from active listing
  if (b.status === "complete" || b.status === "cancelled") return false;

  const matchStatus = statusFilter ? b.status === statusFilter : true;

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

  return matchStatus && matchSearch && matchPickupDate && matchDropDate;
});

  const sorted = sortByPickupDate(filtered);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedData = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusClass = (status: BookingStatus) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "booked") return "bg-blue-100 text-blue-600";
    if (status === "complete") return "bg-green-100 text-green-600";
    return "bg-red-100 text-red-600";
  };

  return (
    <div>
      {/* FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center">

        {/* SEARCH */}
        <div className="col-span-2 md:col-span-1 flex items-center border border-gray-200 px-3 rounded-lg w-full md:w-[220px] bg-gray-50">
          <FiSearch />
          <input
            placeholder="Search guest..."
            className="w-full p-2 bg-transparent outline-none text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* PICKUP DATE */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={pickupDateFilter}
            onChange={(e) => setPickupDateFilter(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 pr-8 text-sm"
          />
          {pickupDateFilter && (
            <button
              onClick={() => setPickupDateFilter("")}
              className="absolute right-2 text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* DROP DATE */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={dropDateFilter}
            onChange={(e) => setDropDateFilter(e.target.value)}
            min={pickupDateFilter || undefined}
            className="w-full border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 pr-8 text-sm"
          />
          {dropDateFilter && (
            <button
              onClick={() => setDropDateFilter("")}
              className="absolute right-2 text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 w-full md:w-auto text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Allotment Pending</option>
          <option value="booked">Booked</option>
          {/* <option value="complete">Complete</option> */}
          {/* <option value="cancelled">Cancelled</option> */}
        </select>

        {/* ADD BUTTON */}
        <div className="col-span-2 md:ml-auto">
          <button
            onClick={() => {
              setEditBooking(null);
              setOpen(true);
            }}
            className="w-full md:w-auto bg-orange-500 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center text-sm"
          >
            <FiPlus /> Add Booking
          </button>
        </div>
      </div>

      {/* TABLE */}
     <div className="bg-white border border-gray-200 border-t-0 h-full flex flex-col">
  <div className="w-full overflow-x-auto overflow-y-auto flex-1">
    <table className="min-w-[1050px] w-full text-[13px] leading-tight">
      <thead className="bg-gray-50 text-[11px] text-left text-gray-500 sticky top-0 z-10">
        <tr>
          <th className="px-3 py-2">GUEST NAME</th>
          <th className="px-3 py-2">MOBILE</th>
          <th className="px-3 py-2">CAR</th>
          <th className="px-3 py-2">CAR NO.</th>
          <th className="px-3 py-2">DRIVER</th>
          <th className="px-3 py-2">COMPANY</th>
          <th className="px-3 py-2">PICKUP LOC.</th>
          <th className="px-3 py-2">DROP LOC.</th>
          <th className="px-3 py-2">DATES</th>
          <th className="px-3 py-2">STATUS</th>
          <th className="px-3 py-2">VIEW</th>
          <th className="px-3 py-2">ACTION</th>
        </tr>
      </thead>

      <tbody>
        {paginatedData.length === 0 ? (
          <tr>
            <td colSpan={11} className="text-center py-5 text-gray-400">
              No bookings found
            </td>
          </tr>
        ) : (
          paginatedData.map((b) => (
            <tr
              key={b._id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="px-3 py-3">
                {b.guestName || <span className="text-gray-300">—</span>}
              </td>

              <td className="px-3 py-3">
                {b.guestMobileNo || <span className="text-gray-300">—</span>}
              </td>

              <td className="px-3 py-3">
                {b.carId?.carName ?? <span className="text-gray-300">N/A</span>}
              </td>

              <td className="px-3 py-3">
                {b.carId?.carNumber ?? <span className="text-gray-300">N/A</span>}
              </td>

              <td className="px-3 py-3">
                {b.driverId?.driverName ?? <span className="text-gray-300">N/A</span>}
              </td>

              <td className="px-3 py-3">
                {b.company || <span className="text-gray-300">—</span>}
              </td>

              <td className="px-3 py-3">
                {b.pickupLocation || <span className="text-gray-300">—</span>}
              </td>

              <td className="px-3 py-3">
                {b.dropLocation || <span className="text-gray-300">—</span>}
              </td>

              <td className="px-3 py-3 whitespace-nowrap text-[11px] text-gray-600">
                {formatDate(b.pickupDate)} → {formatDate(b.dropDate)}
              </td>

              <td className="px-3 py-3">
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b._id, e.target.value)}
                  className={`px-2 py-0.5 rounded text-[11px] border-0 outline-none cursor-pointer font-medium ${statusClass(
                    b.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="booked">Booked</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>

              <td className="px-3 py-3">
                <button
                  onClick={() => setViewBooking(b)}
                  className="border border-gray-200 p-1 rounded text-blue-500 hover:bg-blue-50"
                  title="View"
                >
                  <FiEye size={16} />
                </button>
              </td>

              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditBooking(b);
                      setOpen(true);
                    }}
                    className="border border-gray-200 p-1 rounded hover:bg-gray-100"
                    title="Edit"
                  >
                    <MdEdit size={12} />
                  </button>

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="border border-gray-200 p-1 rounded text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <MdDelete size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* PAGINATION */}
     {totalPages > 1 && (
  <div className="flex justify-end items-center gap-2 py-4 px-4 bg-white border border-t-0 border-gray-200 rounded-b-xl">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-40 text-sm hover:bg-gray-50"
    >
      Prev
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-2 rounded-md text-sm border ${
          currentPage === page
            ? "bg-orange-500 text-white border-orange-500"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-40 text-sm hover:bg-gray-50"
    >
      Next
    </button>
  </div>
)}

      <AddBookingModal
        open={open}
        setOpen={setOpen}
        editBooking={editBooking}
        setRefresh={setRefresh}
      />

      <BookingViewModal
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
      />
    </div>
  );
};

export default BookingPage;
