
import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

type ForgotForm = {
  email: string;
};

const ForgotPassword = () => {
  const [form, setForm] = useState<ForgotForm>({
    email: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [resetLink, setResetLink] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ email: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      return toast.error("Email required");
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
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

      toast.success("Reset link generated ✅");

      // 🔥 show link (for now)
      setResetLink(data.resetLink);
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
          Forgot Password
        </h2>

        <div className="flex flex-col gap-3">

          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded-lg outline-none focus:border-orange-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-500 text-white py-2 rounded-lg"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* 🔥 show reset link */}
          {resetLink && (
            <a
              href={resetLink}
              className="text-blue-500 text-sm break-all"
            >
              {resetLink}
            </a>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;