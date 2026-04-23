import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayouts = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen">

      {/* 🔥 Overlay (Mobile only) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col">

        <Topbar setMobileOpen={setMobileOpen} />

        <div className="p-4 md:p-6 bg-gray-50 flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default MainLayouts;