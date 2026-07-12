import type {SignupRequest} from "../interfaces/SignupRequest";
import type {LoginRequest} from "../interfaces/LoginRequest";

export const serviceRegister = async (data: SignupRequest) => {
    // Read existing users from local storage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    const userExists = existingUsers.some(
        (user: any) => user.email === data.email || user.phoneNumber === data.phoneNumber
    );

    if (userExists) {
        throw new Error("User already exists. Please login or use a different email/phone number.");
    }

    // Add new user
    const newUser = {
        id: existingUsers.length + 1,
        ...data,
    };

    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));
    return newUser;
};

export const serviceLogin = async (data: LoginRequest) => {
    // Read existing users from local storage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

    // Find matching user
    const user = existingUsers.find(
        (u: any) => u.email === data.email && u.password === data.password
    );

    if (!user) {
        throw new Error("Invalid email or password. Please try again.");
    }

    // Set logged in user
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
};
