import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [now, setNow] = useState(Date.now());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMinutes, setSelectedMinutes] = useState(30); // 15, 30, 45
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 🔴 NUEVO: estado para el modal de reporte
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingMachine, setReportingMachine] = useState(null);
  const [reportMessage, setReportMessage] = useState('');

  const DURATION_OPTIONS = [15, 30, 45];

  const reserveWithDateTime = async (machineId, startAtISO, minutes) => {
  try {
    const res = await fetch(`${API_URL}/machines/${machineId}/reserve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ startAtISO, minutes }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    Alert.alert("Reserva creada", "Tu reserva fue agendada correctamente");
  } catch (e) {
    console.log("Error al reservar:", e.message);
    Alert.alert("Error", e.message);
  }
  };

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
  
  // 🟡 MODIFICADO: helper para actualizar estado y opcionalmente guardar mensaje de reporte
  const updateStatus = async (id, nextStatus, reportMessageParam) => {
    try {
      const body = reportMessageParam
        ? { status: nextStatus, reportMessage: reportMessageParam }
        : { status: nextStatus };

      const res = await fetch(`${API_URL}/machines/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error actualizando estado");

      // Actualiza en memoria la máquina modificada
      setMachines((prev) => prev.map(m => (m._id === data._id ? data : m)));
    } catch (e) {
      console.log("Error actualizando estado:", e.message);
      Alert.alert("Error", e.message);
    }
  };

  // atajos
  const onReservar = (id) => updateStatus(id, "Reservada");

  // 🔴 NUEVO: abrir modal de reporte
  const openReportModal = (machine) => {
    setReportingMachine(machine);
    setReportMessage('');
    setReportModalVisible(true);
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportingMachine(null);
    setReportMessage('');
  };

  // 🔴 NUEVO: enviar reporte con mensaje y cambiar a Mantenimiento
  const handleSubmitReport = async () => {
    if (!reportMessage.trim()) {
      Alert.alert("Mensaje requerido", "Por favor describe el problema de la máquina.");
      return;
    }
    if (!reportingMachine) return;

    try {
      await updateStatus(reportingMachine._id, "Mantenimiento", reportMessage.trim());
      Alert.alert("Reporte enviado", "La máquina fue marcada en mantenimiento.");
      closeReportModal();
    } catch (e) {
      // updateStatus ya muestra el error
    }
  };

  const handleReserve = (machineId, minutes) => {
  let d = new Date(selectedDate);

  // Si por cualquier motivo la fecha/hora elegida quedó en el pasado,
  // la empujamos 5 minutos al futuro para evitar el error.
  const nowLocal = new Date();
  if (d <= nowLocal) {
    d = new Date(nowLocal.getTime() + 5 * 60 * 1000);
    setSelectedDate(d);
  }

  const startAtISO = d.toISOString();
  reserveWithDateTime(machineId, startAtISO, minutes);
  };

  useEffect(() => {
    fetchMachines()
  }, [])

  useEffect(() => {
  const t = setInterval(() => setNow(Date.now()), 30_000); // cada 30s (o 60s)
  return () => clearInterval(t);
  }, []);

  useEffect(() => {
  const timer = setInterval(() => {
    // refresca liviano la página 1
    fetchMachines(1, true);
  }, 60_000);
  return () => clearInterval(timer);
  }, [token]);


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
      {item.status === "Reservada" && item.reservationExpiresAt ? (
      <Text style={styles.cardMeta}>
        Restan {Math.max(0, Math.ceil((new Date(item.reservationExpiresAt).getTime() - now) / 60000))} min
      </Text>
      ) : null}
      {item.status === "Disponible" ? (
      <View style={styles.reserveRow}>
        {DURATION_OPTIONS.map((min) => (
        <TouchableOpacity
          key={min}
          style={styles.reserveChip}
          onPress={() => handleReserve(item._id, min)}   // ⬅ CAMBIO AQUÍ
        >
          <Text style={styles.reserveChipText}>{min} min</Text>
        </TouchableOpacity>
      ))}
        <TouchableOpacity
          style={[styles.reserveChip, styles.reportChip]}
          onPress={() => openReportModal(item)}
        >
          <Text style={[styles.reserveChipText, styles.reportChipText]}>Reportar</Text>
        </TouchableOpacity>
      </View>
      ) : (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnWarn]}
          onPress={() => openReportModal(item)}
          disabled={item.status === "Mantenimiento"}
        >
          <Text style={styles.actionBtnText}>
            {item.status === "Mantenimiento" ? "En mantención" : "Reportar"}
          </Text>
        </TouchableOpacity>
      </View>
      )}
    </View>
  </View>
);

  if (loading) return <Loader/>

  const selected = new Date(selectedDate);
  const formattedDate = selected.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = selected.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      {/* 🔴 MODAL DE REPORTE */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReportModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}>
            <View style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
            }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                Reportar problema
              </Text>
              {reportingMachine && (
                <Text style={{ marginBottom: 8, color: COLORS.textSecondary }}>
                  Máquina: <Text style={{ fontWeight: "600" }}>{reportingMachine.name}</Text>
                </Text>
              )}

              <TextInput
                placeholder="Describe el problema de la máquina..."
                multiline
                value={reportMessage}
                onChangeText={setReportMessage}
                style={{
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  padding: 8,
                  textAlignVertical: "top",
                  marginBottom: 12,
                }}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                <TouchableOpacity
                  onPress={closeReportModal}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#EEE",
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitReport}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: COLORS.primary,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
            <Text style={styles.headerSubtitle}>Trainer View</Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
              Reserva para:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {formattedDate} a las {formattedTime}
            </Text>

          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            <TouchableOpacity
              style={styles.reserveChip}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.reserveChipText}>Cambiar fecha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reserveChip}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.reserveChipText}>Cambiar hora</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selected}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
              // preserva hora/minutos actuales
              const newDate = new Date(date);
              newDate.setHours(
                selected.getHours(),
                selected.getMinutes(),
                0,
                0
              );
              setSelectedDate(newDate);
              }
            }}
          />
        )}

        {showTimePicker && (
        <DateTimePicker
          value={selected}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) {
              const newDate = new Date(selectedDate);
              newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
              setSelectedDate(newDate);
            }
          }}
        />
        )}
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