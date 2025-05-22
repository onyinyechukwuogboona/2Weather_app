class WeatherApp {
    constructor() {
        this.currentUnit = 'celsius';
        this.isDarkMode = false;
        this.searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        
        // Sample data for demo
        this.sampleLocations = {
            'london': { 
                name: 'London, UK', 
                weather: 'sunny', 
                temp: { c: 21, f: 70 }, 
                feelsLike: { c: 23, f: 73 }, 
                humidity: 45, 
                wind: 6 
            },
            'paris': { 
                name: 'Paris, France', 
                weather: 'cloudy', 
                temp: { c: 19, f: 66 }, 
                feelsLike: { c: 18, f: 64 }, 
                humidity: 60, 
                wind: 8 
            },
            'tokyo': { 
                name: 'Tokyo, Japan', 
                weather: 'rainy', 
                temp: { c: 17, f: 63 }, 
                feelsLike: { c: 16, f: 61 }, 
                humidity: 75, 
                wind: 12 
            },
            'new york': { 
                name: 'New York, USA', 
                weather: 'stormy', 
                temp: { c: 15, f: 59 }, 
                feelsLike: { c: 13, f: 55 }, 
                humidity: 80, 
                wind: 20 
            },
            'moscow': { 
                name: 'Moscow, Russia', 
                weather: 'snowy', 
                temp: { c: -2, f: 28 }, 
                feelsLike: { c: -6, f: 21 }, 
                humidity: 85, 
                wind: 15 
            }
        };

        this.weatherTypes = {
            sunny: { background: 'sunny', elements: ['.sun'], icon: '☀️', description: 'Sunny' },
            cloudy: { background: 'cloudy', elements: ['.cloud'], icon: '☁️', description: 'Cloudy' },
            rainy: { background: 'rainy', elements: ['.cloud', '.rain'], icon: '🌧️', description: 'Rainy' },
            stormy: { background: 'stormy', elements: ['.cloud', '.rain', '.lightning'], icon: '⛈️', description: 'Thunderstorm' },
            snowy: { background: 'snowy', elements: ['.cloud', '.snowflake'], icon: '❄️', description: 'Snowy' }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSearchHistory();
        this.updateWeather(this.sampleLocations['london']);
        this.updateDate();
        this.generateForecast();
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('weatherAppTheme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        const searchButton = document.querySelector('.search-bar button');
        
        searchButton.addEventListener('click', () => this.searchLocation());
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchLocation();
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Unit toggle
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleUnit(e.target.dataset.unit));
        });

        // Location button
        document.querySelector('.location-btn').addEventListener('click', () => this.getCurrentLocation());

        // Clear history button (will be added dynamically)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-history')) {
                this.clearSearchHistory();
            } else if (e.target.classList.contains('history-item')) {
                this.searchFromHistory(e.target.textContent);
            }
        });
    }

    searchLocation() {
        const query = document.querySelector('.search-bar input').value.trim().toLowerCase();
        
        if (!query) return;

        this.showLoading();

        // Simulate API delay
        setTimeout(() => {
            if (this.sampleLocations[query]) {
                this.updateWeather(this.sampleLocations[query]);
                this.addToSearchHistory(this.sampleLocations[query].name);
                this.hideLoading();
                document.querySelector('.search-bar input').value = '';
            } else {
                this.showError('Location not found! Try: London, Paris, Tokyo, New York, or Moscow');
            }
        }, 1000);
    }

    searchFromHistory(locationName) {
        const location = Object.values(this.sampleLocations).find(loc => loc.name === locationName);
        if (location) {
            this.updateWeather(location);
        }
    }

    addToSearchHistory(locationName) {
        if (!this.searchHistory.includes(locationName)) {
            this.searchHistory.unshift(locationName);
            this.searchHistory = this.searchHistory.slice(0, 5); // Keep only 5 recent searches
            localStorage.setItem('weatherSearchHistory', JSON.stringify(this.searchHistory));
            this.updateSearchHistory();
        }
    }

    updateSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        historyContainer.innerHTML = '';

        if (this.searchHistory.length > 0) {
            this.searchHistory.forEach(location => {
                const historyItem = document.createElement('button');
                historyItem.className = 'history-item';
                historyItem.textContent = location;
                historyItem.setAttribute('aria-label', `Search for ${location}`);
                historyContainer.appendChild(historyItem);
            });

            const clearBtn = document.createElement('button');
            clearBtn.className = 'clear-history';
            clearBtn.textContent = '🗑️ Clear';
            clearBtn.setAttribute('aria-label', 'Clear search history');
            historyContainer.appendChild(clearBtn);
        }
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('weatherSearchHistory');
        this.updateSearchHistory();
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // For demo purposes, just show London
                    setTimeout(() => {
                        this.updateWeather(this.sampleLocations['london']);
                        this.hideLoading();
                    }, 1000);
                },
                (error) => {
                    this.showError('Location access denied. Please search manually.');
                }
            );
        } else {
            this.showError('Geolocation is not supported by this browser.');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-theme', this.isDarkMode);
        
        const themeToggle = document.querySelector('.theme-toggle');
        themeToggle.textContent = this.isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        
        localStorage.setItem('weatherAppTheme', this.isDarkMode ? 'dark' : 'light');
    }

    toggleUnit(unit) {
        this.currentUnit = unit;
        
        // Update button states
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === unit);
        });

        // Update temperature displays
        this.updateTemperatureDisplays();
    }

    updateTemperatureDisplays() {
        const tempElement = document.getElementById('temperature');
        const feelsLikeElement = document.getElementById('feelsLike');
        
        if (this.currentLocationData) {
            const temp = this.currentUnit === 'celsius' ? 
                this.currentLocationData.temp.c : this.currentLocationData.temp.f;
            const feelsLike = this.currentUnit === 'celsius' ? 
                this.currentLocationData.feelsLike.c : this.currentLocationData.feelsLike.f;
            const unit = this.currentUnit === 'celsius' ? '°C' : '°F';
            
            tempElement.textContent = `${temp}${unit}`;
            feelsLikeElement.textContent = `Feels like: ${feelsLike}${unit}`;
        }

        // Update forecast temperatures
        this.generateForecast();
    }

    updateWeather(locationData) {
        this.currentLocationData = locationData;
        
        // Update location and weather info
        document.querySelector('.location').textContent = locationData.name;
        document.getElementById('weatherDescription').textContent = this.weatherTypes[locationData.weather].description;
        document.getElementById('weatherIcon').textContent = this.weatherTypes[locationData.weather].icon;
        
        // Update weather details
        document.getElementById('humidity').textContent = `Humidity: ${locationData.humidity}%`;
        document.getElementById('windSpeed').textContent = `Wind: ${locationData.wind} km/h`;
        
        // Update temperatures based on current unit
        this.updateTemperatureDisplays();
        
        // Update background and animations
        this.updateWeatherAnimation(locationData.weather);
        
        // Update accessibility
        document.getElementById('weatherIcon').setAttribute('aria-label', `${this.weatherTypes[locationData.weather].description} weather`);
    }

    updateWeatherAnimation(weatherType) {
        const bgContainer = document.querySelector('.bg-container');
        bgContainer.className = 'bg-container';
        bgContainer.classList.add(this.weatherTypes[weatherType].background);

        // Hide all animation elements
        const allElements = ['.sun', '.cloud', '.rain', '.lightning', '.snowflake'];
        allElements.forEach(element => {
            document.querySelectorAll(element).forEach(el => {
                el.style.display = 'none';
            });
        });

        // Show only relevant elements for the current weather
        this.weatherTypes[weatherType].elements.forEach(element => {
            document.querySelectorAll(element).forEach(el => {
                el.style.display = 'block';
            });
        });
    }

    updateDate() {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        document.querySelector('.date').textContent = dateString;
    }

    generateForecast() {
        const weatherOptions = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const options = { weekday: 'short', day: 'numeric', month: 'short' };
            const dateString = date.toLocaleDateString('en-US', options);
            
            const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
            const randomHighTemp = Math.floor(Math.random() * 15) + 15;
            const randomLowTemp = randomHighTemp - Math.floor(Math.random() * 5) - 3;
            
            // Convert temperatures if needed
            const highTemp = this.currentUnit === 'fahrenheit' ? 
                Math.round(randomHighTemp * 9/5 + 32) : randomHighTemp;
            const lowTemp = this.currentUnit === 'fahrenheit' ? 
                Math.round(randomLowTemp * 9/5 + 32) : randomLowTemp;
            const unit = this.currentUnit === 'celsius' ? '°' : '°';
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.setAttribute('role', 'button');
            forecastCard.setAttribute('tabindex', '0');
            forecastCard.setAttribute('aria-label', `${dateString}: ${this.weatherTypes[randomWeather].description}, high ${highTemp}, low ${lowTemp}`);
            
            forecastCard.innerHTML = `
                <div class="forecast-day">${dateString}</div>
                <div class="forecast-icon" role="img" aria-hidden="true">${this.weatherTypes[randomWeather].icon}</div>
                <div class="forecast-temp">${highTemp}${unit}<span>${lowTemp}${unit}</span></div>
            `;
            
            forecastContainer.appendChild(forecastCard);
        }
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('currentWeather').style.opacity = '0.5';
        document.getElementById('errorState').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('currentWeather').style.opacity = '1';
    }

    showError(message) {
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorState').querySelector('p').textContent = message;
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('currentWeather').style.opacity = '1';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            document.getElementById('errorState').style.display = 'none';
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add keyboard navigation for forecast cards
document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('forecast-card') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
    }
});

// Add touch gestures for mobile
let startX, startY;
document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Simple swipe detection for forecast cards
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const forecastContainer = document.getElementById('forecastContainer');
        if (diffX > 0) {
            // Swipe left - could trigger next forecast view
            forecastContainer.scrollLeft += 100;
        } else {
            // Swipe right - could trigger previous forecast view
            forecastContainer.scrollLeft -= 100;
        }
    }
    
    startX = startY = null;
});