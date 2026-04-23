import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  // already login → block login page
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;