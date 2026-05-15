import { useState, useEffect, type ChangeEvent } from "react";
import { FiX } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import toast from "react-hot-toast";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { API_URL } from "../utils/api";

// ✅ TYPES
type Car = {
  _id: string;
  carNumber: string;
  carName: string;
  carModel?: string;
  cartype?: string;
  status?: string;
};

type Driver = {
  _id: string;
  driverName: string;
  mobileNo?: string;
  status?: string;
};

type ApiResponse<T> = {
  data: T;
};

type BookingStatus = "pending" | "booked" | "complete" | "cancelled" | string;

type Booking = {
  _id: string;
  carId: {
    _id: string;
    carNumber: string;
    carName: string;
    carModel?: string;
    cartype?: string;
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

type BookingForm = {
  carId: string;
  driverId: string;
  pickupDate: string;
  dropDate: string;
  pickupLocation: string;
  dropLocation: string;
  guestName: string;
  guestMobileNo: string;
  company: string;
  reportingAddress: string;
  reportingTime: string;
};

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  editBooking: Booking | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormErrors = {
  pickupDate?: string;
  dropDate?: string;
  guestMobileNo?: string;
};



const AddBookingModal = ({ open, setOpen, editBooking, setRefresh }: Props) => {
  const [form, setForm] = useState<BookingForm>({
    carId: "",
    driverId: "",
    pickupDate: "",
    dropDate: "",
    pickupLocation: "",
    dropLocation: "",
    guestName: "",
    guestMobileNo: "",
    company: "",
    reportingAddress: "",
    reportingTime: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [carSearch, setCarSearch] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedCarType, setSelectedCarType] = useState(""); // ✅ NEW

  const [driverSearch, setDriverSearch] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");

  const resetForm = () => {
    setForm({
      carId: "",
      driverId: "",
      pickupDate: "",
      dropDate: "",
      pickupLocation: "",
      dropLocation: "",
      guestName: "",
      guestMobileNo: "",
      company: "",
      reportingAddress: "",
      reportingTime: "",
    });
    setErrors({});
    setCarSearch("");
    setDriverSearch("");
    setSelectedCar("");
    setSelectedDriver("");
    setSelectedCarType(""); // ✅ reset type
    setCars([]);
    setDrivers([]);
  };

  useEffect(() => {
    if (editBooking) {
      setForm({
        carId:
          editBooking.carId && typeof editBooking.carId === "object"
            ? editBooking.carId._id
            : (editBooking.carId as unknown as string) || "",
        driverId:
          editBooking.driverId && typeof editBooking.driverId === "object"
            ? editBooking.driverId._id
            : (editBooking.driverId as unknown as string) || "",
        pickupDate: editBooking.pickupDate?.slice(0, 10) || "",
        dropDate: editBooking.dropDate ? editBooking.dropDate.slice(0, 10) : "",
        pickupLocation: editBooking.pickupLocation || "",
        dropLocation: editBooking.dropLocation || "",
        guestName: editBooking.guestName || "",
        guestMobileNo: editBooking.guestMobileNo || "",
        company: editBooking.company || "",
        reportingAddress: editBooking.reportingAddress || "",
        reportingTime: editBooking.reportingTime || "",
      });

      if (editBooking.carId && typeof editBooking.carId === "object") {
        setSelectedCar(
          `${editBooking.carId.carName} | ${editBooking.carId.carModel ?? ""} | ${editBooking.carId.carNumber}`,
        );
        // ✅ Pre-fill type from existing booking car
        setSelectedCarType(editBooking.carId.cartype || "");
      } else {
        setSelectedCar("");
        setSelectedCarType("");
      }

      if (editBooking.driverId && typeof editBooking.driverId === "object") {
        setSelectedDriver(
          `${editBooking.driverId.driverName} (${editBooking.driverId.mobileNo ?? ""})`,
        );
      } else {
        setSelectedDriver("");
      }
    } else {
      resetForm();
    }
  }, [editBooking, open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // CAR SEARCH — type alone shows filtered cars; search narrows further
  useEffect(() => {
    if (selectedCar) { setCars([]); return; }
    // Need at least one: carSearch OR selectedCarType
    if (!carSearch && !selectedCarType.trim()) { setCars([]); return; }
    const timer = setTimeout(async () => {
      let url = `${API_URL}/cars/search?status=active`;
      if (carSearch) url += `&q=${carSearch}`;
      if (selectedCarType.trim()) url += `&cartype=${encodeURIComponent(selectedCarType.trim())}`;
      const res = await fetch(url);
      const data: ApiResponse<Car[]> = await res.json();
      setCars(data.data.filter((c) => c.status === "active"));
    }, 400);
    return () => clearTimeout(timer);
  }, [carSearch, selectedCarType, selectedCar]);

  // ✅ DRIVER SEARCH
  useEffect(() => {
    if (!driverSearch) {
      setDrivers([]);
      return;
    }
    const fetchDrivers = async () => {
      const res = await fetch(
        `${API_URL}/drivers/search?q=${driverSearch}&status=active`,
      );
      const data: ApiResponse<Driver[]> = await res.json();
      setDrivers(data.data.filter((d) => d.status === "active"));
    };
    fetchDrivers();
  }, [driverSearch]);

  // ✅ Only pickupDate & dropDate mandatory
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.pickupDate) newErrors.pickupDate = "Pickup date is required";
    if (!form.dropDate) newErrors.dropDate = "Drop date is required";

    // Mobile optional — but if filled must be 10 digits
    if (form.guestMobileNo && form.guestMobileNo.length !== 10) {
      newErrors.guestMobileNo = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please check the required fields");
      return;
    }

    try {
      const url = editBooking
        ? `${API_URL}/bookings/${editBooking._id}`
        : `${API_URL}/bookings`;

      const payload = {
        ...form,
        carId: form.carId || null,
        driverId: form.driverId || null,
      };

      const res = await fetch(url, {
        method: editBooking ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return toast.error("Error saving booking");

      toast.success(editBooking ? "Booking updated ✅" : "Booking created ✅");
      resetForm();
      setOpen(false);
      setRefresh((p) => !p);
    } catch {
      toast.error("Server error");
    }
  };

  if (!open) return null;

  const errClass = (field: keyof FormErrors) =>
    errors[field] ? "border-red-400" : "border-gray-200";

  const getLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-xl md:p-6 p-4 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">
              {editBooking ? "Edit Booking" : "Add Booking"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Only pickup & drop date are required
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* ── PICKUP DATE ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <div className={`border p-2 rounded-lg ${errClass("pickupDate")}`}>
              <DatePicker
                selected={form.pickupDate ? getLocalDate(form.pickupDate) : null}
                onChange={(date: Date | null) => {
                  setForm((prev) => ({
                    ...prev,
                    pickupDate: date ? format(date, "yyyy-MM-dd") : "",
                    dropDate: "",
                  }));
                  if (errors.pickupDate)
                    setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                }}
                placeholderText="dd/mm/yyyy"
                minDate={editBooking ? undefined : new Date()}
                dateFormat="dd/MM/yyyy"
                className="w-full outline-none bg-transparent text-sm"
                popperPlacement="bottom-start"
              />
            </div>
            {errors.pickupDate && (
              <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>
            )}
          </div>

          {/* ── DROP DATE ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Drop Date <span className="text-red-500">*</span>
            </label>
            <div className={`border p-2 rounded-lg ${errClass("dropDate")}`}>
              <DatePicker
                selected={form.dropDate ? getLocalDate(form.dropDate) : null}
                onChange={(date: Date | null) => {
                  setForm((prev) => ({
                    ...prev,
                    dropDate: date ? format(date, "yyyy-MM-dd") : "",
                  }));
                  if (errors.dropDate)
                    setErrors((prev) => ({ ...prev, dropDate: undefined }));
                }}
                placeholderText="dd/mm/yyyy"
                minDate={form.pickupDate ? getLocalDate(form.pickupDate) : new Date()}
                dateFormat="dd/MM/yyyy"
                className="w-full outline-none bg-transparent text-sm"
                popperPlacement="bottom-start"
              />
            </div>
            {errors.dropDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dropDate}</p>
            )}
          </div>

          {/* ── CAR TYPE INPUT ── ✅ NEW FIELD */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Car Type
            </label>
            <input
              placeholder="e.g. SUV, Sedan, Van..."
              value={selectedCarType}
              onChange={(e) => {
                setSelectedCarType(e.target.value);
                // Clear previously selected car when type changes
                setSelectedCar("");
                setCarSearch("");
                setForm((prev) => ({ ...prev, carId: "" }));
                setCars([]);
              }}
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>

          {/* ── CAR SEARCH ── */}
          <div className="col-span-2 relative">
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Car
            </label>
            <input
              placeholder={
                selectedCarType
                  ? `Search ${selectedCarType} cars...`
                  : "Search car by name or number..."
              }
              value={selectedCar || carSearch}
              onChange={(e) => {
                setCarSearch(e.target.value);
                setSelectedCar("");
                setForm((prev) => ({ ...prev, carId: "" }));
              }}
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
            {selectedCar && (
              <button
                onClick={() => {
                  setSelectedCar("");
                  setCarSearch("");
                  setForm((prev) => ({ ...prev, carId: "" }));
                }}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
            )}
            {cars.length > 0 && !selectedCar && (
              <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded-lg shadow-lg max-h-40 overflow-auto z-20">
                {cars.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, carId: c._id }));
                      setSelectedCar(
                        `${c.carName} | ${c.carModel || "N/A"} | ${c.carNumber}`,
                      );
                      setCars([]);
                      setCarSearch("");
                    }}
                    className={`p-2.5 cursor-pointer text-sm border-b border-gray-100 last:border-0
                     hover:bg-orange-50 transition`}
                  >
                    <div className="flex flex-col">
                      {/* 🔹 Car Name */}
                      <span className="font-medium text-gray-800">
                        {c.carName || "Unknown Car"}
                      </span>

                      {/* 🔹 Details line */}
                      <span className="text-gray-500 text-xs">
                        {c.carModel || "N/A"} | {c.carNumber || "N/A"}
                        {c.cartype && ` | ${c.cartype}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DRIVER SEARCH ── */}
          <div className="col-span-2 relative">
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Driver
            </label>
            <input
              placeholder="Search driver by name or mobile..."
              value={selectedDriver || driverSearch}
              onChange={(e) => {
                setDriverSearch(e.target.value);
                setSelectedDriver("");
                setForm((prev) => ({ ...prev, driverId: "" }));
              }}
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
            {selectedDriver && (
              <button
                onClick={() => {
                  setSelectedDriver("");
                  setDriverSearch("");
                  setForm((prev) => ({ ...prev, driverId: "" }));
                }}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
            )}
            {drivers.length > 0 && !selectedDriver && (
              <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded-lg shadow-lg max-h-40 overflow-auto z-20">
                {drivers.map((d) => (
                  <div
                    key={d._id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, driverId: d._id }));
                      setSelectedDriver(
                        `${d.driverName} (${d.mobileNo ?? ""})`,
                      );
                      setDrivers([]);
                      setDriverSearch("");
                    }}
                    className="p-2.5 hover:bg-orange-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="font-medium">{d.driverName}</span>
                    {d.mobileNo && (
                      <span className="text-gray-400"> ({d.mobileNo})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── GUEST NAME ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Guest Name
            </label>
            <input
              name="guestName"
              value={form.guestName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setForm((prev) => ({ ...prev, guestName: value }));
              }}
              placeholder="Guest name"
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>

          {/* ── MOBILE ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Mobile No.
            </label>
            <input
              name="guestMobileNo"
              value={form.guestMobileNo}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((prev) => ({ ...prev, guestMobileNo: digits }));
                if (errors.guestMobileNo)
                  setErrors((prev) => ({ ...prev, guestMobileNo: undefined }));
              }}
              placeholder="10-digit mobile"
              inputMode="numeric"
              className={`border p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300 ${errClass("guestMobileNo")}`}
            />
            {errors.guestMobileNo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.guestMobileNo}
              </p>
            )}
          </div>

          {/* ── PICKUP LOCATION ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Pickup Location
            </label>
            <input
              name="pickupLocation"
              value={form.pickupLocation}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
                setForm((prev) => ({ ...prev, pickupLocation: value }));
              }}
              placeholder="Pickup location"
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>

          {/* ── DROP LOCATION ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Drop Location
            </label>
            <input
              name="dropLocation"
              value={form.dropLocation}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
                setForm((prev) => ({ ...prev, dropLocation: value }));
              }}
              placeholder="Drop location"
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>

          {/* ── COMPANY ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Company
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company name"
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>

          {/* ── REPORTING TIME ── */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Reporting Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                value={form.reportingTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    reportingTime: e.target.value,
                  }))
                }
                className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
              />
            </div>
          </div>

          {/* ── SERVICE DESCRIPTION ── */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Service Description
            </label>
            <input
              name="reportingAddress"
              value={form.reportingAddress}
              onChange={handleChange}
              placeholder="Service description"
              className="border border-gray-200 p-2 rounded-lg w-full text-sm outline-none focus:border-orange-300"
            />
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            className="border border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <MdSave size={16} />
            {editBooking ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookingModal;
