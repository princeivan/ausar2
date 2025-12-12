import { Navigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userInfo } = useStore();

  // Not logged in → redirect to login
  if (isLoggedIn === false) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT admin → redirect to unauthorized page
  if (
    isLoggedIn === true &&
    userInfo?.permissions?.can_access_admin_panel === false
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If still loading
  if (isLoggedIn === null) {
    return <div>Checking authentication...</div>;
  }

  // Logged in + is admin → allow page
  return <>{children}</>;
}

export default ProtectedRoute;
