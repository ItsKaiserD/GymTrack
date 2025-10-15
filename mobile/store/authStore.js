import {create} from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
    user: null,
    token: null, 
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {

        set({isLoading: true});

        try {
            const response = await fetch("https://gymtrack-fjhi.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username, 
                    email, 
                    password
                }),
            })

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || "Failed to register");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({user: data.user, token: data.token, isLoading: false});

            return {success: true};


        } catch (error) {
            set({isLoading: false});
            return {success: false, message: error.message || "Failed to register"};
        }
    },

    login: async (email, password) => {
        set({isLoading: true});
        try {
            const response = await fetch("https://gymtrack-fjhi.onrender.com/api/auth/login", {
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