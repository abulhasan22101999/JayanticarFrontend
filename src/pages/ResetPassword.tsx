
import { useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../utils/api";

type ResetForm = {
  password: string;
};

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<ResetForm>({
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ password: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.password.trim()) {
      return toast.error("Password required");
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Password reset successful ✅");

      navigate("/login");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">

        <h2 className="text-xl font-bold mb-4 text-center">
          Reset Password
        </h2>

        <div className="flex flex-col gap-3">

          <input
            type="password"
            placeholder="Enter new password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded-lg outline-none focus:border-orange-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-500 text-white py-2 rounded-lg"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;