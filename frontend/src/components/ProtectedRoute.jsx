import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

