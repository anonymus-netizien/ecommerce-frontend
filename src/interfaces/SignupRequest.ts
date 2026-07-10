export const Gender = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const Role = {
    ROLE_ADMIN: "ROLE_ADMIN",
    ROLE_CUSTOMER: "ROLE_CUSTOMER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface SignupRequest {
    name: string;
    email: string;
    phoneNumber: number;
    password: string;
    gender: Gender;
    role: Role;
}
