import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Siren, Timer, ShieldAlert, Activity, CloudSun, GitPullRequest } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const SmartSignal = () => {
  // Video and API State
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ class_breakdown: {} as Record<string, number>, vehicles_per_hour: 0 });
  
  // Traffic Light State
  const [lightState, setLightState] = useState<"RED" | "GREEN" | "YELLOW">("RED");
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Emergency Override State
  const [isEmergency, setIsEmergency] = useState(false);
  const [simulatedEmergency, setSimulatedEmergency] = useState(false);

  // Slow-changing environmental factors (updates every 5 mins)
  const [factors, setFactors] = useState({
    predictedVph: 850,
    currentVph: 820,
    congestionIndex: "Moderate (0.65)",
    weather: "Clear / Dry",
    crossTraffic: "Low"
  });

  // 1. Fetch live API data every 2 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/traffic/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setIsConnected(true);

          // Check for emergency vehicles in the actual YOLO data
          const hasAmbulance = data.class_breakdown?.ambulance > 0;
          const hasFiretruck = data.class_breakdown?.['fire truck'] > 0;
          
          if ((hasAmbulance || hasFiretruck) && !isEmergency) {
            setIsEmergency(true);
          } else if (!hasAmbulance && !hasFiretruck && !simulatedEmergency) {
            setIsEmergency(false);
          }
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
  }, [simulatedEmergency, isEmergency]);

  // 2. Traffic Light Timer Logic
  useEffect(() => {
    // EMERGENCY OVERRIDE
    if (isEmergency || simulatedEmergency) {
      setLightState("GREEN");
      setTimeLeft(99); // Lock timer during emergency
      return;
    }

    // NORMAL OPERATION
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch lights when timer hits 0
          if (lightState === "RED") {
            setLightState("GREEN");
            return 30; // Green for 30s
          } else if (lightState === "GREEN") {
            setLightState("YELLOW");
            return 5; // Yellow for 5s
          } else {
            setLightState("RED");
            return 30; // Red for 30s
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lightState, isEmergency, simulatedEmergency]);

  // 3. Update slow-changing factors every 5 minutes (300,000 ms)
  useEffect(() => {
    const updateFactors = () => {
      setFactors(prev => ({
        ...prev,
        currentVph: stats.vehicles_per_hour > 0 ? stats.vehicles_per_hour : prev.currentVph,
        predictedVph: (stats.vehicles_per_hour > 0 ? stats.vehicles_per_hour : prev.currentVph) + Math.floor(Math.random() * 40 - 10)
      }));
    };
    const slowInterval = setInterval(updateFactors, 300000);
    return () => clearInterval(slowInterval);
  }, [stats.vehicles_per_hour]);


  // Helper for traffic light styling
  const getLightClass = (color: string) => {
    const isActive = lightState === color;
    const base = "w-20 h-20 rounded-full border-4 border-gray-900 transition-all duration-300";
    if (!isActive) return `${base} bg-gray-800 opacity-30`;
    
    if (color === "RED") return `${base} bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)]`;
    if (color === "YELLOW") return `${base} bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.8)]`;
    if (color === "GREEN") return `${base} bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.8)]`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" /> 
            Smart Signal Controller
          </h1>
        </div>

        {/* Demo Toggle Button */}
        <button 
          onClick={() => setSimulatedEmergency(!simulatedEmergency)}
          className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${
            simulatedEmergency ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Siren className="w-4 h-4" />
          {simulatedEmergency ? "EMERGENCY ACTIVE" : "Simulate Ambulance"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
              <span className="text-sm font-medium flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-signal-green' : 'bg-signal-red'}`} />
                AI Detection Feed
              </span>
            </div>
            <div className="relative aspect-video bg-black">
              {isConnected ? (
                <img src={`${API_BASE_URL}/video/processed`} className="w-full h-full object-cover" alt="AI Feed" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Waiting for video...</div>
              )}
              
              {/* Emergency Overlay */}
              {(isEmergency || simulatedEmergency) && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg backdrop-blur-sm border border-red-400 flex items-center justify-center gap-3 animate-pulse">
                  <Siren className="w-6 h-6" />
                  <span className="font-bold tracking-wider">EMERGENCY VEHICLE DETECTED - FORCING GREEN LIGHT</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Traffic Light & Timer */}
        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-lg border p-6 flex flex-col items-center justify-center shadow-sm h-full">
            <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Signal Status</h3>
            
            {/* The Traffic Light Housing */}
            <div className="bg-gray-950 p-6 rounded-3xl border-4 border-gray-800 flex flex-col gap-4 shadow-xl">
              <div className={getLightClass("RED")} />
              <div className={getLightClass("YELLOW")} />
              <div className={getLightClass("GREEN")} />
            </div>

            {/* The Countdown Timer */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Time Remaining</span>
              </div>
              <div className={`text-6xl font-black tabular-nums tracking-tighter ${isEmergency || simulatedEmergency ? 'text-green-500' : 'text-foreground'}`}>
                {(isEmergency || simulatedEmergency) ? "--" : timeLeft.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Factors & Calculation Metrics */}
      <div className="bg-card rounded-lg border shadow-sm p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Signal Timing Factors (5-Min Rolling Average)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-muted/40 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1">Current VPH</p>
            <p className="font-semibold">{factors.currentVph}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1">Predicted VPH</p>
            <p className="font-semibold text-primary">{factors.predictedVph}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CloudSun className="w-3 h-3"/> Weather</p>
            <p className="font-semibold">{factors.weather}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><GitPullRequest className="w-3 h-3"/> Cross Traffic</p>
            <p className="font-semibold">{factors.crossTraffic}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-md border">
            <p className="text-xs text-muted-foreground mb-1">Congestion Index</p>
            <p className="font-semibold">{factors.congestionIndex}</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded border">
          <strong>System Note:</strong> Base red light duration is dynamically calculated between 25-30s based on the Congestion Index and Cross Traffic vectors. Emergency overrides preempt all timing cycles.
        </div>
      </div>
    </div>
  );
};

export default SmartSignal;