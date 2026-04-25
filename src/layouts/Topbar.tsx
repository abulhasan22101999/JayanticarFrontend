

import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type Props = {
  setMobileOpen: (val: boolean) => void;
};

const Topbar = ({ setMobileOpen }: Props) => {
  const navigate = useNavigate();

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    // remove token
    localStorage.removeItem("token");

    toast.success("Logged out successfully");

    // redirect to login page
    navigate("/login");
  };

  return (
    <div className="h-[70px] flex items-center px-4 md:px-6 border-b border-gray-200 bg-white">
      
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 border border-gray-200 rounded mr-3"
      >
        ☰
      </button>

      <h1 className="text-lg font-bold flex-1">Dashboard</h1>

      <div className="flex items-center gap-2 md:gap-3">
        
        {/* 🔥 SEARCH BAR */}
        {/* <div
          className="hidden md:flex items-center border border-gray-200 rounded-lg px-3 
          transition-all duration-300 
          focus-within:border-red-500 focus-within:w-[260px] 
          w-[200px] bg-gray-50"
        >
          <FiSearch className="text-gray-400 mr-2" />

          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none w-full text-sm py-2"
          />
        </div> */}

        {/* 🔥 LOGOUT BUTTON (replaced notification) */}
        <button
          onClick={handleLogout}
          className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 transition"
        >
          <FiLogOut className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;