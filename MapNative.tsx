// map.tsx - React Native Maps with Weather Overlay
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, StatusBar } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

// Add your OpenWeatherMap API key here
const OPENWEATHER_API_KEY = 'your-actual-api-key';

type WeatherLayer = 'temp' | 'precipitation' | 'clouds' | 'wind' | 'pressure';

export default function WeatherMap() {
  const navigation = useNavigation();
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('temp');
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const weatherLayers = {
    temp: {
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      name: '🌡️ Temperature',
      opacity: 0.6
    },
    precipitation: {
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      name: '🌧️ Precipitation',
      opacity: 0.7
    },
    clouds: {
      url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      name: '☁️ Clouds',
      opacity: 0.5
    },
    wind: {
      url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      name: '💨 Wind',
      opacity: 0.6
    },
    pressure: {
      url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      name: '📊 Pressure',
      opacity: 0.6
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 53.3498,   // Dublin coords
          longitude: -6.2603,
          latitudeDelta: 2.0,   // Increased for better weather layer visibility
          longitudeDelta: 2.0,
        }}
        mapType="standard"
      >
        {/* Weather Overlay Layer */}
        {showWeatherLayer && OPENWEATHER_API_KEY != 'your-actual-api-key' && (
          <UrlTile
            urlTemplate={weatherLayers[activeLayer].url}
            maximumZ={18}
            minimumZ={0}
            tileSize={256}
            opacity={weatherLayers[activeLayer].opacity}
            zIndex={1000}
          />
        )}
      </MapView>
      
      {/* Weather Layer Controls */}
      <View style={styles.layerControls}>
        <TouchableOpacity 
          style={[styles.toggleButton, !showWeatherLayer && styles.toggleButtonOff]}
          onPress={() => setShowWeatherLayer(!showWeatherLayer)}
        >
          <Text style={styles.toggleButtonText}>
            {showWeatherLayer ? '🌍 Hide Weather' : '🌦️ Show Weather'}
          </Text>
        </TouchableOpacity>
        
        {showWeatherLayer && (
          <View style={styles.layerButtons}>
            {Object.entries(weatherLayers).map(([key, layer]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.layerButton,
                  activeLayer === key && styles.activeLayerButton
                ]}
                onPress={() => setActiveLayer(key as WeatherLayer)}
              >
                <Text style={[
                  styles.layerButtonText,
                  activeLayer === key && styles.activeLayerButtonText
                ]}>
                  {layer.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
    
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  layerControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 15,
    zIndex: 2000,
    maxWidth: 180,
  },
  toggleButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  toggleButtonOff: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  layerButtons: {
    gap: 5,
  },
  layerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 3,
  },
  activeLayerButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
  },
  layerButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeLayerButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  apiKeyWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

