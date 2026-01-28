

import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric');
  const [time, setTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);

  // REPLACE THIS WITH YOUR API KEY FROM OPENWEATHERMAP
  const API_KEY = process.env.REACT_APP_API_KEY || '9ac668c364228cbf2de9bc4e16e9830a';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const searchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('City not found. Please check the spelling and try again.');
      }
      
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      const forecastData = await forecastResponse.json();
      setForecast(forecastData);
      
      setError('');
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  const quickSearch = (cityName) => {
    setCity(cityName);
    setTimeout(() => {
      searchWeather();
    }, 100);
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (weather) {
      setTimeout(() => searchWeather(), 100);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDayName = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const tempSymbol = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  return (
    <div className="app-container">
      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? '🌙' : '☀️'}
      </button>

      {/* Header */}
      <div className="header">
        <div className="clock">
          {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="time">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <h1 className="title">⚡ Ultimate Weather App</h1>
      </div>

      {/* Search Card */}
      <div className="search-card">
        <div className="search-row">
          <input 
            type="text" 
            className="search-input" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name (e.g., Lagos, London, New York)..."
          />
          <button 
            className="btn btn-search" 
            onClick={searchWeather}
            disabled={loading}
          >
            {loading ? '🔄 Searching...' : '🔍 Search'}
          </button>
          <button className="btn btn-unit" onClick={toggleUnit}>
            {unit === 'metric' ? '°C → °F' : '°F → °C'}
          </button>
        </div>

        <div className="quick-cities">
          {['Lagos', 'London', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Mumbai'].map((cityName) => (
            <button 
              key={cityName}
              className="city-btn" 
              onClick={() => quickSearch(cityName)}
            >
              📍 {cityName}
            </button>
          ))}
        </div>

        {error && (
          <div className="error">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Initial State */}
      {!weather && !error && (
        <div className="initial-state">
          <div className="initial-icon">🌍</div>
          <h2 className="initial-title">Discover Weather Worldwide</h2>
          <p className="initial-text">Search for any city to see real-time weather data and forecasts</p>
        </div>
      )}

      {/* Weather Display */}
      {weather && (
        <div>
          <div className="weather-grid">
            {/* Main Weather Card */}
            <div className="glass-card">
              <div className="location">
                {weather.name}, {weather.sys.country}
              </div>
              
              <div className="main-weather">
                <img 
                  src={getWeatherIcon(weather.weather[0].icon)}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                />
                <div>
                  <div className="temp-display">
                    {Math.round(weather.main.temp)}{tempSymbol}
                  </div>
                  <div className="weather-desc">
                    {weather.weather[0].description}
                  </div>
                  <div className="feels-like">
                    🌡️ Feels like {Math.round(weather.main.feels_like)}{tempSymbol}
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">💧 Humidity</div>
                  <div className="stat-value">{weather.main.humidity}%</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">💨 Wind</div>
                  <div className="stat-value">
                    {Math.round(unit === 'metric' ? weather.wind.speed * 3.6 : weather.wind.speed)}
                  </div>
                  <div className="stat-unit">{speedUnit}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">🎚️ Pressure</div>
                  <div className="stat-value">{weather.main.pressure}</div>
                  <div className="stat-unit">hPa</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">👁️ Visibility</div>
                  <div className="stat-value">
                    {(weather.visibility / 1000).toFixed(1)}
                  </div>
                  <div className="stat-unit">km</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">☁️ Clouds</div>
                  <div className="stat-value">{weather.clouds.all}%</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">📈 Max Temp</div>
                  <div className="stat-value">
                    {Math.round(weather.main.temp_max)}{tempSymbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="side-panel">
              <div className="sun-times">
                <div className="section-title">☀️ Sun Times</div>
                
                <div className="sun-item">
                  <div className="sun-icon">🌅</div>
                  <div>
                    <div className="sun-label">Sunrise</div>
                    <div className="sun-time">{formatTime(weather.sys.sunrise)}</div>
                  </div>
                </div>

                <div className="sun-item">
                  <div className="sun-icon">🌇</div>
                  <div>
                    <div className="sun-label">Sunset</div>
                    <div className="sun-time">{formatTime(weather.sys.sunset)}</div>
                  </div>
                </div>
              </div>

              <div className="sun-times">
                <div className="section-title">🌡️ Temperature</div>
                
                <div className="sun-item">
                  <div>
                    <div className="sun-label">Minimum</div>
                    <div className="sun-time">
                      {Math.round(weather.main.temp_min)}{tempSymbol}
                    </div>
                  </div>
                </div>

                <div className="sun-item">
                  <div>
                    <div className="sun-label">Current</div>
                    <div className="sun-time">
                      {Math.round(weather.main.temp)}{tempSymbol}
                    </div>
                  </div>
                </div>

                <div className="sun-item">
                  <div>
                    <div className="sun-label">Maximum</div>
                    <div className="sun-time">
                      {Math.round(weather.main.temp_max)}{tempSymbol}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          {forecast && (
            <div className="forecast-section">
              <div className="section-title">📅 5-Day Forecast</div>
              <div className="forecast-grid">
                {forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5).map((day, index) => (
                  <div key={index} className="forecast-card">
                    <div className="forecast-day">{getDayName(day.dt)}</div>
                    <img
                      src={getWeatherIcon(day.weather[0].icon)}
                      alt={day.weather[0].description}
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">
                      {Math.round(day.main.temp)}{tempSymbol}
                    </div>
                    <div className="forecast-desc">
                      {day.weather[0].description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;