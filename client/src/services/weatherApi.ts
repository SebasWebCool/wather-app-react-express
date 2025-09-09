import axios from 'axios';
import type { DashboardData, DailyForecast } from '../types/weather';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const weatherApi = {
  getDashboard: async (cities: string[], unit: string = 'metric'): Promise<DashboardData> => {
    // Convierte el array ['London', 'Paris'] en el string "London,Paris"
    const citiesQueryString = cities.join(',');
    const response = await apiClient.get<DashboardData>(`/weather/dashboard?cities=${citiesQueryString}&unit=${unit}`);
    return response.data;
  },

  // Método para obtener el pronóstico (drill-down)
  getForecast: async (cityName: string, unit: string = 'metric'): Promise<DailyForecast[]> => {
    const response = await apiClient.get<DailyForecast[]>(`/weather/forecast/${cityName}?unit=${unit}`);
    return response.data;
  },
};