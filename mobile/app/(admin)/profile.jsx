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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();
    const { token } = useAuthStore();

    const fetchData = async () => {
    try {
      setLoading(true);

      // Traemos SOLO máquinas en mantenimiento
      const res = await fetch(`${API_URL}/machines/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error cargando mantenimiento");

      setMachines(data);
    } catch (err) {
      console.error("Error obteniendo máquinas:", err);
      Alert.alert("Error", "No se pudo cargar la lista de mantenimiento");
    } finally {
      setLoading(false);
    }
    };

    useEffect(() => {
        fetchData();
    }, [])

    const marcarDisponible = async (id) => {
    try {
      const res = await fetch(`${API_URL}/machines/${id}/avail`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Eliminar la máquina de la lista local
      setMachines((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
    };

    const renderMachineItem = ({ item }) => (
        <View style={styles.bookItem}>
        {item.image ? (
            <Image source={{ uri: item.image }} style={styles.bookImage} />
        ) : null}

        <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{item.name}</Text>
            <Text style={styles.bookSubtitle}>Estado: {item.status}</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => marcarDisponible(item._id)}
            >
                <Text style={styles.addButtonText}>Marcar Disponible</Text>
            </TouchableOpacity>
        </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ProfileHeader/>
            <LogoutButton />

            {/* REGISTERED MACHINES */}
            <View style={styles.booksHeader}>
                <Text style={styles.booksTitle}>Máquinas Reportadas</Text>
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
                    <Ionicons name="checkmark-circle" size={50} color={COLORS.success} />
                    <Text style={styles.emptyText}>No hay máquinas en mantenimiento</Text>
                </View>
                }
            />
        </View>
    );

}