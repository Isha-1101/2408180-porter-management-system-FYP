import axiosInstance from "../axiosInstance";
export const requestPorterUserRegistration = (payload) => {
  return axiosInstance.post("/team-porters/register-request", { 
    userName: payload.userName,
    email: payload.email,
    phone: payload.phone
   });
};

export const getPorterByTeam = (teamId) =>{
  return axiosInstance.get(`/team-porters/${teamId}`);
}
