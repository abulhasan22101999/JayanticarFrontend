
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { MdEventBusy } from "react-icons/md";
import toast from "react-hot-toast";

type Driver = {
  _id: string;
  driverName: string;
  mobileNo: string;
  alternateMobileNo?: string;
  status: "available" | "booked";
};

const BookedDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");

  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/drivers?status=booked"
      );
      const data = await res.json();
      setDrivers(data.data || []);
    } catch {
      toast.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = drivers.filter((d) =>
    d.driverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Booked Drivers</h2>
        <p className="text-sm text-gray-400">{drivers.length} drivers</p>
      </div>

      {/* FILTER */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex items-center border px-3 rounded-lg bg-gray-50 w-[250px]">
          <FiSearch />
          <input
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 w-full outline-none bg-transparent"
          />
        </div>

        <div className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium">
          Booked Only
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 border-t-0 overflow-hidden rounded-b-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">NAME</th>
                <th className="p-4 text-left">MOBILE</th>
                <th className="p-4 text-left">ALT MOBILE</th>
                <th className="p-4 text-left">STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((d) => (
                <tr key={d._id} className="border-t border-gray-200">
                  <td className="p-3">{d.driverName}</td>
                  <td className="p-3">{d.mobileNo}</td>
                  <td className="p-3">{d.alternateMobileNo || "-"}</td>

                  <td className="p-3">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                      <MdEventBusy size={14} /> Booked
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookedDrivers;