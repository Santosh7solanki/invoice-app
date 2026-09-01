import CryptoJS from "crypto-js";

const SECRET_KEY = "invoiceapp-local-storage-key";

export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
};

export const decryptData = <T>(encryptedData: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
      return null;
    }

    return JSON.parse(decryptedData) as T;
  } catch {
    return null;
  }
};

export const setSecureItem = (
  key: string,
  value: unknown
): void => {
  const encryptedValue = encryptData(value);

  localStorage.setItem(key, encryptedValue);
};

export const getSecureItem = <T>(
  key: string
): T | null => {
  const encryptedValue = localStorage.getItem(key);

  if (!encryptedValue) {
    return null;
  }

  return decryptData<T>(encryptedValue);
};

export const removeSecureItem = (key: string): void => {
  localStorage.removeItem(key);
};