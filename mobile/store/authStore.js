import {create} from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
    user: null,
    token: null, 
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password, role) => {
        set({ isLoading: true });

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ username, email, password, role }), // ← role se envía siempre
        });

        const ct = res.headers.get("content-type") || "";
        const raw = await res.text();                 // SIEMPRE leemos texto
        let data = null;

        if (ct.includes("application/json")) {
            try { data = JSON.parse(raw); } 
            catch (e) { throw new Error(`JSON inválido del servidor: ${raw.slice(0, 120)}…`); }
        } else {
            console.log("[register] Respuesta no-JSON:", { status: res.status, ct, raw: raw.slice(0, 300) });
        }

        if (!res.ok) {
            const msg = (data && (data.message || data.error))
            || (ct.includes("text/html") ? "El servidor devolvió HTML (posible 404/500 en Render)" : raw)
            || `HTTP ${res.status}`;
        throw new Error(msg);
        }

        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isLoading: false });

        return { success: true };
    } catch (error) {
        set({ isLoading: false });
        return { success: false, message: String(error.message || error) };
    }
    },


    login: async (email, password) => {
        set({isLoading: true});
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password}),
            }), 

            data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to login");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({user: data.user, token: data.token, isLoading: false});
            return {success: true};
        } catch (error) {
            set({isLoading: false});
            return {success: false, message: error.message || "Failed to login"};
        }

    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;

            set({user, token: token});
        } catch (error) {
            console.error("Failed to load auth data", error);
        } finally {
            set({isCheckingAuth:false})
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
        set({user: null, token: null});
    },
}));