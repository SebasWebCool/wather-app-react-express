const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs', 'http_trace.jsonl');

// Middlewares
app.use(cors());
app.use(express.json());

// Constantes para la API de OpenWeather
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Ruta para obtener el clima actual de una lista de ciudades (usando sus NOMBRES)
// URL de ejem: /api/weather/dashboard?cities=London,Paris,Buenos Aires&unit=metric
app.get('/api/weather/dashboard', async (req, res) => {
  try {

    await sendToWebhook({
      timestamp: new Date().toISOString(),
      level: 'info',
      route: '/dashboard',
      query: req.query
    });

    writeToTraceFile({
      level: 'info',
      route: req.path,
      method: req.method,
      query: req.query,
      params: req.params
    });

    const { cities, unit = 'metric' } = req.query;

    if (!cities) {
      return res.status(400).json({ error: 'Parameter cities is required (ej.: cities=London,Paris,Madrid)' });
    }

    const cityList = cities.split(',');

    // Hacer una llamada a la API por CADA ciudad (usando el endpoint de "weather" con el nombre de la ciudad)
    const weatherPromises = cityList.map(cityName =>
      axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
        params: {
          q: cityName.trim(),   // Usamos el nombre de la ciudad
          units: unit,
          appid: OPENWEATHER_API_KEY,
        }
      }).then(response => response.data)
        .catch(error => {
          // Manejar errores individuales para una ciudad (ej.: nombre mal escrito)
          console.error(`Error fetching data for ${cityName}:`, error.message);
          return { error: `Data could not be obtained for: ${cityName}`, name: cityName };
        })
    );

    const weatherData = await Promise.all(weatherPromises);

    // Filtrar datos exitosos y errores
    const successfulData = weatherData.filter(city => !city.error);
    const failedData = weatherData.filter(city => city.error);

    // Mostrar error si ninguna ciudad fue exitosa
    if (successfulData.length === 0) {
      return res.status(500).json({
        error: 'Data could not be obtained for: all requested cities.',
        failedRequests: failedData
      });
    }

    // TRANSFORMACIONES A LOS DATOS OBTENIDOS
    // Transformación 1: Top-N (Top 5 ciudades más cálidas)
    const top5Warmest = [...successfulData]
      .sort((a, b) => b.main.temp - a.main.temp)
      .slice(0, 5);

    // Transformación 2: Cálculo de Tasa (Humedad relativa vs. Humedad máxima "posible")
    const citiesWithRatio = successfulData.map(city => ({
      ...city,
      main: {
        ...city.main,
        humidity_ratio: city.main.humidity / 100
      }
    }));

    // Transformación 3: Agregación y Cálculo (Temperatura Promedio del Conjunto de Ciudades)
    const averageTemp = successfulData.reduce((sum, city) => sum + city.main.temp, 0) / successfulData.length;

    // Construimos el objeto de respuesta
    const transformedData = {
      allCities: citiesWithRatio, // Datos de todas las ciudades con la transformación 2
      top5Warmest: top5Warmest,   // Transformación 1
      averageTemp: averageTemp,    // Transformación 3
      unit: unit,                  // Para que el frontend sepa qué unidades usar
      failedRequests: failedData   // Información de errores para debugging amigable
    };

    console.log("Dashboard data fetched and transformed for cities:", cityList);
    res.json(transformedData);

  } catch (error) {
    // Mostrar errores generales
    console.error('General error in /dashboard:', error.message);
    res.status(500).json({ error: 'Internal server error while processing the request.' });
  }
});

// Ruta para el "drill-down": Obtener pronóstico de 5 días para una ciudad específica
app.get('/api/weather/forecast/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const { unit = 'metric' } = req.query;

    await sendToWebhook({
      timestamp: new Date().toISOString(),
      level: 'info',
      route: '/forecast/:cityName',
      query: req.query
    });

    writeToTraceFile({
      level: 'info',
      route: req.path,
      method: req.method,
      query: req.query,
      params: req.params
    });

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: cityName, // Usamos el nombre de la ciudad
        units: unit,
        appid: OPENWEATHER_API_KEY,
      }
    });

    // La API de pronóstico devuelve datos cada 3 horas por 5 días.
    // Transformación 4: Agregación Temporal (Agrupar por día y calcular max/min)
    let forecastData = response.data.list;
    const dailyForecast = {};
    forecastData.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: date,
          temps: [],
          humidity: [],
        };
      }
      dailyForecast[date].temps.push(item.main.temp);
      dailyForecast[date].humidity.push(item.main.humidity);
    });

    const dailySummary = Object.values(dailyForecast).map(day => ({
      date: day.date,
      temp_max: Math.max(...day.temps),
      temp_min: Math.min(...day.temps),
      temp_avg: (day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length).toFixed(1),
      humidity_avg: (day.humidity.reduce((sum, h) => sum + h, 0) / day.humidity.length).toFixed(1),
    }));

    console.log(`Forecast for city ${cityName} fetched and transformed`);
    res.json(dailySummary);

  } catch (error) {
    // Mejoramos el mensaje de error
    console.error('Error fetching forecast:', error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ error: `City "${req.params.cityName}" not found for forecast.` });
    } else {
      res.status(500).json({ error: 'Error fetching forecast' });
    }
  }
});



// Función para escribir trazas en el archivo JSONL
const writeToTraceFile = (data) => {
  try {
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data
    }) + '\n';

    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    console.log('📝 Trace written to file:', data);
  } catch (error) {
    console.error('Error writing to trace file:', error);
  }
};

const sendToWebhook = async (data) => {
  const WEBHOOK_URL = 'https://webhook.site/c2c6ff7d-cc34-4bf7-b108-544f2bae00e5';
  try {
    console.log('📤 [Server] Webhook Trace:', data);

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error sending webhook from server:', error);
  }
};

// Ruta básica para probar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ message: 'The server is healthy!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});