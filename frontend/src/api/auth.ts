import api from "../lib/api";

export interface RegisterRequest {
    email?: string;
    phone_number?: string;
    password: string;
    role_id?: number;
    persona?: string;
    full_name?: string;
    district?: string;
    village?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface User {
    id: string;
    email?: string;
    phone_number?: string;
    role_id: number;
    is_active: boolean;
    persona?: string | null;
    role_name?: string | null;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const AuthAPI = {
    register: async (data: RegisterRequest) => {
        const response = await api.post<ApiResponse<User>>(
            "/auth/register",
            data
        );
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const formData = new URLSearchParams();
        formData.append("username", data.username);
        formData.append("password", data.password);

        const response = await api.post<ApiResponse<AuthTokens>>(
            "/auth/login",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        return response.data;
    },

    googleLogin: async (data: { token: string; role_id?: number }) => {
        const response = await api.post<ApiResponse<AuthTokens>>(
            "/auth/google",
            {
                token: data.token,
                role_id: data.role_id || 2, // Default to citizen
            }
        );
        return response.data;
    },

    me: async () => {
        const response = await api.get<ApiResponse<User>>("/auth/me");
        return response.data;
    },
};