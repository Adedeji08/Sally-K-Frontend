import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const currentPath = location.pathname;

    const logout = () => {
      localStorage.clear();
      setShouldRender(false);

      if (currentPath !== "/login") {
        navigate("/login", { replace: true });
      }
    };

    // No token
    if (!token) {
      if (currentPath === "/login") {
        setShouldRender(true);
      } else {
        logout();
      }
      setIsReady(true);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        logout();
      } else if (currentPath === "/login") {
        navigate("/", { replace: true });
        setShouldRender(false);
      } else {
        setShouldRender(true);
      }
    } catch (error) {
      logout();
    } finally {
      setIsReady(true);
    }
  }, [location.pathname, navigate]);

  if (!isReady) return null;

  return shouldRender ? <>{children}</> : null;
};

export default AuthGuard;