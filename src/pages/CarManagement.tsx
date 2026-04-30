import { useEffect, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import AddCarModal from "../components/AddCarModal";
import { MdEdit, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { API_URL } from "../utils/api";

type CarStatus = "active" | "inactive" | "booked";

type Car = {
  _id: string;
  carName: string;
  carModel: string;
  carNumber: string;
  cartype: string;
  ownership: "self" | "others";
  status: CarStatus;
};

const CarManagement = () => {
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [open, setOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refresh, setRefresh] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch Cars
  const fetchCars = async () => {
    try {
      let url = `${API_URL}/cars`;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setCars(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [statusFilter, refresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, cars]);

  // ✅ Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`${API_URL}/cars/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Car deleted");
      setRefresh((prev) => !prev);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleAdd = () => {
    setEditCar(null);
    setOpen(true);
  };

  const filteredCars = cars.filter((car) => {
    const keyword = search.toLowerCase();

    return (
      car.carNumber?.toLowerCase().includes(keyword) ||
      car.carName?.toLowerCase().includes(keyword) ||
      car.carModel?.toLowerCase().includes(keyword) ||
      car.cartype?.toLowerCase().includes(keyword) ||
      car.ownership?.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ✅ STATUS UPDATE (TYPE SAFE)
  // const handleCarStatusChange = async (
  //   id: string,
  //   status: CarStatus,
  // ) => {
  //   try {
  //     const res = await fetch(
  //       `${API_URL}/cars/status/${id}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ status }),
  //       },
  //     );

  //     const data = await res.json();

  //     if (!res.ok) return toast.error(data.message);

  //     toast.success("Car status updated");

  //     setCars((prev) =>
  //       prev.map((item) =>
  //         item._id === id ? { ...item, status } : item,
  //       ),
  //     );
  //   } catch {
  //     toast.error("Status update failed");
  //   }
  // };

  const handleCarStatusChange = async (id: string, status: CarStatus) => {
    try {
      const res = await fetch(`${API_URL}/cars/status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      // 🔥 booked হলে error toast দেখাবে, status change হবে না
      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Car status updated");

      setCars((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item)),
      );
    } catch {
      toast.error("Status update failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Car Managment</h2>
          <p className="text-sm text-gray-400">{cars.length} vehicles</p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <FiPlus /> Add Car
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex items-center border border-gray-200 px-3 rounded-lg w-full md:w-[250px] bg-gray-50">
          <FiSearch className="text-gray-400" />
          <input
            placeholder="Search cars..."
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
          <option value="booked">Blocked</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 border-t-0 overflow-hidden rounded-bl-xl rounded-br-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-left">CAR NAME</th>
                <th className="p-4 text-left">CAR MODEL</th>
                <th className="p-4 text-left">CAR NUMBER</th>
                <th className="p-4 text-left">CAR TYPE</th>
                <th className="p-4 text-left">OWNERSHIP</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCars.map((car) => (
                <tr
                  key={car._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{car.carName}</td>
                  <td className="p-3">{car.carModel}</td>
                  <td className="p-3">{car.carNumber}</td>
                  <td className="p-3">{car.cartype}</td>
                  <td className="p-3 capitalize">{car.ownership}</td>

                  {/* STATUS (NO DESIGN CHANGE) */}
                  <td className="p-3">
                    {car.status === "booked" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-gray-200">
                        blocked
                      </span>
                    ) : (
                      <div className="relative inline-flex items-center">
                        <select
                          value={car.status}
                          onChange={(e) =>
                            handleCarStatusChange(
                              car._id,
                              e.target.value as CarStatus,
                            )
                          }
                          className={`pl-2 pr-4 py-1 rounded-full text-xs font-medium border border-gray-200 outline-none cursor-pointer appearance-none ${
                            car.status === "active"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 text-[14px]">
                          ▾
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditCar(car);
                        setOpen(true);
                      }}
                      disabled={car.status === "booked"}
                      className={`border p-2 rounded-lg ${
                        car.status === "booked"
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <MdEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(car._id)}
                      disabled={car.status === "booked"}
                      className={`border p-2 rounded-lg text-red-500 ${
                        car.status === "booked"
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
      <AddCarModal
        open={open}
        setOpen={setOpen}
        editCar={editCar}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default CarManagement;
