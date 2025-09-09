// components/WeatherCard.jsx
import { getWeatherIcon } from '../utils/weatherIcons';

const WeatherCard = ({ city, unit, onClick }) => {
  if (!city) return null;

  const tempUnit = unit === 'metric' ? '°C' : '°F';

  return (
    <div className="weather-card" onClick={onClick}>
      <h3>{city.name}</h3>
      <div className="weather-main">
        <img 
          src={getWeatherIcon(city.weather[0].icon)} 
          alt={city.weather[0].description} 
        />
        <span className="temp">{Math.round(city.main.temp)}{tempUnit}</span>
      </div>
      <p>{city.weather[0].description}</p>
      <div className="weather-details">
        <span>H: {Math.round(city.main.temp_max)}{tempUnit}</span>
        <span>L: {Math.round(city.main.temp_min)}{tempUnit}</span>
        <span>💧 {city.main.humidity}%</span>
      </div>
    </div>
  );
};

export default WeatherCard;