import { View, Text, Alert, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { API_URL } from '../../constants/api'
import { useAuthStore } from '@/store/authStore'
import React from 'react'

import styles from '@/assets/styles/profile.style';
import ProfileHeader from '../../components/ProfileHeader'
import LogoutButton from '../../components/LogoutButton'
import { FlatList, RefreshControl } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'


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
        // item viene de Reservation: tiene machine, startAt, endAt, status
        const { machine, startAt, endAt, status } = item;

        const start = startAt ? new Date(startAt) : null;
        const end = endAt ? new Date(endAt) : null;
        const nowDate = new Date(now);

        let infoLinea = "";
        if (start && end) {
            if (nowDate < start) {
            const mins = Math.max(0, Math.ceil((start.getTime() - nowDate.getTime()) / 60000));
            infoLinea = `Comienza en ${mins} min`;
            } else if (nowDate >= start && nowDate <= end) {
                const mins = Math.max(0, Math.ceil((end.getTime() - nowDate.getTime()) / 60000));
                infoLinea = `Termina en ${mins} min`;
            } else {
                infoLinea = "Reserva finalizada";
            }
        }

        const fechaTexto = start
            ? start.toLocaleString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        : "";

        return (
            <View style={styles.bookItem}>
                <Image
                    source={{ uri: machine.image }}
                    style={styles.bookImage}
                />
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{machine?.name || "Máquina"}</Text>
                    {fechaTexto ? (
                    <Text style={styles.bookSubtitle}>{fechaTexto}</Text>
                    ) : null}
                    <Text style={styles.bookSubtitle}>Estado: {status || "Reservada"}</Text>
                    {infoLinea ? (
                    <Text style={styles.bookMeta}>{infoLinea}</Text>
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
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