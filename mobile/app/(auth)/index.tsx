import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import styles from "../../assets/styles/login.style"; 
import { useState } from 'react'
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import  COLORS from '../../constants/colors';
import { TextInput } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import React from 'react'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {};

  return (
    <KeyboardAvoidingView
     style={{ flex: 1 }}
     behavior={Platform.OS === 'ios' ? 'height': 'padding'}
    >
    <View style={styles.container}>
      <View style={styles.topIllustration}>
        <Image 
          source={require('../../assets/images/gym_bro.png')}
          style={styles.illustrationImage}
          resizeMode='contain'
        />
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
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

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Go to Sign In */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Regístrate</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>
  );
};
