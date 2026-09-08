import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";
import useRequest from "../hooks/use-req";

// Shape returned by GET /auth/me -> `data`. This is the single source of truth
// for the signed-in user while the app is open. It is intentionally NOT written
// to localStorage (for buyers or sellers) — we always read it fresh from the
// API and keep it in memory only.
export interface SellerProfileData {
  id: string;
  userId: string;
  brandName: string;
  categories: string[];
  bio: string;
  logoUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  verificationStatus: string;
  idType: string | null;
  idNumber: string | null;
  idDocumentUrl: string | null;
  businessType: string | null;
  businessRegistrationNumber: string | null;
  businessDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
  sellerProfile?: SellerProfileData | null;
}

interface CurrentUserContextValue {
  currentUser: CurrentUser | null;
  loading: boolean;
  // True once at least one fetch attempt has completed.
  loaded: boolean;
  // Re-pull /auth/me (e.g. right after a profile update) and return the fresh user.
  refetch: () => Promise<CurrentUser | null>;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { makeRequest } = useRequest("/auth/me", "GET");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Re-created whenever auth state flips so it always closes over a request
  // helper holding the current token.
  const refetch = useCallback(async (): Promise<CurrentUser | null> => {
    if (!isAuthenticated) {
      setCurrentUser(null);
      return null;
    }
    setLoading(true);
    const [json, status] = await makeRequest();
    setLoading(false);
    setLoaded(true);

    const data =
      status >= 200 && status < 300 ? ((json?.data ?? null) as CurrentUser | null) : null;
    setCurrentUser(data);
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      setCurrentUser(null);
      setLoaded(false);
    }
  }, [isAuthenticated, refetch]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ currentUser, loading, loaded, refetch }),
    [currentUser, loading, loaded, refetch]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
