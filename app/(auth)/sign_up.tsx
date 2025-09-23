import { router } from 'expo-router'
import React from 'react'
import { Button, Text, View } from 'react-native'

const sign_up = () => {
  return (
    <View>
      <Text>sign_up</Text>
      <Button title='Sign In' onPress={() => router.push("/sign_in")}></Button>
    </View>
  )
}

export default sign_up