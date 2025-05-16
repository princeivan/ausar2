import { Navigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();
  if (isLoggedIn === false) return <Navigate to="/login" />;
  if (isLoggedIn === true) return <>{children}</>;

  return <div>Checking authentication...</div>;
}

export default ProtectedRoute;
