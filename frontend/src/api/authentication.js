import api from "./axios";

const withApplicationKey = (apiKey) => ({ headers: { "X-API-Key": apiKey } });

export const sendOtp = async ({ apiKey, email, name }) => {
  const response = await api.post("/auth/otp/send/", { email, ...(name ? { name } : {}) }, withApplicationKey(apiKey));
  return response.data;
};

export const verifyOtp = async ({ apiKey, email, otp }) => {
  const response = await api.post("/auth/otp/verify/", { email, otp }, withApplicationKey(apiKey));
  return response.data;
};

export const startOAuth = async ({ apiKey, provider }) => {
  const response = await api.get(`/auth/oauth/${provider}/start/`, withApplicationKey(apiKey));
  return response.data;
};

export const exchangeOAuth = async (code) => {
  const response = await api.post("/auth/oauth/exchange/", { code });
  return response.data;
};
