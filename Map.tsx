import React, { lazy, Suspense } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';

// Lazy load components based on platform
const MapNative = lazy(() => import('./MapNative'));
const MapWeb = lazy(() => import('./MapWeb'));

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
    <Text>Loading Map...</Text>
  </View>
);

export default function Map() {
  const MapComponent = Platform.OS === 'web' ? MapWeb : MapNative;
  
  return (
    <Suspense fallback={<LoadingComponent />}>
      <MapComponent />
    </Suspense>
  );
}
