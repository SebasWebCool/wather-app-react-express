import { useWeatherData } from './hooks/useWeatherData';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const { data, loading, error, selectedUnit, setSelectedUnit, refetch } = useWeatherData();

  if (loading) {
    return <div className="loading">Loading weather data...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="app">
      <Dashboard 
        data={data} 
        selectedUnit={selectedUnit} 
        setSelectedUnit={setSelectedUnit}
        refetch={refetch}
      />
    </div>
  );
}

export default App;