import { useState, useEffect } from 'react';
import type { DashboardData } from '../types/weather';
import { weatherApi } from '../services/weatherApi';
import { webhookService } from '../services/webhookService'; // Importamos el servicio

const DEFAULT_CITIES = ['London', 'Paris', 'New York', 'Tokyo', 'Buenos Aires', 'Madrid', 'Berlin'];

export const useWeatherData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<'metric' | 'imperial'>('metric');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Enviamos traza de inicio
      await webhookService.sendTrace(
        webhookService.createEvent('info', 'useWeatherData', 'Fetching weather data started', {
          cities: DEFAULT_CITIES,
          unit: selectedUnit
        })
      );

      const dashboardData = await weatherApi.getDashboard(DEFAULT_CITIES, selectedUnit);
      setData(dashboardData);

      // Enviamos traza de éxito
      await webhookService.sendTrace(
        webhookService.createEvent('info', 'useWeatherData', 'Fetching weather data successful', {
          citiesCount: dashboardData.allCities.length,
          averageTemp: dashboardData.averageTemp
        })
      );

    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch weather data';
      setError(errorMessage);
      
      //  Enviamos traza de error
      await webhookService.sendTrace(
        webhookService.createEvent('error', 'useWeatherData', 'Fetching weather data failed', {
          error: errorMessage,
          originalError: err.message
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedUnit]);

  return {
    data,
    loading,
    error,
    selectedUnit,
    setSelectedUnit,
    refetch: fetchData,
  };
};