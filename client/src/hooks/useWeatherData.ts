import { useState, useEffect } from 'react';
import type { DashboardData } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

// Lista por defecto
const DEFAULT_CITIES = ['London', 'Paris', 'New York', 'Tokyo', 'Buenos Aires', 'Madrid', 'Berlin'];

export const useWeatherData = () => {
  // Estados para manejar la data, loading y errores
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<'metric' | 'imperial'>('metric');

  // Función para fetch de datos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await weatherApi.getDashboard(DEFAULT_CITIES, selectedUnit);
      setData(dashboardData);
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando el componente se monta o cambia la unidad
  useEffect(() => {
    fetchData();
  }, [selectedUnit]);

  return {
    data,
    loading,
    error,
    selectedUnit,
    setSelectedUnit,
    refetch: fetchData, // Para permitir re-intentar
  };
};