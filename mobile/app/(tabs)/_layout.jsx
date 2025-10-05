import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false, 
                tabBarActiveTintColor: COLORS.primary,
                headerTitleStyle: {
                    color: COLORS.primary, 
                    fontWeight: "600"
                },
                headerShadowVisible: false, 
                tabBarStyle: {
                    backgroundColor: COLORS.cardBackground, 
                    borderTopWidth: 1, 
                    borderTopColor: COLORS.border, 
                    paddingTop: 5, 
                    paddingBottom: insets.bottom,
                    height: 60 + insets.bottom,
                },
            }}>
            <Tabs.Screen 
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({color, size}) => (<Ionicons
                        name='home-outline' size={size} color={color}/>)
                }}/>
            <Tabs.Screen 
                name="create"
                options={{
                    title: "Registrar",
                    tabBarIcon: ({color, size}) => (<Ionicons
                        name='barbell-outline' size={size} color={color}/>)
                }}/>
        </Tabs>
    );
}