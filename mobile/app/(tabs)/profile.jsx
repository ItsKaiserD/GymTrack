import { View, Text, Alert, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { API_URL } from '../../constants/api'
import { useAuthStore } from '@/store/authStore'
import React from 'react'

import styles from '@/assets/styles/profile.style';
import ProfileHeader from '../../components/ProfileHeader'
import LogoutButton from '../../components/LogoutButton'
import { FlatList } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import { Image } from 'expo-image'


export default function Profile(){
    const [machines, setMachines] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();
    const { token } = useAuthStore();

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(`${API_URL}/machines/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if(!response.ok) throw new Error(data.message || "Error al cargar máquinas");

            setMachines(data);
        } catch(error) {
            console.error("Error obteniendo datos: ", error); 
            Alert.alert("Error", "Error al obtener los datos, por favor refresque la página");
        } finally {
            setIsLoading(false); 
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    const renderMachineItem = ({ item }) => {
        <View style={styles.bookItem}>
            <Image source={item.image} style={styles.bookImage}/>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.name}</Text>
            </View>
        </View>
    }

    return (
        <View style={styles.container}>
            <ProfileHeader/>
            <LogoutButton />

            {/* REGISTERED MACHINES */}
            <View style={styles.booksHeader}>
                <Text style={styles.booksTitle}>Tus Máquinas</Text>
                <Text style={styles.booksCount}>{machines.length}</Text>
            </View>

            <FlatList 
                data={machines}
                renderItem={renderMachineItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name='help-outlinhe' size={50} color={COLORS.textSecondary}/>
                        <Text style={styles.emptyText}>No has creado ninguna máquina</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
                            <Text style={styles.addButtonText}>Registra tu primera máquina</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );

}