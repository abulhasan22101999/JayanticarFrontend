
import { useEffect, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { MdEdit, MdDelete, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";
import AddDriverModal from "../components/AddDriverModal";

type Driver = {
  _id: string;
  driverName: string;
  mobileNo: string;
  alternateMobileNo?: string;
  status: "active" | "inactive" | "booked";
};

const AvailableDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);

  const [open, setOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ FETCH ONLY ACTIVE
  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/drivers?status=active"
      );
      const data = await res.json();
      setDrivers(data.data || []);
    } catch {
      toast.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [refresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, drivers]);

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/drivers/${id}`, {
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

  const filtered = drivers.filter((d) =>
    d.driverName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Active Drivers</h2>
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

        <div className="px-3 py-2 rounded-lg bg-green-100 text-green-600 text-sm font-medium">
          Active Only
        </div>
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-400">
                    No active drivers found
                  </td>
                </tr>
              ) : (
                paginated.map((d) => (
                  <tr key={d._id} className="border-t border-gray-200">
                    <td className="p-3">{d.driverName}</td>
                    <td className="p-3">{d.mobileNo}</td>
                    <td className="p-3">{d.alternateMobileNo || "-"}</td>

                    <td className="p-3">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                        <MdCheckCircle size={14} /> Active
                      </span>
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditDriver(d);
                          setOpen(true);
                        }}
                        className="border p-2 rounded-lg"
                      >
                        <MdEdit size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(d._id)}
                        className="border p-2 rounded-lg text-red-500"
                      >
                        <MdDelete size={18} />
                      </button>
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
        <div className="flex justify-center items-center gap-3 py-4 bg-white border border-t-0 border-gray-200 rounded-b-xl">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}

      <AddDriverModal
        open={open}
        setOpen={setOpen}
        editDriver={editDriver}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default AvailableDrivers;