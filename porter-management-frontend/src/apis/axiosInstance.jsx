import axios from "axios";
const url =
  import.meta.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL_PROD;
const axiosInstance = axios.create({
  baseURL: url,
});

export default axiosInstance;
