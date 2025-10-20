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
            body: JSON.stringify({ username, email, password, role }),
            });

            const ct = res.headers.get("content-type") || "";
            const raw = await res.text();
            let data = null;

            if (ct.includes("application/json")) {
                try { data = JSON.parse(raw); }
                catch { throw new Error("Respuesta JSON inválida del servidor"); }
            } else {
            // HTML u otro => no intentes guardar en AsyncStorage
            throw new Error(`Servidor devolvió ${ct} (status ${res.status})`);
            }

            if (!res.ok) {
                throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
            }

            // Acepta 'user' o 'newUser' por compatibilidad
            const user = data.user || data.newUser;
            const token = data.token;
            if (!user || !token) {
                throw new Error("La respuesta no incluye 'user' o 'token'.");
            }

            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("token", String(token));
            set({ user, token, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: String(error.message || error) };
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
            });

            const ct = res.headers.get("content-type") || "";
            const raw = await res.text();
            let data = null;

            if (ct.includes("application/json")) {
                try { data = JSON.parse(raw); }
                catch { throw new Error("Respuesta JSON inválida del servidor"); }
            } else {
                throw new Error(`Servidor devolvió ${ct} (status ${res.status})`);
            }

            if (!res.ok) {
                throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
            }

            const user = data.user;
            const token = data.token;
            if (!user || !token) {
                throw new Error("La respuesta no incluye 'user' o 'token'.");
            }

            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("token", String(token));
            set({ user, token, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: String(error.message || error) };
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