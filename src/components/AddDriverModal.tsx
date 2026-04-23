import { useEffect, useState, ChangeEvent } from "react";
import { FiX } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import toast from "react-hot-toast";

type Driver = {
  _id: string;
  driverName: string;
  mobileNo: string;
  alternateMobileNo?: string;
};

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  editDriver: Driver | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

type Errors = {
  driverName?: string;
  mobileNo?: string;
  alternateMobileNo?: string;
};

const AddDriverModal = ({ open, setOpen, editDriver, setRefresh }: Props) => {
  const [formData, setFormData] = useState({
    driverName: "",
    mobileNo: "",
    alternateMobileNo: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (editDriver) {
      setFormData({
        driverName: editDriver.driverName || "",
        mobileNo: editDriver.mobileNo || "",
        alternateMobileNo: editDriver.alternateMobileNo || "",
      });
    } else {
      setFormData({
        driverName: "",
        mobileNo: "",
        alternateMobileNo: "",
      });
    }

    setErrors({});
  }, [editDriver, open]);

  if (!open) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // 🔥 VALIDATION FUNCTION
  const validate = () => {
    const newErrors: Errors = {};
    const mobileRegex = /^[0-9]{10}$/;

    if (!formData.driverName.trim()) {
      newErrors.driverName = "Driver name is required";
    } else if (formData.driverName.trim().length < 3) {
      newErrors.driverName = "Minimum 3 characters required";
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobileNo)) {
      newErrors.mobileNo = "Enter valid 10 digit number";
    }

    if (
      formData.alternateMobileNo &&
      !mobileRegex.test(formData.alternateMobileNo)
    ) {
      newErrors.alternateMobileNo = "Enter valid 10 digit number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const isEdit = !!editDriver;

      const url = isEdit
        ? `http://localhost:5000/api/drivers/${editDriver?._id}`
        : "http://localhost:5000/api/drivers";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName: formData.driverName.trim(),
          mobileNo: formData.mobileNo.trim(),
          alternateMobileNo: formData.alternateMobileNo.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.message);

      toast.success(isEdit ? "Updated" : "Added");

      setRefresh((prev) => !prev);
      setOpen(false);
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg">
        <div className="flex justify-between items-center pt-6 pb-3 px-6">
          <h2 className="font-semibold text-lg">
            {editDriver ? "Edit Driver" : "Add Driver"}
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="border border-gray-200 px-1 py-1 rounded-lg bg-gray-50 text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="py-4 px-6 grid grid-cols-2 gap-4 text-gray-700">
          {/* NAME */}
          <div>
            <label>Driver Name</label>
           <input
  type="text"
  name="driverName"
  value={formData.driverName}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // 👈 only letters & space
    setFormData((prev) => ({ ...prev, driverName: value }));
    setErrors((prev) => ({ ...prev, driverName: "" }));
  }}
  placeholder="Enter driver name"
  className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
/>
            {errors.driverName && (
              <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>
            )}
          </div>

          {/* MOBILE */}
          <div>
            <label>Mobile Number</label>
            <input
  type="text"
  inputMode="numeric"
  name="mobileNo"
  value={formData.mobileNo}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10); // 👈 max 10
    setFormData((prev) => ({ ...prev, mobileNo: value }));
    setErrors((prev) => ({ ...prev, mobileNo: "" }));
  }}
  placeholder="Enter mobile number"
  className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
/>
            {errors.mobileNo && (
              <p className="text-red-500 text-xs mt-1">{errors.mobileNo}</p>
            )}
          </div>

          {/* ALT MOBILE */}
          <div className="col-span-2">
            <label>Alternate Number (Optional)</label>
           <input
  type="text"
  inputMode="numeric"
  name="alternateMobileNo"
  value={formData.alternateMobileNo}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10); // 👈 max 10
    setFormData((prev) => ({ ...prev, alternateMobileNo: value }));
    setErrors((prev) => ({ ...prev, alternateMobileNo: "" }));
  }}
  placeholder="Enter alternate number"
  className="border border-gray-200 p-2 rounded-lg w-full md:mt-1"
/>
            {errors.alternateMobileNo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.alternateMobileNo}
              </p>
            )}
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
            <MdSave size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDriverModal;
