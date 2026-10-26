import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { AuthAPI } from "../api/auth";
import type { LoginRequest, RegisterRequest, User } from "../api/auth";
import { useAuthStore } from "../store/authStore";

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const {
        token,
        user,
        setAuth,
        logout: clearStore,
    } = useAuthStore();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                localStorage.setItem("access_token", token);

                const response = await AuthAPI.me();

                setAuth(token, response.data);
            } catch (error) {
                clearStore();
                localStorage.removeItem("access_token");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (data: LoginRequest) => {
        const loginResponse = await AuthAPI.login(data);

        const accessToken = loginResponse.data.access_token;

        localStorage.setItem("access_token", accessToken);

        const me = await AuthAPI.me();

        setAuth(accessToken, me.data);
    };

    const register = async (data: RegisterRequest) => {
        await AuthAPI.register(data);

        await login({
            username: data.email ?? data.phone_number ?? "",
            password: data.password,
        });
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        clearStore();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};