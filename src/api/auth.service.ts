import routes from "@/api/routes";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/utils/secureStorage";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    userID: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    companyID: number;
    companyName: string;
    currencySymbol: string;
  };
}

const TOKEN_KEY = "invoiceapp_token";
const USER_KEY = "invoiceapp_user";
const COMPANY_KEY = "invoiceapp_company";

const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(routes.AUTH.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Invalid email or password."
    );
  }

  if (!result?.token || !result?.user || !result?.company) {
    throw new Error("Invalid login response.");
  }

  setSecureItem(TOKEN_KEY, result.token);
  setSecureItem(USER_KEY, result.user);
  setSecureItem(COMPANY_KEY, result.company);

  return result;
};

const logout = () => {
  removeSecureItem(TOKEN_KEY);
  removeSecureItem(USER_KEY);
  removeSecureItem(COMPANY_KEY);
};

const getToken = () => {
  return getSecureItem<string>(TOKEN_KEY);
};

const getUser = () => {
  return getSecureItem<LoginResponse["user"]>(USER_KEY);
};

const getCompany = () => {
  return getSecureItem<LoginResponse["company"]>(COMPANY_KEY);
};

const authService = {
  login,
  logout,
  getToken,
  getUser,
  getCompany,
};

export default authService;