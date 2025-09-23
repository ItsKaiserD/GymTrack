import { router } from 'expo-router'
import React from 'react'
import { Button, Text, View } from 'react-native'

const sign_in = () => {
  return (
    <View>
      <Text>sign_in</Text>
      <Button title='Sign Up' onPress={() => router.push("/sign_up")}></Button>
    </View>
  )
}

export default sign_in