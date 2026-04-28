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

// ✅ Fix 1: Define BookingStatus
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | string;

type Booking = {
  _id: string;
  // ✅ Fix 3 & 4: Add carModel to carId and mobileNo to driverId
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
  carId?: string;
  driverId?: string;
  pickupDate?: string;
  dropDate?: string;
  pickupLocation?: string;
  dropLocation?: string;
  guestName?: string;
  guestMobileNo?: string;
};

// ✅ Location must contain at least one letter (not only digits/symbols)
const hasAtLeastOneLetter = (value: string) => /[a-zA-Z]/.test(value);

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
    setCars([]);
    setDrivers([]);
  };

  useEffect(() => {
    if (editBooking) {
      setForm({
        // ✅ Fix 2: Cast through unknown to avoid null→string overlap error
        carId:
          editBooking.carId && typeof editBooking.carId === "object"
            ? editBooking.carId._id
            : (editBooking.carId as unknown as string) || "",
        driverId:
          editBooking.driverId && typeof editBooking.driverId === "object"
            ? editBooking.driverId._id
            : (editBooking.driverId as unknown as string) || "",
        pickupDate: editBooking.pickupDate.slice(0, 10),
        dropDate: editBooking.dropDate ? editBooking.dropDate.slice(0, 10) : "",
        pickupLocation: editBooking.pickupLocation,
        dropLocation: editBooking.dropLocation,
        guestName: editBooking.guestName,
        guestMobileNo: editBooking.guestMobileNo,
        company: editBooking.company || "",
        reportingAddress: editBooking.reportingAddress || "",
        reportingTime: editBooking.reportingTime || "",
      });

      if (editBooking.carId && typeof editBooking.carId === "object") {
        setSelectedCar(
          `${editBooking.carId.carName} | ${editBooking.carId.carModel ?? ""} | ${editBooking.carId.carNumber}`,
        );
      } else {
        setSelectedCar("");
      }

      if (editBooking.driverId && typeof editBooking.driverId === "object") {
        setSelectedDriver(
          `${editBooking.driverId.driverName} (${editBooking.driverId.mobileNo ?? ""})`,
        );
      } else {
        setSelectedDriver("");
      }
    }
  }, [editBooking]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "guestMobileNo") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, guestMobileNo: digits }));
      if (errors.guestMobileNo) {
        setErrors((prev) => ({ ...prev, guestMobileNo: undefined }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ✅ CAR SEARCH
  useEffect(() => {
    if (!carSearch) {
      setCars([]);
      return;
    }
    const fetchCars = async () => {
      const res = await fetch(
        `${API_URL}/cars/search?q=${carSearch}&status=active`,
      );
      const data: ApiResponse<Car[]> = await res.json();
      setCars(data.data.filter((c) => c.status === "active"));
    };
    fetchCars();
  }, [carSearch]);

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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.pickupDate) newErrors.pickupDate = "Pickup date is required";
    if (!form.dropDate) newErrors.dropDate = "Drop date is required";

    if (!form.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
    } else if (!hasAtLeastOneLetter(form.pickupLocation)) {
      newErrors.pickupLocation = "Must contain at least one letter";
    }

    if (!form.dropLocation.trim()) {
      newErrors.dropLocation = "Drop location is required";
    } else if (!hasAtLeastOneLetter(form.dropLocation)) {
      newErrors.dropLocation = "Must contain at least one letter";
    }

    if (!form.guestName.trim()) newErrors.guestName = "Guest name is required";
    if (!form.guestMobileNo) {
      newErrors.guestMobileNo = "Mobile number is required";
    } else if (form.guestMobileNo.length !== 10) {
      newErrors.guestMobileNo = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill data");
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

      toast.success("Booking saved successfully");
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

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4 md:mx-0">
      <div className="bg-white w-full max-w-lg rounded-xl md:p-6 p-3">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-lg">
            {editBooking ? "Edit Booking" : "Add Booking"}
          </h2>
          <FiX
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            className="cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 md:gap-3 gap-2">
          {/* PICKUP DATE */}
          <div>
            <div className={`border p-2 rounded-lg ${errClass("pickupDate")}`}>
              <DatePicker
                selected={form.pickupDate ? new Date(form.pickupDate) : null}
                onChange={(date: Date | null) => {
                  setForm((prev) => ({
                    ...prev,
                    pickupDate: date ? date.toISOString().split("T")[0] : "",
                    dropDate: "",
                  }));
                  if (errors.pickupDate)
                    setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                }}
                placeholderText="Pickup Date *"
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="w-full outline-none bg-transparent"
                popperPlacement="bottom-start"
              />
            </div>
            {errors.pickupDate && (
              <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>
            )}
          </div>

          {/* DROP DATE */}
          <div>
            <div className={`border p-2 rounded-lg ${errClass("dropDate")}`}>
              <DatePicker
                selected={form.dropDate ? new Date(form.dropDate) : null}
                onChange={(date: Date | null) => {
                  setForm((prev) => ({
                    ...prev,
                    dropDate: date ? format(date, "yyyy-MM-dd") : "",
                  }));
                  if (errors.dropDate)
                    setErrors((prev) => ({ ...prev, dropDate: undefined }));
                }}
                placeholderText="Drop Date *"
                minDate={
                  form.pickupDate
                    ? new Date(form.pickupDate + "T00:00:00")
                    : new Date()
                }
                dateFormat="yyyy-MM-dd"
                className="w-full outline-none bg-transparent"
                popperPlacement="bottom-start"
              />
            </div>
            {errors.dropDate && (
              <p className="text-red-500 text-xs mt-1">{errors.dropDate}</p>
            )}
          </div>

          {/* CAR SEARCH */}
          <div className="col-span-2 relative">
            <input
              placeholder="Search Car *"
              value={selectedCar || carSearch}
              onChange={(e) => {
                setCarSearch(e.target.value);
                setSelectedCar("");
                setForm((prev) => ({ ...prev, carId: "" }));
                if (errors.carId)
                  setErrors((prev) => ({ ...prev, carId: undefined }));
              }}
              className={`border p-2 rounded-lg w-full border-gray-200`}
            />
            {errors.carId && (
              <p className="text-red-500 text-xs mt-1">{errors.carId}</p>
            )}

            {cars.length > 0 && !selectedCar && (
              <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-40 overflow-auto z-10">
                {cars.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, carId: c._id }));
                      setSelectedCar(
                        `${c.carName} | ${c.carModel} | ${c.carNumber}`,
                      );
                      setCars([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {c.carName} | {c.carModel} | {c.carNumber}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DRIVER SEARCH */}
          <div className="col-span-2 relative">
            <input
              placeholder="Search Driver *"
              value={selectedDriver || driverSearch}
              onChange={(e) => {
                setDriverSearch(e.target.value);
                setSelectedDriver("");
                setForm((prev) => ({ ...prev, driverId: "" }));
                if (errors.driverId)
                  setErrors((prev) => ({ ...prev, driverId: undefined }));
              }}
              className={`border p-2 rounded-lg w-full border-gray-200`}
            />
            {errors.driverId && (
              <p className="text-red-500 text-xs mt-1">{errors.driverId}</p>
            )}

            {drivers.length > 0 && !selectedDriver && (
              <div className="absolute bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-40 overflow-auto z-10">
                {drivers.map((d) => (
                  <div
                    key={d._id}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, driverId: d._id }));
                      setSelectedDriver(`${d.driverName} (${d.mobileNo})`);
                      setDrivers([]);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {d.driverName} ({d.mobileNo})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PICKUP LOCATION */}
          <div>
            <input
              name="pickupLocation"
              value={form.pickupLocation}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
                setForm((prev) => ({ ...prev, pickupLocation: value }));
                if (errors.pickupLocation)
                  setErrors((prev) => ({ ...prev, pickupLocation: undefined }));
              }}
              placeholder="Pickup Location *"
              className={`border p-2 rounded-lg w-full ${errClass("pickupLocation")}`}
            />
            {errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">
                {errors.pickupLocation}
              </p>
            )}
          </div>

          {/* DROP LOCATION */}
          <div>
            <input
              name="dropLocation"
              value={form.dropLocation}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
                setForm((prev) => ({ ...prev, dropLocation: value }));
                if (errors.dropLocation)
                  setErrors((prev) => ({ ...prev, dropLocation: undefined }));
              }}
              placeholder="Drop Location *"
              className={`border p-2 rounded-lg w-full ${errClass("dropLocation")}`}
            />
            {errors.dropLocation && (
              <p className="text-red-500 text-xs mt-1">{errors.dropLocation}</p>
            )}
          </div>

          {/* GUEST NAME */}
          <div>
            <input
              name="guestName"
              value={form.guestName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setForm((prev) => ({ ...prev, guestName: value }));
                if (errors.guestName)
                  setErrors((prev) => ({ ...prev, guestName: undefined }));
              }}
              placeholder="Guest Name *"
              className={`border p-2 rounded-lg w-full ${errClass("guestName")}`}
            />
            {errors.guestName && (
              <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>
            )}
          </div>

          {/* MOBILE */}
          <div>
            <input
              name="guestMobileNo"
              value={form.guestMobileNo}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((prev) => ({ ...prev, guestMobileNo: digits }));
                if (errors.guestMobileNo)
                  setErrors((prev) => ({ ...prev, guestMobileNo: undefined }));
              }}
              placeholder="Mobile *"
              inputMode="numeric"
              className={`border p-2 rounded-lg w-full ${errClass("guestMobileNo")}`}
            />
            {errors.guestMobileNo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.guestMobileNo}
              </p>
            )}
          </div>

          {/* COMPANY */}
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company (optional)"
            className="border border-gray-200 p-2 rounded-lg"
          />

          {/* REPORTING ADDRESS */}
          <input
            name="reportingAddress"
            value={form.reportingAddress}
            onChange={handleChange}
            placeholder="Reporting Address (optional)"
            className="border border-gray-200 p-2 rounded-lg"
          />

          {/* REPORTING TIME */}
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">
              Reporting Time (optional)
            </label>
            <input
              type="time"
              name="reportingTime"
              value={form.reportingTime}
              onChange={handleChange}
              className="border border-gray-200 p-2 rounded-lg w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 py-4 px-6">
          <button
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            className="border border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdSave size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookingModal;
