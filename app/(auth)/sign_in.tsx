import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputField'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'

const sign_in = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    if(!form.email || !form.password) return Alert.alert("Error", "Por favor ingrese Email y Contraseña Válidos");

    setIsSubmitting(true);

    try {
      // Llamar Función de Appwrite de autenticación

      Alert.alert("Éxito", "Has Iniciado Sesión Correctamente");
      router.replace("/");
    } catch(error:any) {
        Alert.alert("Error", error.message);
    } finally {
        setIsSubmitting(false);
    } 
  }


  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <InputField 
          placeholder="Ingrese su Email"
          value={form.email}
          onChangeText={(text) => setForm((prev) => ({...prev, email: text}))}
          label="Email"
          keyboardType="email-address"
        />
        <InputField 
          placeholder="Ingrese su Contraseña"
          value={form.password}
          onChangeText={(text) => setForm((prev) => ({...prev, password: text}))}
          label="Contraseña"
          secureTextEntry={true}
        />
        <CustomButton 
          title="Ingresar"
          isLoading={isSubmitting}
          onPress={submit}
          />
        
        <View className="flex justify-center mt-5 flex-row gap-2">
          <Text className="base-regular text-gray-100">
            ¿No Tienes Una Cuenta?
          </Text>
          <Link href="/sign_up" className="base-bold text-primary">
            Regístrate Aquí!
          </Link>
        </View>
    </View>
  )
}

export default sign_in