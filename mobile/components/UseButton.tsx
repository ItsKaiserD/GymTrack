import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { images } from '../constants'

const UseButton = () => {
  return (
    <TouchableOpacity className="cart-btn" onPress={() => {}}>
      <Image source={images.arrowRight} className="size-10" resizeMode="contain"></Image>
      <View className="custom-btn">
        <Text className="small-bold text-white">Usar</Text>
      </View>
    </TouchableOpacity>
  )
}

export default UseButton