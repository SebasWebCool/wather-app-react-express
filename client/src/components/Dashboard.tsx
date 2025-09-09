import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import WeatherCard from './WeatherCard';
import type { DailyForecast } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

const Dashboard = ({ data, selectedUnit, setSelectedUnit, refetch }) => {
  // Estado para el drill-down
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Manejador para el click en una ciudad (Drill-down)
  const handleCityClick = async (cityName: string) => {
    setLoadingForecast(true);
    setSelectedCity(cityName);
    try {
      const forecastData = await weatherApi.getForecast(cityName, selectedUnit);
      setForecast(forecastData);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoadingForecast(false);
    }
  };

  // Preparar datos para los gráficos
  // 1. Gráfico de Barras: Top 5 ciudades más cálidas
  const barChartData = data.top5Warmest.map(city => ({
    name: city.name,
    temperature: Math.round(city.main.temp),
    fullData: city // Para el tooltip personalizado
  }));

  // 2. Gráfico de Líneas: Tendencia de temperaturas (máx, min, avg) para el pronóstico
  const lineChartData = forecast || [];

  // 3. Gráfico de Pie: Distribución de humedad en las ciudades
  const pieChartData = data.allCities.map(city => ({
    name: city.name,
    value: city.main.humidity
  }));

  // Colores para el gráfico de pie
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Custom Tooltip para el gráfico de barras
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const city = payload[0].payload.fullData;
      return (
        <div className="custom-tooltip">
          <WeatherCard city={city} unit={selectedUnit} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      {/* Header con controles */}
      <header className="dashboard-header">
        <h1>🌤️ Weather Dashboard</h1>
        <div className="controls">
          <select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="unit-selector"
          >
            <option value="metric">°C</option>
            <option value="imperial">°F</option>
          </select>
          <button onClick={refetch} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Sección de Cards principales */}
      <section className="cities-grid">
        {data.allCities.map(city => (
          <WeatherCard 
            key={city.name} 
            city={city} 
            unit={selectedUnit}
            onClick={() => handleCityClick(city.name)}
          />
        ))}
      </section>

      {/* Sección de Gráficos */}
      <section className="charts-section">
        <h2>📊 Weather Insights</h2>
        
        {/* Gráfico 1: Barras - Top 5 más cálidas */}
        <div className="chart-container">
          <h3>Top 5 Warmest Cities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: `Temperature (${selectedUnit === 'metric' ? '°C' : '°F'})`, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="temperature" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Líneas - Pronóstico (solo se muestra si hay drill-down) */}
        {forecast && (
          <div className="chart-container">
            <h3>5-Day Forecast for {selectedCity}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: `Temperature (${selectedUnit === 'metric' ? '°C' : '°F'})`, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="temp_max" stroke="#ff8042" name="Max Temp" />
                <Line type="monotone" dataKey="temp_min" stroke="#0088fe" name="Min Temp" />
                <Line type="monotone" dataKey="temp_avg" stroke="#00c49f" name="Avg Temp" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico 3: Pie - Distribución de humedad */}
        <div className="chart-container">
          <h3>Humidity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Loading state para el forecast */}
      {loadingForecast && (
        <div className="forecast-loading">
          <p>Loading forecast for {selectedCity}...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;