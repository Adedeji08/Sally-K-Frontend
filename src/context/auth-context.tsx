import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export type UserRole = "shopper" | "seller";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // Called once the backend has confirmed signup/login. `rawUser` is whatever
  // shape the API returns — it's normalized into AuthUser here so the rest of
  // the app only ever deals with one consistent shape.
  loginWithSession: (token: string, rawUser: unknown, fallbackRole?: UserRole) => AuthUser;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  isLoginModalOpen: boolean;
  loginModalReason: string;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// The backend's field naming isn't known ahead of time (snake_case vs
// camelCase, nested vs flat), so this accepts either and always produces a
// consistent AuthUser for the rest of the app to consume.
function normalizeUser(raw: unknown, fallbackRole: UserRole): AuthUser {
  const source = (raw ?? {}) as Record<string, unknown>;
  const roleValue = source.role;
  const role: UserRole = roleValue === "seller" || roleValue === "shopper" ? roleValue : fallbackRole;

  const readString = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
    return undefined;
  };

  const readBool = (...keys: string[]): boolean | undefined => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "boolean") return value;
    }
    return undefined;
  };

  return {
    name: readString("name", "full_name", "fullName") ?? "",
    email: readString("email") ?? "",
    role,
    phone: readString("phone", "phone_number", "phoneNumber"),
    dateOfBirth: readString("dateOfBirth", "date_of_birth"),
    gender: readString("gender"),
    address: readString("address"),
    avatarUrl: readString("avatarUrl", "avatar_url"),
    // Absent on the backend response is treated as verified so accounts that
    // predate email verification (or a backend that doesn't send this field)
    // aren't unexpectedly locked out.
    emailVerified: readBool("emailVerified", "email_verified") ?? true,
  };
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    // Can't decode it (backend may not use JWTs, or uses opaque tokens) —
    // don't block the user client-side; the backend is the source of truth
    // for whether a token is actually valid on each request.
    return false;
  }
}

function readSessionFromStorage(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

const DEFAULT_MODAL_REASON = "Log in to your account to continue.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSessionFromStorage());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState(DEFAULT_MODAL_REASON);
  const navigate = useNavigate();

  const loginWithSession = (
    token: string,
    rawUser: unknown,
    fallbackRole: UserRole = "shopper"
  ) => {
    const nextUser = normalizeUser(rawUser, fallbackRole);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsLoginModalOpen(false);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate("/login", { state: { passwordReset: false } });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: AuthUser = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
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
      loginWithSession,
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
