// App.jsx
import { useWeatherData } from './hooks/useWeatherData'
import './App.css'

function App() {
  // Usamos nuestro custom hook
  const { data, loading, error, selectedUnit, setSelectedUnit } = useWeatherData();

  // Renderizado condicional para los estados
  if (loading) {
    return <div className="loading">Loading weather data...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Si no hay data después de cargar
  if (!data) {
    return <div>No data available</div>;
  }

  // ¡ÉXITO! Mostramos los datos en crudo para verificar que todo funciona
  return (
    <div className="app">
      <h1>Weather Dashboard</h1>
      <div>
        <label>Unit: </label>
        <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
          <option value="metric">°C</option>
          <option value="imperial">°F</option>
        </select>
      </div>
      
      <h2>Raw Data from Backend (Proof of Concept)</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre> 
      {/* Esto mostrará el JSON completo. Lo quitaremos en el siguiente paso. */}
    </div>
  );
}

export default App