import { NavLink } from "react-router-dom";
 import { useAuth } from "../context/AuthContext";
import {
  MdDashboard,
 
  MdDirectionsCar,
  MdBookOnline,
  MdHistory,
 
  MdPersonSearch,
} from "react-icons/md";
 import { FaUserTie } from "react-icons/fa";


type Props = {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
};

const Sidebar = ({

  
  collapsed,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
}: Props) => {
  const { user } = useAuth();

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
        transition-all duration-300
        
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
        
        ${collapsed ? "lg:w-[80px]" : "lg:w-[250px]"}
        w-[250px]
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 text-white p-2 rounded-lg">
            <MdDirectionsCar size={20} />
          </div>

          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm">Jayanti Car Booking</h1>
              <p className="text-xs text-gray-400">Fleet Management</p>
            </div>
          )}
        </div>

        {/* Desktop collapse */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-1 border border-gray-200 rounded-lg text-gray-400"
        >
          ☰
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 border rounded-lg"
        >
          ✕
        </button>
      </div>

      {/* MENU */}
      <nav className="mt-4 px-3 text-sm">

        {/* MAIN */}
        {!collapsed && (
          <p className="text-xs text-gray-400 font-semibold mb-2 px-2">
            MAIN
          </p>
        )}

        <NavLink
          to="/"
          end
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdDashboard size={20} />
          {!collapsed && "Dashboard"}
        </NavLink>

        {/* MANAGEMENT */}
        {!collapsed && (
          <p className="text-xs text-gray-400 font-semibold mt-4 mb-2 px-2">
            MANAGEMENT
          </p>
        )}

        {/* <NavLink
          to="/user"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdManageAccounts size={20} />
          {!collapsed && "User Management"}
        </NavLink> */}


       

            <NavLink
  to="/drivermanagment"
  onClick={() => setMobileOpen(false)}
  className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
      isActive
        ? "bg-orange-500 text-white font-semibold shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    }`
  }
>
  <FaUserTie size={20} />
  {!collapsed && "Driver Management"}
         </NavLink>

        <NavLink
          to="/carmanagment"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdDirectionsCar size={20} />
          {!collapsed && "Car Management"}
        </NavLink>



        {/* BOOKING */}

        <NavLink
          to="/bookingmanagment"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <div className="flex items-center gap-3">
            <MdBookOnline size={20} />
            {!collapsed && "Booking Management"}
          </div>

          {/* {!collapsed && (
            <span className="bg-white text-orange-500 text-xs px-2 py-0.5 rounded-full">
              14
            </span>
          )} */}
        </NavLink>


        {/* OPERATIONS */}
        {!collapsed && (
          <p className="text-xs text-gray-400 font-semibold mt-4 mb-2 px-2">
            OPERATIONS
          </p>
        )}

        {/* <NavLink
          to="/car"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdEventAvailable size={20} />
          {!collapsed && " Car"}
        </NavLink> */}

        <NavLink
          to="/bookinghistory"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdHistory size={20} />
          {!collapsed && "Booking History"}
        </NavLink>

        {/* <NavLink
          to="/rep"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdBarChart size={20} />
          {!collapsed && "Reports"}
        </NavLink> */}

        {/* TOOLS */}
        {!collapsed && (
          <p className="text-xs text-gray-400 font-semibold mt-4 mb-2 px-2">
            TOOLS
          </p>
        )}

        {/* <NavLink
          to="/whatsapp"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdChat size={20} />
          {!collapsed && "WhatsApp Automation"}
        </NavLink> */}

        <NavLink
          to="/guestportal"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <MdPersonSearch size={20} />
          {!collapsed && "Guest Portal"}
        </NavLink>

      </nav>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full p-3 border-t border-gray-200">
  <div className="flex items-center gap-2">
    
    <div className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center rounded-lg">
      {user?.email?.charAt(0).toUpperCase() || "A"}
    </div>

    {!collapsed && (
      <div>
        <p className="text-sm font-semibold">
          {user?.email || "Admin User"}
        </p>
        <p className="text-xs text-gray-400">Admin</p>
      </div>
    )}
    
  </div>
      </div>

    </aside>
  );
};

export default Sidebar;