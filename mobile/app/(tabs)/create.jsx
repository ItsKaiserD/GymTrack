import { View, Text } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import styles from '@/assets/styles/create.style';
import { ScrollView } from 'react-native-gesture-handler';
import COLORS from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useState } from 'react';

import * as ImagePicker from "expo-image-picker";

export default function Create() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
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
    <View>
      <Text>create</Text>
    </View>
  )
}
