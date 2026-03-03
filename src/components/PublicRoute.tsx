import { useAppData } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const { isAuth, loading } = useAppData();

  if (loading) return null;

  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};
