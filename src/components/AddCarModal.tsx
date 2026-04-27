import { useEffect, useState, type ChangeEvent } from "react";
import { FiX } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import toast from "react-hot-toast";
import { API_URL } from "../utils/api";

type Car = {
  _id: string;
  carName: string;
  carModel: string;
  carNumber: string;
  ownership: "self" | "others";
};

type CarForm = {
  carName: string;
  carModel: string;
  carNumber: string;
  ownership: "self" | "others";
};

type Errors = {
  carName?: string;
  carModel?: string;
  carNumber?: string;
};

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  editCar: Car | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddCarModal = ({ open, setOpen, editCar, setRefresh }: Props) => {
  const [formData, setFormData] = useState<CarForm>({
    carName: "",
    carModel: "",
    carNumber: "",
    ownership: "self",
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (editCar) {
      setFormData({
        carName: editCar.carName || "",
        carModel: editCar.carModel || "",
        carNumber: editCar.carNumber || "",
        ownership: editCar.ownership || "self",
      });
    } else {
      setFormData({
        carName: "",
        carModel: "",
        carNumber: "",
        ownership: "self",
      });
    }

    setErrors({});
  }, [editCar, open]);

  if (!open) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔥 VALIDATION FUNCTION
  const validate = () => {
    const newErrors: Errors = {};

    if (!formData.carName.trim()) {
      newErrors.carName = "Car name is required";
    } else if (formData.carName.trim().length < 2) {
      newErrors.carName = "Minimum 2 characters required";
    }

    if (!formData.carModel.trim()) {
      newErrors.carModel = "Car model is required";
    }

    if (!formData.carNumber.trim()) {
      newErrors.carNumber = "Car number is required";
    } else if (formData.carNumber.trim().length < 4) {
      newErrors.carNumber = "Invalid car number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const isEdit = !!editCar;

      const url = isEdit
        ? `${API_URL}/cars/${editCar?._id}`
        : `${API_URL}/cars`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error");
        return;
      }

      toast.success(isEdit ? "Updated 🚗" : "Added 🚗");

      setRefresh((prev) => !prev);
      setOpen(false);
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] px-4 md:px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg">
        <div className="flex justify-between items-center pt-6 pb-3 px-6">
          <h2 className="font-semibold text-lg">
            {editCar ? "Edit Car" : "Add Car"}
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="border border-gray-200 px-1 py-1 rounded-lg bg-gray-50 text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="py-2 md:px-6 px-3 grid grid-cols-2 md:gap-4 gap-2 text-gray-700">
          {/* CAR NAME */}
          <div>
            <label>Car Name</label>
            <input
              name="carName"
              value={formData.carName}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // 👈 only letters
                setFormData((prev) => ({ ...prev, carName: value }));
                setErrors((prev) => ({ ...prev, carName: "" }));
              }}
              placeholder="Enter car name"
              className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
            />
            {errors.carName && (
              <p className="text-red-500 text-xs mt-1">{errors.carName}</p>
            )}
          </div>

          {/* CAR MODEL */}
          <div>
            <label>Car Model</label>
            <input
              name="carModel"
              value={formData.carModel}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""); // 👈 alphanumeric
                setFormData((prev) => ({ ...prev, carModel: value }));
                setErrors((prev) => ({ ...prev, carModel: "" }));
              }}
              placeholder="Enter car model"
              className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
            />
            {errors.carModel && (
              <p className="text-red-500 text-xs mt-1">{errors.carModel}</p>
            )}
          </div>

          {/* CAR NUMBER */}
          <div>
            <label>Car Number</label>
            <input
              name="carNumber"
              value={formData.carNumber}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase() // 👈 auto uppercase
                  .replace(/[^A-Z0-9\s-]/g, ""); // 👈 only A-Z, 0-9, space, dash
                setFormData((prev) => ({ ...prev, carNumber: value }));
                setErrors((prev) => ({ ...prev, carNumber: "" }));
              }}
              placeholder="Enter car number"
              className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
            />
            {errors.carNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.carNumber}</p>
            )}
          </div>

          {/* OWNERSHIP */}
          <div>
            <label>Ownership</label>
            <select
              name="ownership"
              value={formData.ownership}
              onChange={handleChange}
              className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
            >
              <option value="self">Self</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 py-4 px-6">
          <button
            onClick={() => setOpen(false)}
            className="border border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdSave size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCarModal;
