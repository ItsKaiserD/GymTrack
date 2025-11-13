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
    const [now, setNow] = useState(Date.now()); // <-- para countdown

    const router = useRouter();
    const { token } = useAuthStore();

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(t);
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(`${API_URL}/machines/my-reservations`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if(!response.ok) throw new Error(data.message || "Error al cargar máquinas reservadas");

            setMachines(data);
        } catch(error) {
            console.error("Error obteniendo datos: ", error); 
            Alert.alert("Error", "Error al obtener los datos, por favor refresque la página");
        } finally {
            setIsLoading(false); 
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchData();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [])

    const renderMachineItem = ({ item }) => {
        const remainingMin = item.reservationExpiresAt
        ? Math.max(0, Math.ceil((new Date(item.reservationExpiresAt).getTime() - now) / 60000))
        : 0;

        return (
            <View style={styles.bookItem}>
                <Image source={{ uri: item.image }} style={styles.bookImage} />
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{item.name}</Text>
                    <Text style={styles.bookSubtitle}>
                        Estado: {item.status || "Reservada"}
                    </Text>
                    {item.status === "Reservada" && item.reservationExpiresAt ? (
                    <Text style={styles.bookMeta}>
                        Restan {remainingMin} min
                    </Text>
                    ) : null}
                </View>
            </View>
        );
    };

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
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name='help-outline' size={50} color={COLORS.textSecondary}/>
                        <Text style={styles.emptyText}>No tienes reservas activas</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)")}>
                            <Text style={styles.addButtonText}>Reservar una máquina</Text>
                        </TouchableOpacity>
                </View>
                }
            />
        </View>
    );

}