import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, MapPin, BarChart2, AlignLeft, TrendingUp, AlertTriangle } from "lucide-react";

// Hardcoded predictive data
const PREDICTION_DATA: Record<string, any> = {
  "Intersection A": {
    avgVph: 385,
    peakHour: "08:00",
    peakVolume: 850,
    hourly: [
      { hour: "00:00", volume: 110 }, { hour: "01:00", volume: 80 }, { hour: "02:00", volume: 55 },
      { hour: "03:00", volume: 45 }, { hour: "04:00", volume: 65 }, { hour: "05:00", volume: 150 },
      { hour: "06:00", volume: 320 }, { hour: "07:00", volume: 680 }, { hour: "08:00", volume: 850 },
      { hour: "09:00", volume: 720 }, { hour: "10:00", volume: 450 }, { hour: "11:00", volume: 410 },
      { hour: "12:00", volume: 480 }, { hour: "13:00", volume: 460 }, { hour: "14:00", volume: 490 },
      { hour: "15:00", volume: 550 }, { hour: "16:00", volume: 700 }, { hour: "17:00", volume: 810 },
      { hour: "18:00", volume: 760 }, { hour: "19:00", volume: 520 }, { hour: "20:00", volume: 350 },
      { hour: "21:00", volume: 250 }, { hour: "22:00", volume: 190 }, { hour: "23:00", volume: 140 }
    ]
  },
  "Main Street": {
    avgVph: 510,
    peakHour: "17:00",
    peakVolume: 1100,
    hourly: [
      { hour: "00:00", volume: 180 }, { hour: "01:00", volume: 120 }, { hour: "02:00", volume: 90 },
      { hour: "03:00", volume: 75 }, { hour: "04:00", volume: 110 }, { hour: "05:00", volume: 220 },
      { hour: "06:00", volume: 450 }, { hour: "07:00", volume: 850 }, { hour: "08:00", volume: 980 },
      { hour: "09:00", volume: 820 }, { hour: "10:00", volume: 600 }, { hour: "11:00", volume: 550 },
      { hour: "12:00", volume: 650 }, { hour: "13:00", volume: 620 }, { hour: "14:00", volume: 680 },
      { hour: "15:00", volume: 800 }, { hour: "16:00", volume: 950 }, { hour: "17:00", volume: 1100 },
      { hour: "18:00", volume: 920 }, { hour: "19:00", volume: 700 }, { hour: "20:00", volume: 500 },
      { hour: "21:00", volume: 400 }, { hour: "22:00", volume: 320 }, { hour: "23:00", volume: 250 }
    ]
  }
};

const Predictions = () => {
  const locations = Object.keys(PREDICTION_DATA);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]);
  const [viewMode, setViewMode] = useState<"text" | "graph">("text");

  const currentData = PREDICTION_DATA[selectedLocation];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Live Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> 
            AI Traffic Predictions
          </h1>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <select 
            className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Predicted Average VPH</p>
            <p className="text-2xl font-semibold tabular-nums">{currentData.avgVph} <span className="text-sm font-normal text-muted-foreground">vph</span></p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-signal-amber/10 rounded-full text-signal-amber">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected Peak Hour</p>
            <p className="text-2xl font-semibold tabular-nums">{currentData.peakHour} <span className="text-sm font-normal text-muted-foreground">({currentData.peakVolume} vph)</span></p>
          </div>
        </div>
      </div>

      {/* Toggle & Content Area */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h3 className="font-medium">24-Hour Forecast</h3>
          
          {/* View Toggle */}
          <div className="flex bg-muted rounded-md p-1 border">
            <button
              onClick={() => setViewMode("text")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                viewMode === "text" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlignLeft className="w-4 h-4" /> Text Data
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                viewMode === "graph" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Graph View
            </button>
          </div>
        </div>

        {/* Content Render */}
        <div className="p-4">
          {viewMode === "text" ? (
            /* TEXT TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 rounded-tl-md">Time (Hour)</th>
                    <th className="px-6 py-3 rounded-tr-md">Predicted Volume (VPH)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.hourly.map((data: any, index: number) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3 font-medium tabular-nums">{data.hour}</td>
                      <td className="px-6 py-3 tabular-nums">
                        {data.volume}
                        {data.volume === currentData.peakVolume && (
                          <span className="ml-2 text-xs bg-signal-amber/20 text-signal-amber px-2 py-0.5 rounded-full font-medium">Peak</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRAPH VIEW */
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} vph`, 'Predicted']}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrediction)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;