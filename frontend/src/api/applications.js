import api from "./axios";

export const getApplications = async () => {
  const response = await api.get("/applications/");

  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/applications/dashboard/");

  return response.data;
};

export const createApplication = async (data) => {
  const response = await api.post("/applications/", data);

  return response.data;
};

export const getApplication = async (applicationId) => {
  const response = await api.get(
    `/applications/${applicationId}/`
  );

  return response.data;
};

export const updateApplication = async (applicationId, data) => {
  const response = await api.patch(
    `/applications/${applicationId}/`,
    data
  );

  return response.data;
};

export const deleteApplication = async (applicationId) => {
  const response = await api.delete(
    `/applications/${applicationId}/`
  );

  return response.data;
};

export const getApplicationUsers = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/users/`);
  return response.data;
};

export const getApplicationActivity = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/activity/`);
  return response.data;
};
