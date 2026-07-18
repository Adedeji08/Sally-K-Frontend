import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { createFakeToken } from "../utils/fake-token";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "authToken";
const PROFILE_KEY = "buyerProfile";

interface AuthUser {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
}

type ProfileExtras = Omit<AuthUser, "name" | "email">;

function readProfileExtras(): ProfileExtras {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

interface DecodedToken extends AuthUser {
  exp: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  isLoginModalOpen: boolean;
  loginModalReason: string;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUserFromStorage(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return { name: decoded.name, email: decoded.email, ...readProfileExtras() };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

const DEFAULT_MODAL_REASON = "Log in to your account to continue.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUserFromStorage());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState(DEFAULT_MODAL_REASON);
  const navigate = useNavigate();
  // Dummy auth: there's no backend yet, so any valid-looking email/password
  // combination succeeds and mints a locally-signed placeholder token.
  const login = (email: string, _password: string) => {
    const name =
      email
        .split("@")[0]
        ?.replace(/[._]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Shopper";

    const nextUser: AuthUser = { name, email, ...readProfileExtras() };
    localStorage.setItem(TOKEN_KEY, createFakeToken({ name, email }));
    setUser(nextUser);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate("/login", { state: { passwordReset: false } });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: AuthUser = { ...prev, ...updates };
      const { name, email, ...extras } = next;
      localStorage.setItem(TOKEN_KEY, createFakeToken({ name, email }));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(extras));
      return next;
    });
  };

  const openLoginModal = (reason?: string) => {
    setLoginModalReason(reason ?? DEFAULT_MODAL_REASON);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateProfile,
      isLoginModalOpen,
      loginModalReason,
      openLoginModal,
      closeLoginModal,
    }),
    [user, isLoginModalOpen, loginModalReason]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
