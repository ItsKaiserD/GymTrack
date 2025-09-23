import { Redirect, Slot } from 'expo-router';
import React from 'react';

const _layout = () => {
  const isAuthenticated = false;

  if (!isAuthenticated) return <Redirect href={"/(auth)/sign_in"}></Redirect>
  return (
    <Slot></Slot>
  )
}

export default _layout