"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import authService, {
  LoginRequest,
  SignupRequest,
  LoginResponse,
} from "@/api/auth.service";

interface AuthContextType {
  token: string | null;
  user: LoginResponse["user"] | null;
  company: LoginResponse["company"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [company, setCompany] = useState<LoginResponse["company"] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = (result: LoginResponse) => {
    setToken(result.token);
    setUser(result.user);
    setCompany(result.company);
  };

  useEffect(() => {
    const loadAuthData = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();
      const storedCompany = authService.getCompany();

      setToken(storedToken);
      setUser(storedUser);
      setCompany(storedCompany);
      setIsLoading(false);
    };

    loadAuthData();
  }, []);

  // Login
  const login = async (data: LoginRequest) => {
    const result = await authService.login(data);

    setAuthData(result);
  };

  // Signup
  const signup = async (data: SignupRequest) => {
    const result = await authService.signup(data);

    setAuthData(result);
  };

  // Logout
  const logout = () => {
    authService.logout();

    setToken(null);
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        company,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}