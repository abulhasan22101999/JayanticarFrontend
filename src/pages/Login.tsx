
import { useState, ChangeEvent, KeyboardEvent } from "react";
import { loginUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ✅ TYPES
type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // ✅ handle change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ ENTER key submit
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // ✅ submit
  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      return toast.error("All fields required");
    }

    try {
      setLoading(true);

      const data = await loginUser(form.email, form.password);

      login(data.user, data.token);

      toast.success("Login successful ✅");

      navigate("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white md:p-10 p-4 rounded-xl shadow-md w-full max-w-sm mx-4 md:mx-0">

        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <div className="flex flex-col gap-3">

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="border border-gray-300 p-2 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="border border-gray-300 p-2 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />

          {/* FORGOT */}
         

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging..." : "Login"}
          </button>


           <p
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-blue-500 cursor-pointer text-center hover:underline"
          >
            Forgot Password?
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;