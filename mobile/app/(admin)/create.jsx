import { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.style";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api";

export default function Create() {
  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false); 

  const router = useRouter();
  const { token } = useAuthStore();

  //const pickImage = async () => {
    //try {
      // request permission if needed
      //if (Platform.OS !== "web") {
        //const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        //if (status !== "granted") {
          //Alert.alert("Permiso Denegado", "Se necesita Acceso a Galería para subir una Imagen");
          //return;
        //}
      //}

      // launch image library
      //const result = await ImagePicker.launchImageLibraryAsync({
        //mediaTypes: "images",
        //allowsEditing: true,
        //aspect: [4, 3],
        //quality: 0.5, // lower quality for smaller base64
        //base64: true,
      //});

      //if (!result.canceled) {
        //setImage(result.assets[0].uri);

        // if base64 is provided, use it

        //if (result.assets[0].base64) {
          //setImageBase64(result.assets[0].base64);
        //} else {
          // otherwise, convert to base64
          //const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            //encoding: FileSystem.EncodingType.Base64,
          //});

          //setImageBase64(base64);
        //}
      //}
    //} catch (error) {
      //console.error("Error picking image:", error);
      //Alert.alert("Error", "There was a problem selecting your image");
    //}
  //};

  //const handleSubmit = async () => {
    //if (!name || !imageBase64) {
      //Alert.alert("Error", "Por favor rellene todos los campos");
      //return;
    //}

    //try {
      //setLoading(true);

      // get file extension from URI or default to jpeg
      //const uriParts = image.split(".");
      //const fileType = uriParts[uriParts.length - 1];
      //const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

      //const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      //const response = await fetch(`${API_URL}/machines`, {
        //method: "POST",
        //headers: {
          //Authorization: `Bearer ${token}`,
          //"Content-Type": "application/json",
        //},
        //body: JSON.stringify({
          //name,
          //image: imageDataUrl,
        //}),
      //});

      //const data = await response.json();
      //if (!response.ok) throw new Error(data.message || "Something went wrong");

      //Alert.alert("Listo", "La máquina ha sido registrada exitosamente!");
      //setName("");
      //setImage(null);
      //setImageBase64(null);
      //router.push("/");
    //} catch (error) {
      //console.error("Error Registrando Máquina:", error);
      //Alert.alert("Error", error.message || "Something went wrong");
    //} finally {
      //setLoading(false);
    //}
  //};
  
  
  //const pickImage = async () => {
    //try {
      //if (Platform.OS !== "web") {
        //const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        //if (status !== "granted") {
          //Alert.alert("Permiso Denegado", "Se necesita Acceso a Galería para subir una Imagen");
          //return;
        //}
      //}

      //const result = await ImagePicker.launchImageLibraryAsync({
        //mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //allowsEditing: true,
        //aspect: [4, 3],
        //quality: 0.7, // buena compresión
        //base64: false, // ⚠️ ya no necesitamos base64
     // });

      //if (!result.canceled) {
        //setImage(result.assets[0].uri); // e.g. file:///...
      //}
    //} catch (error) {
      //console.error("Error picking image:", error);
      //Alert.alert("Error", "Hubo un problema al seleccionar la imagen");
    //}
  //};

const pickImage = async () => {
  try {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a galería para subir una imagen");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });

    console.log("Picker result:", result);

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    } else {
      // Usuario canceló o no hubo asset
      console.log("No image selected");
    }
  } catch (e) {
    console.error("pickImage error:", e);
    Alert.alert("Error", "No se pudo seleccionar la imagen");
  }
};


const handleSubmit = async () => {
  if (!name || !imageUri) { Alert.alert("Error", "Faltan datos"); return; }
  if (!token) { Alert.alert("Sesión expirada", "Vuelve a iniciar sesión"); return; }

  setLoading(true);
  try {
    // Deduce mime/extension
    const m = String(imageUri).match(/\.(png|jpe?g|webp|heic)$/i);
    const ext = m ? m[1].toLowerCase() : "jpg";
    const mime =
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      ext === "heic" ? "image/heic" :
      "image/jpeg";

    // iOS: normaliza 'file://'
    const normalizedUri =
      Platform.OS === "ios" && imageUri.startsWith("file://")
        ? imageUri.replace("file://", "")
        : imageUri;

    const form = new FormData();
    form.append("name", name);
    form.append("image", {
      uri: normalizedUri,
      name: `photo.${ext === "jpeg" ? "jpg" : ext}`,
      type: mime,
    });

    // DEBUG local
    console.log("POST ->", `${API_URL}/machines`);
    console.log("Token present:", !!token);
    console.log("Form has:", [...form]); // puede no imprimir bien en RN, pero sirve de señal

    const res = await fetch(`${API_URL}/machines`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // ⚠️ NO pongas Content-Type: RN lo setea con boundary
      },
      body: form,
    });

    const ct = res.headers.get("content-type") || "";
    const raw = await res.text();
    const data = ct.includes("application/json") ? JSON.parse(raw) : raw;

    if (!res.ok) {
      const msg = typeof data === "string" ? data : (data?.message || `HTTP ${res.status}`);
      throw new Error(msg);
    }

    Alert.alert("Listo", "La máquina ha sido registrada!");
    setName(""); setImageUri(null);
    router.push("/");
  } catch (e) {
    console.error("Error Registrando Máquina:", e);
    Alert.alert("Error", String(e.message || e));
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
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
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
