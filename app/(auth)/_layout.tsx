import { Slot } from 'expo-router'
import React from 'react'
import { SafeAreaView, Text } from 'react-native'

const _layout = () => {
  return (
  <SafeAreaView>
      <Text>_layout</Text>
      <Slot></Slot>
  </SafeAreaView>
  )
}

export default _layout