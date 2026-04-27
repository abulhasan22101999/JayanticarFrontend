import { useEffect, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import AddDriverModal from "../components/AddDriverModal";
import { API_URL } from "../utils/api";

type Driver = {
  _id: string;
  driverName: string;
  mobileNo: string;
  alternateMobileNo?: string;
  status: "active" | "inactive" | "booked";
};

const DriverManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refresh, setRefresh] = useState(false);

  const [open, setOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch
  const fetchDrivers = async () => {
    try {
      let url = `${API_URL}/drivers`;
      if (statusFilter) url += `?status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setDrivers(data.data || []);
    } catch {
      toast.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter, refresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, drivers]);

  // ✅ Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_URL}/drivers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message);

      toast.success("Driver deleted");
      setRefresh((prev) => !prev);
    } catch {
      toast.error("Delete failed");
    }
  };

  

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/drivers/status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      // 🔥 booked হলে error toast, status change হবে না
      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Status updated");

      setDrivers((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, status: status as Driver["status"] }
            : item,
        ),
      );
    } catch {
      toast.error("Status update failed");
    }
  };

  const filtered = drivers.filter((d) =>
    d.driverName.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Driver Management</h2>
          <p className="text-sm text-gray-400">{drivers.length} drivers</p>
        </div>

        <button
          onClick={() => {
            setEditDriver(null);
            setOpen(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <FiPlus /> Add Driver
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex items-center border border-gray-200 px-3 rounded-lg w-full md:w-[250px] bg-gray-50">
          <FiSearch className="text-gray-400" />
          <input
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 outline-none bg-transparent"
          />
        </div>

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 px-3 py-2 rounded-lg bg-gray-50 w-full md:w-auto"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 border-t-0 overflow-hidden rounded-bl-xl rounded-br-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">NAME</th>
                <th className="p-4 text-left">MOBILE</th>
                <th className="p-4 text-left">ALT MOBILE</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((d) => (
                <tr
                  key={d._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{d.driverName}</td>
                  <td className="p-3">{d.mobileNo}</td>
                  <td className="p-3">{d.alternateMobileNo || "-"}</td>

                  
                  <td className="p-3">
  {d.status === "booked" ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-gray-200">
      blocked
    </span>
  ) : (
    <div className="relative inline-flex items-center">
      <select
        value={d.status}
        onChange={(e) => handleStatusChange(d._id, e.target.value)}
        className={`pl-2 pr-4 py-1 rounded-full text-xs font-medium border border-gray-200 outline-none cursor-pointer appearance-none ${
          d.status === "active"
            ? "bg-green-100 text-green-600"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        <option value="active">active</option>
        <option value="inactive">inactive</option>
      </select>
      <span className="pointer-events-none absolute right-2 text-[14px]">▾</span>
    </div>
  )}
</td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditDriver(d);
                        setOpen(true);
                      }}
                      disabled={d.status === "booked"}
                      className={`border border-gray-200 p-2 rounded-lg ${
                        d.status === "booked"
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <MdEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(d._id)}
                      disabled={d.status === "booked"}
                      className={`border border-gray-200 p-2 rounded-lg text-red-500 ${
                        d.status === "booked"
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4 bg-white border border-t-0 border-gray-200 rounded-b-xl">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      <AddDriverModal
        open={open}
        setOpen={setOpen}
        editDriver={editDriver}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default DriverManagement;
