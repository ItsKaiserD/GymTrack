import { View, Text } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import React from 'react'

import styles from '@/assets/styles/profile.style'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileHeader() {
    const { user } = useAuthStore(); 

    if(!user) return null;

    return (
        <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>
        </View>
    );
}