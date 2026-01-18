import toast from "react-hot-toast";
import { login, register } from "../services/authService.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store.js";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (payload) => {
      const response = await login(payload);
      return response;
    },
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.access_token);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await register(payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });
};

// export const UseGetUserDetails = () =>{
//   return useQuery({
//     queryKey: ["userDetails"],
//     queryFn: () => getUserDetails(),
//   });
// }