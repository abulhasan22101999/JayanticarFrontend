import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayouts from "./layouts/MainLayouts";
import Dashboard from "./pages/Dashboard";
import CarManagement from "./pages/CarManagement";
import DriverManagement from "./pages/DriverManagement";
import BookingManagement from "./pages/BookingManagement";
import AvailableCar from "./pages/AvailableCar";
import Login from "./pages/Login";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { Toaster } from "react-hot-toast";
import BookingHistory from "./pages/BookingHistory";
import GuestPortal from "./pages/GuestPortal";
import BookedCar from "./pages/BookedCar";
import AvailableDrivers from "./pages/AvailableDrivers";
import BookedDrivers from "./pages/BookedDrivers";
import SelfCar from "./pages/Selfcar";
import OtherCars from "./pages/OthersCar";
import Car from "./pages/Car";

const App = () => {
  return (
    <>
      <Toaster position="top-right" />

      <BrowserRouter>
        <Routes>

          <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ✅ LOGIN (PUBLIC) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* ✅ ALL PRIVATE */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayouts />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/carmanagment" element={<CarManagement />} />
             <Route path="/availablecar" element={<AvailableCar />} />
            <Route path="/bookedcar" element={<BookedCar/>}/>

            <Route path="/car" element={<Car/>}/>

             <Route path="/selfcar" element={<SelfCar/>}/>
             <Route path="/otherscar" element={<OtherCars/>}/>

            <Route path="/drivermanagment" element={<DriverManagement />} />
           <Route path="/availabledriver" element={<AvailableDrivers/>}/>
           <Route path="/bookeddriver" element={<BookedDrivers/>}/>

            <Route path="/bookingmanagment" element={<BookingManagement />} />
           
            <Route path="/bookinghistory" element={<BookingHistory/>} />
            <Route path="/guestportal" element={<GuestPortal/>}/>
            
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;