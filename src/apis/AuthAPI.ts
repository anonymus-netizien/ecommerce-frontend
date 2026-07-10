import type {SignupRequest} from "../interfaces/SignupRequest";
import type {LoginRequest} from "../interfaces/LoginRequest";
import axiosInstance from "./AxiosConfig";

export const signupUser = (data: SignupRequest) => {
    return axiosInstance.post("/auth/signup", data);
};

export const loginUser = (data: LoginRequest) => {
    return axiosInstance.post("/auth/login", data);
};
