import axiosInstance from "../axiosInstance";

export const porterService = {
  createNewPorter: async (payload) => {
    const response = axiosInstance.post("/porters", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  getPorters: async (parameters = {}) => {
    const {
      searchText = "",
      page = 1,
      limit = 10,
      porterType = "",
    } = parameters;
    const response = axiosInstance.get(
      `/porters?searchText=${searchText}&page=${page}&limit=${limit}&porterType=${porterType}`
    );
    return response;
  },

  getPorterById: async (id) => {
    const response = axiosInstance.get(`/porters/${id}`);
    return response;
  },
// this service is used to get porter by user
  getPorterByUser: async () => {
    const response = axiosInstance.get(`/porters/by-user`);
    return response;
  },

  saveVehicleDetailsPorter: async (payload) => {
    const response = axiosInstance.post(
      `/porters/vehicle/save/${payload.porterId}`,
      {
        vehicleNumber: payload.vehicleNumber,
        vehicleCategory: payload.vehicleCategory,
        capacity: payload.capacity,
      }
    );
    return response;
  },

  getVehicleTypesOfPorter: async (id) => {
    const response = axiosInstance.get(`/porters/vehicle/get/${id}`);
    return response;
  },

  saveDocumentOfPorter: async (porterId, documentPayload) => {
    console.log(documentPayload);
    const response = axiosInstance.post(
      `/porters/document/save/${porterId}`,
      documentPayload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  getSavedDocumentsOfPorter: async (id) => {
    const response = axiosInstance.get(`/porters/document/get/${id}`);
    return response;
  },
};
