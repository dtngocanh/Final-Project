import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000" 
      : "https://freshmart-server-aip2.onrender.com", 
  withCredentials: true,
});
