import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { isAuthenticated } from "../utils/auth";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;