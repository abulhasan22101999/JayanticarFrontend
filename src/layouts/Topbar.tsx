import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type Props = {
  setMobileOpen: (val: boolean) => void;
};

const Topbar = ({ setMobileOpen }: Props) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="h-[60px] sm:h-[70px] flex items-center px-3 sm:px-4 md:px-6 border-b border-gray-200 bg-white">

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 border border-gray-200 rounded-md mr-2 sm:mr-3 active:scale-95 transition"
      >
        ☰
      </button>

      {/* Title */}
      <h1 className="text-base sm:text-lg md:text-xl font-semibold flex-1 truncate">
        Dashboard
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg hover:bg-red-50 active:scale-95 transition"
        >
          <FiLogOut className="text-red-500 text-sm sm:text-base" />

          {/* Hide text in mobile */}
          <span className="hidden sm:block text-sm text-red-500">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;