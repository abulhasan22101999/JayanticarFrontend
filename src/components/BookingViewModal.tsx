import {
  FiX,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTruck,
  FiClock,
} from "react-icons/fi";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

type BookingStatus = "pending" | "booked" | "complete" | "cancelled";

type Booking = {
  _id: string;
  bookingId?: string;
  carId: {
    _id: string;
    carNumber: string;
    carName: string;
    carModel?: string;
    cartype?: string;
  } | null;
  driverId: {
    _id: string;
    driverName: string;
    mobileNo?: string;
  } | null;
  pickupDate: string;
  dropDate: string;
  guestName: string;
  guestMobileNo: string;
  company: string;
  pickupLocation: string;
  dropLocation: string;
  status: BookingStatus;
  reportingAddress?: string;
  reportingTime?: string;
};

type Props = {
  booking: Booking | null;
  onClose: () => void;
};

// ✅ Format date to dd/mm/yyyy
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
  },
  booked: {
    label: "Booked",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  complete: {
    label: "Complete",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
};

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="mt-0.5 text-orange-400 flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  </div>
);

const BookingViewModal = ({ booking, onClose }: Props) => {
  if (!booking) return null;

  const status = booking.status as BookingStatus;
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 flex justify-between items-center">
          <div>
            <p className="text-orange-100 text-[10px] font-semibold uppercase tracking-widest">
              Booking Details
            </p>
            <h2 className="text-white text-lg font-bold mt-0.5">
              {booking.bookingId || booking._id.slice(-6).toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* 🔥 SERVICE DESCRIPTION (Highlighted Card) */}

        {booking.reportingAddress && (
          <div className="px-6 pt-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                {/* ICON */}
                <FiMapPin className="text-blue-500 mt-0.5 shrink-0" size={15} />

                {/* 🔥 TEXT CONTAINER (important: min-w-0) */}
                <div className="min-w-0 w-full">
                  {/* LABEL */}
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">
                    Service Description
                  </p>

                  {/* 🔥 SCROLLABLE CONTENT */}
                  <div className="relative max-h-24 overflow-y-auto pr-1 mt-1">
                    <p className="text-sm text-gray-700 break-words whitespace-pre-wrap leading-relaxed">
                      {booking.reportingAddress}
                    </p>

                    {/* 🔥 FADE EFFECT (optional but premium) */}
                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-blue-100 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATUS */}
        <div className="px-6 pt-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-3 mt-3 max-h-[50vh] overflow-y-auto space-y-4">
          {/* GRID (LEFT + RIGHT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GUEST */}
            <div>
              <p className="section-title">Guest Info</p>
              <div className="card">
                <Row
                  icon={<FiUser size={15} />}
                  label="Guest Name"
                  value={booking.guestName}
                />
                <Row
                  icon={<FiPhone size={15} />}
                  label="Mobile"
                  value={booking.guestMobileNo}
                />
                <Row
                  icon={<MdAirlineSeatReclineNormal size={15} />}
                  label="Company"
                  value={booking.company}
                />
              </div>
            </div>

            {/* TRIP */}
            <div>
              <p className="section-title">Trip Details</p>
              <div className="card">
                <Row
                  icon={<FiMapPin size={15} />}
                  label="Pickup"
                  value={booking.pickupLocation}
                />
                <Row
                  icon={<FiMapPin size={15} />}
                  label="Drop"
                  value={booking.dropLocation}
                />
                <Row
                  icon={<FiCalendar size={15} />}
                  label="Dates"
                  value={`${formatDate(booking.pickupDate)} → ${formatDate(booking.dropDate)}`}
                />
                {booking.reportingTime && (
                  <Row
                    icon={<FiClock size={15} />}
                    label="Time"
                    value={booking.reportingTime}
                  />
                )}
              </div>
            </div>
          </div>

          {/* VEHICLE FULL WIDTH */}
          <div>
            <p className="section-title">Vehicle & Driver</p>
            <div className="card">
              <Row
  icon={<FiTruck size={15} />}
  label="Car"
  value={
    booking.carId
      ? `${booking.carId.carName}${
          booking.carId.carModel ? " | " + booking.carId.carModel : ""
        }${
          booking.carId.cartype ? " | " + booking.carId.cartype : ""
        } | ${booking.carId.carNumber}`
      : null
  }
/>
              <Row
                icon={<FiUser size={15} />}
                label="Driver"
                value={
                  booking.driverId
                    ? `${booking.driverId.driverName}${
                        booking.driverId.mobileNo
                          ? " (" + booking.driverId.mobileNo + ")"
                          : ""
                      }`
                    : null
                }
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}


        {/* <div className="px-6 py-4 border-t">

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Close
          </button>

        </div> */}
      </div>
    </div>
  );
};

export default BookingViewModal;
