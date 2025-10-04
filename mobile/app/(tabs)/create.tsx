import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import React from 'react'
import { useRouter } from 'expo-router';
import styles from '@/assets/styles/create.style';
import { ScrollView } from 'react-native-gesture-handler';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

import * as ImagePicker from "expo-image-picker";

export default function Create() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 

  const router = useRouter();

  const pickImage = async () => {
    try {
      // request permission if needed
      if (Platform.OS !== "web"){
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso Negado", "Necesitamos Acceso a Galería para subir una imagen");
          return ;
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true, 
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error Seleccionando Imagen:", error);
      Alert.alert("Error", "Hubo un problema seleccionando su imagen");
    }
  };

  const handleSubmit = async () => {}; 

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