import api from "./axios";

export const signupDeveloper = async (data) => {
  const response = await api.post("/accounts/signup/", data);

  return response.data;
};

export const loginDeveloper = async (data) => {
  const response = await api.post("/accounts/login/", data);

  return response.data;
};

export const refreshDeveloperToken = async (refresh) => {
  const response = await api.post("/accounts/token/refresh/", {
    refresh,
  });

  return response.data;
};

export const getDeveloperOAuthAuthorizationUrl = async (provider) => {
  const response = await api.get(`/accounts/oauth/${provider}/start/`);

  return response.data.authorization_url;
};

export const updateDeveloperProfile = async (data) => {
  const response = await api.patch("/accounts/profile/", data);
  return response.data;
};

export const getDeveloperProfile = async () => {
  const response = await api.get("/accounts/profile/");
  return response.data;
};

export const exchangeDeveloperOAuth = async (code) => {
  const response = await api.post("/accounts/oauth/exchange/", { code });
  return response.data;
};
