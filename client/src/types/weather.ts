// Definiciones de tipos para la aplicación del clima
export interface CityWeather {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    humidity_ratio: number; 
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
}

export interface DashboardData {
  allCities: CityWeather[];
  top5Warmest: CityWeather[];
  averageTemp: number;
  unit: string;
  failedRequests?: any[]; 
}

export interface DailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  temp_avg: string;
  humidity_avg: string;
}