import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");

  // already login → block login page
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;