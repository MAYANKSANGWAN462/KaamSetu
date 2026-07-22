// Purpose: Isolated admin session state, separate from the marketplace AuthContext.
import { createContext, useContext, useState, useCallback } from "react";
import adminService, { ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from "../services/adminService";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

const readStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(readStoredAdmin);

  const login = useCallback(async (email, password) => {
    const res = await adminService.login(email, password);
    const token = res?.token;
    const adminUser = res?.data;
    if (!token || !adminUser) throw "Invalid admin login response";
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    setAdmin(adminUser);
    return adminUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAdmin: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
