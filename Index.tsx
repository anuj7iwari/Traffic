import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import VideoGrid from "../components/VideoGrid";
import MetricCard from "../components/MetricCard";
import EventLog from "../components/EventLog";         // <-- Restored component
import TrafficChart from "../components/TrafficChart"; // <-- Restored component
import { Car, Activity, Hash } from "lucide-react"; 

const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL_ORG = "http://localhost:8001";

const Index = () => {
  const [stats, setStats] = useState({ 
    classes: 0, 
    vehicles_per_hour: 0, 
    total: 0,
    class_breakdown: {} as Record<string, number>
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/traffic/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Updated Header with Three Navigation Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Traffic Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link 
            to="/smart-signal" 
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors inline-flex items-center justify-center shadow-sm"
          >
            Smart Signal Control
          </Link>
          <Link 
            to="/predictions" 
            className="px-4 py-2 bg-secondary text-secondary-foreground border text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors inline-flex items-center justify-center"
          >
            AI Predictions
          </Link>
          <Link 
            to="/statistics" 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
          >
            View Statistics
          </Link>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <MetricCard label="Total Vehicles" value={stats.total.toString()} unit="count" icon={Car} />
         <MetricCard label="Vehicles/Hour" value={stats.vehicles_per_hour.toString()} unit="vph" icon={Activity} />
         <MetricCard label="Classes Detected" value={stats.classes.toString()} unit="types" icon={Hash} />
      </div>

      {/* Vehicle Class Breakdown Badges */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Vehicle Breakdown</h3>
        <div className="flex flex-wrap gap-2">
          {stats.class_breakdown && Object.entries(stats.class_breakdown).length > 0 ? (
            Object.entries(stats.class_breakdown).map(([className, count]) => (
              <div key={className} className="px-3 py-1.5 bg-muted rounded-md text-sm flex gap-2 border">
                <span className="capitalize font-medium text-foreground">{className}:</span>
                <span className="text-muted-foreground tabular-nums">{count}</span>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Waiting for detections...</span>
          )}
        </div>
      </div>

      {/* Video Streams */}
      <VideoGrid
        rawVideoUrl={isConnected ? `${API_BASE_URL_ORG}/video/original` : ""}
        detectedVideoUrl={isConnected ? `${API_BASE_URL}/video/processed` : ""}
        isConnected={isConnected}
      />

      {/* Restored Components: Charts and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart />
        </div>
        <div>
          <EventLog />
        </div>
      </div>
    </div>
  );
};

export default Index;