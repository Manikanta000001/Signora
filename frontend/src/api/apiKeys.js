import api from "./axios";

export const getApiKeys = async (applicationId) => {
  const response = await api.get(
    `/applications/${applicationId}/api-keys/`
  );

  return response.data;
};

export const createApiKey = async (applicationId, data = {}) => {
  const response = await api.post(
    `/applications/${applicationId}/api-keys/`,
    data
  );

  return response.data;
};

export const revokeApiKey = async (
  applicationId,
  keyId
) => {
  const response = await api.delete(
    `/applications/${applicationId}/api-keys/${keyId}/`
  );

  return response.data;
};