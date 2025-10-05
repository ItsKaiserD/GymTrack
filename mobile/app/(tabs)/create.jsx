import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import React from 'react'
import { useRouter } from 'expo-router';
import styles from '@/assets/styles/create.style';
import { ScrollView } from 'react-native-gesture-handler';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import {API_URL} from "@/constants/api"

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export default function Create() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false); 

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      // request permission if needed
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need camera roll permissions to upload an image");
          return;
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // lower quality for smaller base64
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);

        // if base64 is provided, use it

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // otherwise, convert to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: 'base64',
          });

          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const handleSubmit = async () => {
    if (!name || !image) {
      Alert.alert("Error", "Por favor rellene todos los campos");
      return;
    }

    try {
      setLoading(true);

      // get file extension from URI or default to jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      console.log('Making request to:', `${API_URL}/api/machines`);
      
      const response = await fetch(`${API_URL}/api/machines`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image: imageDataUrl,
          status: 'available'
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      const data = JSON.parse(responseText);
      
      if (!response.ok) {
        throw new Error(data.message || "Error al registrar la máquina");
      }

      Alert.alert("¡Éxito!", "La máquina ha sido registrada exitosamente");
      setName("");
      setImage(null);
      setImageBase64(null);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error de registro:", error);
      Alert.alert(
        "Error",
        error.message || "Hubo un problema al registrar la máquina"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS == "ios" ? "height" : "padding"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Máquina</Text>
            <Text style={styles.subtitle}>Bababooey</Text>
          </View>

          <View style={styles.form}>
            {/* MACHINE NAME */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre Máquina</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='barbell-sharp'
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Ingrese Nombre de Máquina'
                  placeholderTextColor={COLORS.placeholderText}
                  value={name}
                  onChangeText={setName}/>
              </View>
            </View>

            {/* IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage}/>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name='image-outline' size={40} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}> Seleccione la Imagen de la Máquina </Text>
                </View>
              )}

              </TouchableOpacity>
            </View>

            {/* REGISTER BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}
            disabled={loading}>
              { loading ? (
                <ActivityIndicator color={COLORS.white}/>
              ) : (
                <>
                  <Ionicons
                    name='cloud-upload-outline'
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Registrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

}