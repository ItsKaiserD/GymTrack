import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Image } from 'expo-image'
import { formatPublishDate } from '../../lib/utils'
import {API_URL} from "@/constants/api"

import styles from '@/assets/styles/home.style';
import { FlatList, RefreshControl } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import Loader from '../../components/Loader'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const index = () => {
  const {token} = useAuthStore();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 

  const fetchMachines = async(pageNum=1, refresh=false) => {
    try {
      if(refresh) setRefreshing(true);
      else if (pageNum===1) setLoading(true);
      
      const response = await fetch(`${API_URL}/machines?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al conseguir máquinas");

      if (refresh || pageNum === 1) {
        setMachines(data.machines);
        } else {
          setMachines((prev) => {
        const merged = [...prev, ...data.machines];
        const byId = new Map();
        for (const m of merged) byId.set(m._id, m);
        return Array.from(byId.values());
        });
      }

      setHasMore(pageNum < Number(data.totalPages || 1));
      setPage(pageNum)

    } catch(error) {
        console.log("Error al conseguir máquinas", error)
    } finally {
      if(refresh) {
        await sleep(800);
        setRefreshing(false)
      } 
      else setLoading(false);
    }
  };

  const deleteMachine = (id) => {
  Alert.alert(
    "Eliminar máquina",
    "¿Estás seguro de que deseas eliminar esta máquina? Esta acción no se puede deshacer.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/machines/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data.message || "Error al eliminar máquina");
            }

            // Actualizar listado en memoria
            setMachines((prev) => prev.filter((m) => m._id !== id));
          } catch (e) {
            console.log("Error al eliminar máquina:", e.message);
            Alert.alert("Error", e.message);
          }
        },
      },
    ]
  );
  };

  const StatusPill = ({ status }) => {
  const s = status || "Disponible"; // fallback para registros viejos
  const map = {
    "Disponible":   { bg: "#E8F5E9", txt: "#2E7D32" },
    "Reservada":    { bg: "#FFF3E0", txt: "#EF6C00" },
    "Mantenimiento":{ bg: "#FBE9E7", txt: "#D84315" },
  };
  const { bg, txt } = map[s] || map["Disponible"];
  return (
    <View style={{
      alignSelf: "flex-start",
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 999, backgroundColor: bg, marginTop: 6
    }}>
      <Text style={{ color: txt, fontWeight: "600", fontSize: 12 }}>{s}</Text>
    </View>
  );
};
  
  useEffect(() => {
    fetchMachines()
  }, [])

  const handleLoadMore = () => {
    if (loading || refreshing || !hasMore) return;
    fetchMachines(page + 1, false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
      />

    <View style={styles.cardBody}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardMeta}>Creada por: {item?.user?.username || "N/A"}</Text>
      <StatusPill status={item.status} />
      {/* Botón Eliminar */}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => deleteMachine(item._id)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: "#FFEBEE",
            borderWidth: 1,
            borderColor: "#C62828",
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{ color: "#C62828", fontWeight: "600", fontSize: 12 }}
          >
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  if (loading) return <Loader/>

  return (
    <View style={styles.container}>
      <FlatList
        data={machines}
        renderItem={renderItem}
        keyExtractor={(item)=>item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMachines(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>GymTrack</Text>
            <Text style={styles.headerSubtitle}>Admin View</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && machines.length > 0 ? (
            <ActivityIndicator style={styles.footerLeader} size="small" color={COLORS.primary}/>
          ) : null 
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='help-outline' size={60} color={COLORS.textSecondary}/>
            <Text style={styles.emptyText}>No hay máquinas todavia</Text>
            <Text style={styles.emptySubtext}>Empecemos a registrar!</Text>
          </View>
        }
      />
    </View>
  )
}

export default index