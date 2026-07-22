// Purpose: Guards admin routes — redirects to the separate admin login when no
// admin session is present. Independent of the marketplace ProtectedRoute.
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default AdminProtectedRoute;
