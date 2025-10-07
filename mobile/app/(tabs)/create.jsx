import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import styles from '@/assets/styles/create.style';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';


import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export default function Create() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false); 

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      // request permission if needed
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permiso Denegado", "Se necesita Acceso a Galería para subir una Imagen");
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
            encoding: FileSystem.EncodingType.Base64,
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
    if (!name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // get file extension from URI or default to jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${API_URL}/machines`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image: imageDataUrl, 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      Alert.alert("Listo", "La máquina ha sido registrada exitosamente!");
      setName("");
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS == "ios" ? "height" : "padding"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>

        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>GymTrack</Text>
            <Text style={styles.subtitle}>Bababooey</Text>
          </View>

          <View style={styles.form}>
            {/* MACHINE NAME */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='barbell-outline'
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Ingrese el Nombre de la Máquina'
                  placeholderTextColor={COLORS.placeholderText}
                  value={name}
                  onChangeText={setName}
                />
              </View>

            </View>

            {/* IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Presione para seleccionar Imagen</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
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
  )
}
