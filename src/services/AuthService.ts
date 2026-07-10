import {signupUser, loginUser} from "../apis/AuthAPI";
import type {SignupRequest} from "../interfaces/SignupRequest";
import type {LoginRequest} from "../interfaces/LoginRequest";

export const serviceRegister = async (data: SignupRequest) => {
    const response = await signupUser(data);
    return response.data;
};

export const serviceLogin = async (data: LoginRequest) => {
    const response = await loginUser(data);
    return response.data;
};
