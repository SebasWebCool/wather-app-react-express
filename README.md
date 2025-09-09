# 🌤️ Weather Analytics Dashboard

Un mini-dashboard meteorológico construido con React + Express que consume la API de OpenWeatherMap. Desarrollado como reto técnico en un tiempo límite de 3 horas.

## 🚀 Características

- **Dashboard en tiempo real**: Visualiza el clima actual de ciudades principales worldwide
- **4 tipos de visualizaciones**: 
  - Tarjetas interactivas por ciudad
  - Gráfico de barras (Top 5 ciudades más cálidas)
  - Gráfico de líneas (Pronóstico 5 días - drill-down)
  - Gráfico de pie (Distribución de humedad)
- **Filtros interactivos**: 
  - Selector de unidades métricas/imperiales (°C/°F)
  - Drill-down al hacer click en cualquier ciudad
- **Backend seguro**: Proxy que protege tu API key de OpenWeatherMap
- **Diseño responsive**: Funciona en desktop y mobile
- **Manejo de errores**: Estados de loading, error y empty states elegantes
- **Trazas de ejecución**: Sistema de logging que simula envío a webhook

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18 + Vite
- TypeScript
- Recharts (gráficos)
- React Icons
- Axios (cliente HTTP)

**Backend:**
- Node.js + Express
- Axios
- CORS middleware
- dotenv (gestión de variables de entorno)

## 📋 Requisitos del Sistema

- Node.js 16+ 
- npm o yarn
- API key de [OpenWeatherMap](https://openweathermap.org/api)

## 🔌 Fuente/API Elegida
**OpenWeatherMap API** - Plan Free
- **Endpoint principal**: `https://api.openweathermap.org/data/2.5/weather?q={city}&units={unit}&appid={API_KEY}`
- **Endpoint de pronóstico**: `https://api.openweathermap.org/data/2.5/forecast?q={city}&units={unit}&appid={API_KEY}`

## 🔑 Variables de Entorno
###env
OPENWEATHER_API_KEY=tu_api_key_de_openweathermap
PORT=5000
📊 Transformaciones Implementadas
Top-N Filtering


// Top 5 ciudades más cálidas
const top5Warmest = cities.sort((a, b) => b.main.temp - a.main.temp).slice(0, 5);
Rate Calculation


// Ratio de humedad (humedad relativa / 100)
humidity_ratio: city.main.humidity / 100
Temporal Aggregation


// Temperatura promedio del conjunto
const averageTemp = cities.reduce((sum, city) => sum + city.main.temp, 0) / cities.length;
Time Series Aggregation (Pronóstico)


// Agrupación por día y cálculo de max/min/avg
const dailySummary = forecastData.reduce((acc, item) => {
  const date = item.dt_txt.split(' ')[0];
  if (!acc[date]) acc[date] = { temps: [], humidity: [] };
  acc[date].temps.push(item.main.temp);
  return acc;
}, {});

## 🎨 Decisiones de Diseño y Trade-offs
Decisiones:

Proxy backend: Para proteger API key y evitar problemas CORS

Componentes modulares: Separación clara entre servicios, hooks y componentes

Recharts: Elegido por su integración simple con React y tipos TypeScript

Console logging: Para evidencia de webhook por limitación de tiempo

Trade-offs:

✅ Priorizado: Funcionalidad end-to-end sobre perfección visual

✅ Elegido: Flexibilidad de nombres de ciudades sobre IDs estáticos

⚠️ Pospuesto: Tests automatizados por tiempo limitado

⚠️ Simplificado: Webhook simulado con console.log por complejidad de configuración

🤖 Declaración de Uso de IA
Se utilizó ChatGPT-4 para:

Generación de boilerplate code para componentes y Dashboard React

Sugerencias de manejo de errores y estados de carga

Optimización de las transformaciones de datos

Generación de documentación y README

El código fue adaptado, modificado y integrado manualmente, asegurando comprensión completa de la implementación.

## ⚡ Instalación Rápida

1. **Clonar y configurar el proyecto:**
```bash
git clone https://github.com/SebasWebCool/wather-app-react-express.git
cd wather-app-react-express

### 🚀 Cómo Ejecutar
```bash
# 1. Clonar repositorio
git clone <repo-url>
cd weather-dashboard

# 2. Configurar backend
cd server
npm install
cp .env.example .env
# Editar .env con tu API key de OpenWeatherMap

# 3. Configurar frontend
cd ../client
npm install

# 4. Ejecutar (en terminales separadas)
# Terminal 1 - Backend (puerto 5000)
cd server && npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd client && npm run dev
