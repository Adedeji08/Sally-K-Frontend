import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { createFakeToken } from "../utils/fake-token";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "authToken";
const PROFILE_KEY = "buyerProfile";

export type UserRole = "buyer" | "seller";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
}

// Dummy seed accounts: there's a single unified login screen, so the role is
// resolved from the email that's typed in rather than which screen you're on.
const SEED_ACCOUNTS: Record<string, { role: UserRole; name: string }> = {
  "ebenoluwadamilola@gmail.com": { role: "buyer", name: "Ebenoluwa Damilola" },
  "adedami08@outloo.com": { role: "seller", name: "Adedami" },
};

type ProfileExtras = Partial<Omit<AuthUser, "name" | "email" | "role">>;

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
  login: (email: string, password: string, roleOverride?: UserRole) => AuthUser;
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
    return {
      name: decoded.name,
      email: decoded.email,
      role: decoded.role ?? "buyer",
      ...readProfileExtras(),
    };
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
  // combination succeeds. The two seed accounts resolve to a fixed role; any
  // other email defaults to "buyer" unless a role is explicitly passed in
  // (used by the signup flow, where the user already told us which role they want).
  const login = (email: string, _password: string, roleOverride?: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const seed = SEED_ACCOUNTS[normalizedEmail];
    const role: UserRole = roleOverride ?? seed?.role ?? "buyer";
    const name =
      seed?.name ??
      (email
        .split("@")[0]
        ?.replace(/[._]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) ||
        (role === "seller" ? "Seller" : "Shopper"));

    const nextUser: AuthUser = { name, email, role, ...readProfileExtras() };
    localStorage.setItem(TOKEN_KEY, createFakeToken({ name, email, role }));
    setUser(nextUser);
    setIsLoginModalOpen(false);
    return nextUser;
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
      const { name, email, role, ...extras } = next;
      localStorage.setItem(TOKEN_KEY, createFakeToken({ name, email, role }));
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
