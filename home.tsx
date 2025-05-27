import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WeatherService from './services/weatherService';
import { RootStackParamList } from './navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type WeatherUnit = 'c' | 'f';
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

interface WeatherData {
  name: string;
  weather: WeatherType;
  temp: { c: number; f: number };
  feelsLike: { c: number; f: number };
  humidity: number;
  wind: number;
  description?: string;
}

interface ForecastData {
  date: Date;
  dateString: string;
  weather: WeatherType;
  temp: { c: number; f: number };
  tempMin: { c: number; f: number };
  description: string;
}

const { width, height } = Dimensions.get('window');

const weatherIcons: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
};

const weatherDescriptions: Record<WeatherType, string> = {
  sunny: 'Sunny',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  stormy: 'Thunderstorm',
  snowy: 'Snowy',
};

const weatherGradients: Record<WeatherType, string[]> = {
  sunny: ['#FF8A80', '#FFD93B', '#6BCF7F'],
  cloudy: ['#74b9ff', '#0984e3', '#a29bfe'],
  rainy: ['#636e72', '#74b9ff', '#81ecec'],
  stormy: ['#2d3436', '#636e72', '#6c5ce7'],
  snowy: ['#ddd6fe', '#e0e7ff', '#f1f5f9'],
};

export default function Home() {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [unit, setUnit] = useState<WeatherUnit>('c');
  const [darkMode, setDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Enhanced animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Load default location (London) on startup
    handleSearchLocation('London');
    startIntroAnimation();
  }, []);

  useEffect(() => {
    if (weatherData) {
      startWeatherAnimation();
    }
  }, [weatherData?.weather]);

  const startIntroAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startWeatherAnimation = () => {
    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation for sunny weather
    if (weatherData?.weather === 'sunny') {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }

    // Pulse animation for stormy weather
    if (weatherData?.weather === 'stormy') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const handleSearchLocation = async (locationName: string) => {
    if (!locationName.trim()) return;

    setLoading(true);
    try {
      const result = await WeatherService.searchLocationByName(locationName);
      setWeatherData(result.current);
      
      if (result.forecast) {
        setForecastData(result.forecast);
      }

      // Add to search history
      if (!searchHistory.includes(result.current.name)) {
        setSearchHistory(prev => [result.current.name, ...prev.slice(0, 4)]);
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    handleSearchLocation(query);
    setQuery('');
  };

  const handleMapPress = () => {
    navigation.navigate('Map');
  };

  const renderWeatherIcon = () => {
    if (!weatherData) return null;

    const iconSize = 120;
    const icon = weatherIcons[weatherData.weather];

    return (
      <Animated.View
        style={{
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            },
            {
              rotate: weatherData.weather === 'sunny' 
                ? rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                : '0deg',
            },
            {
              scale: weatherData.weather === 'stormy' ? pulseAnim : 1,
            },
          ],
          marginVertical: 30,
          alignSelf: 'center',
        }}
      >
        <View
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          <Text style={{ fontSize: 60 }}>{icon}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderForecast = () => {
    if (forecastData.length === 0) return null;

    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {forecastData.map((day, index) => (
            <Animated.View
              key={index}
              style={[
                styles.forecastItem,
                {
                  transform: [
                    {
                      translateY: slideAnim,
                    },
                  ],
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.forecastDay}>
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </Text>
              <Text style={styles.forecastIcon}>{weatherIcons[day.weather]}</Text>
              <Text style={styles.forecastTemp}>
                {unit === 'c' ? day.temp.c : day.temp.f}°
              </Text>
              <Text style={styles.forecastTempMin}>
                {unit === 'c' ? day.tempMin.c : day.tempMin.f}°
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a2e',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.9,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 30,
    },
    searchWrapper: {
      position: 'relative',
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 25,
      paddingHorizontal: 25,
      paddingVertical: 18,
      fontSize: 16,
      color: 'white',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 10,
      marginRight: 10,
    },
    searchButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    mapButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    weatherContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    locationContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    locationText: {
      fontSize: 28,
      fontWeight: '300',
      color: 'white',
      textAlign: 'center',
      letterSpacing: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 5,
    },
    temperatureContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    temperatureText: {
      fontSize: 84,
      fontWeight: '100',
      color: 'white',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
    },
    descriptionText: {
      fontSize: 20,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginTop: 10,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
    unitContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 25,
      padding: 4,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    unitButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      minWidth: 60,
      alignItems: 'center',
    },
    activeUnitButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    unitButtonText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
      fontSize: 16,
    },
    activeUnitButtonText: {
      color: '#333',
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      padding: 25,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 10,
    },
    detailItem: {
      alignItems: 'center',
      flex: 1,
    },
    detailLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    forecastContainer: {
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    forecastTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    forecastItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      padding: 15,
      marginRight: 12,
      alignItems: 'center',
      minWidth: 80,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    forecastDay: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    forecastIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    forecastTemp: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    forecastTempMin: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
    },
    historyContainer: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    historyTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      letterSpacing: 0.5,
    },
    historyItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    historyItemText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    loadingText: {
      color: 'white',
      marginTop: 20,
      fontSize: 16,
      fontWeight: '300',
      letterSpacing: 0.5,
    },
  });

  const currentGradient = weatherData ? weatherGradients[weatherData.weather] : ['#667eea', '#764ba2'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Gradient Background */}
      <View
        style={[
          styles.gradientBackground,
          {
            backgroundColor: currentGradient[0],
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Search Section */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
            />

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
              <Text style={{ fontSize: 18 }}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>              
           
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        ) : weatherData ? (
          <Animated.View
            style={[
              styles.weatherContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Location */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{weatherData.name}</Text>
            </View>

            {/* Weather Icon */}
            {renderWeatherIcon()}

            {/* Temperature */}
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperatureText}>
                {unit === 'c' ? weatherData.temp.c : weatherData.temp.f}°
              </Text>
              <Text style={styles.descriptionText}>
                {weatherData.description || weatherDescriptions[weatherData.weather]}
              </Text>
            </View>

            {/* Unit Toggle */}
            <View style={styles.unitContainer}>
              <TouchableOpacity
                style={[styles.unitButton, unit === 'c' && styles.activeUnitButton]}
                onPress={() => setUnit('c')}
              >
                <Text style={[styles.unitButtonText, unit === 'c' && styles.activeUnitButtonText]}>
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, unit === 'f' && styles.activeUnitButton]}
                onPress={() => setUnit('f')}
              >
                <Text style={[styles.unitButtonText, unit === 'f' && styles.activeUnitButtonText]}>
                  °F
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weather Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Feels Like</Text>
                <Text style={styles.detailValue}>
                  {unit === 'c' ? weatherData.feelsLike.c : weatherData.feelsLike.f}°
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{weatherData.wind} km/h</Text>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* 5-Day Forecast */}
        {renderForecast()}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <Animated.View
            style={[
              styles.historyContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.historyTitle}>Recent Searches</Text>
            {searchHistory.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => handleSearchLocation(location)}
              >
                <Text style={styles.historyItemText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}