import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../../constants";
import { useEffect, useState, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

interface DecodedToken {
  exp: number;
}
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAutorized] = useState<boolean | null>(null);

  useEffect(() => {
    auth().catch(() => setIsAutorized(false));
  }, []);
  const refreshToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (!refreshToken || !accessToken) {
      setIsAutorized(false);
      return;
    }
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAutorized(true);
      } else {
        setIsAutorized(false);
      }
    } catch (error) {
      alert(error);
      setIsAutorized(false);
    }
  };
  const auth = async (): Promise<void> => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAutorized(false);
      console.log("No token present");
      return;
    }
    const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAutorized(true);
    }
  };
  if (isAuthorized === null) {
    return <div>ProtectedRoute</div>;
  }
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
