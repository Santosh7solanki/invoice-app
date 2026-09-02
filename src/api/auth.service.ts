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

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  address: string;
  city: string;
  zipCode: string;
  industry: string;
  currencySymbol: string;
  logo: File | null;
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


const signup = async (
  data: SignupRequest
): Promise<LoginResponse> => {
  const formData = new FormData();

  formData.append("FirstName", data.firstName);
  formData.append("LastName", data.lastName);
  formData.append("Email", data.email);
  formData.append("Password", data.password);
  formData.append("CompanyName", data.companyName);
  formData.append("Address", data.address);
  formData.append("City", data.city);
  formData.append("ZipCode", data.zipCode);
  formData.append("Industry", data.industry);
  formData.append("CurrencySymbol", data.currencySymbol);

  if (data.logo) {
    formData.append("logo", data.logo);
  }

  const response = await fetch(routes.AUTH.SIGNUP, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Unable to create account."
    );
  }

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
  signup,
  logout,
  getToken,
  getUser,
  getCompany,
};

export default authService;