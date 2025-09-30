import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import styles from '@/assets/styles/login.style'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '@/constants/colors'
import { TextInput } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { useAuthStore } from "../../store/authStore"

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { user, isLoading, register } = useAuthStore();

    const router = useRouter();

    const handleSignUp = async () => {
      const result = await register(username, email, password);
      if (!result.success) Alert.alert('Error', result.message);
    };

  return (
    <KeyboardAvoidingView
     style={{ flex: 1 }}
     behavior={Platform.OS === 'ios' ? 'height': 'padding'}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>GymTrack</Text>
            <Text style={styles.subtitle}>Gestiona tu Gimnasio, Mide tu Éxito!</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de Usuario</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='person-outline'
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Ingrese su Nombre de Usuario'
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize='none'
                />
              </View>
            </View>

            {/* E-Mail Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-Mail</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline"
                  size={20} 
                  color={COLORS.primary} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder='Ingrese su E-Mail'
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                /> 
            </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Ingrese su contraseña'
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
            </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
            </TouchableOpacity>

            {/* Navigate to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya Tienes Una Cuenta?</Text>
              <TouchableOpacity onPress ={() => router.back()}>
                <Text style={styles.link}>Inicia Sesión Aquí</Text>
              </TouchableOpacity>
          </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

