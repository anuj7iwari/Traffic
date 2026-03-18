import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, MapPin } from "lucide-react";

const HISTORICAL_DATA: Record<string, any> = {
  "Intersection A": {
    hourly: [
      { hour: "00:00", volume: 120 }, { hour: "01:00", volume: 85 }, { hour: "02:00", volume: 60 },
      { hour: "03:00", volume: 50 }, { hour: "04:00", volume: 70 }, { hour: "05:00", volume: 110 },
      { hour: "06:00", volume: 200 }, { hour: "07:00", volume: 450 }, { hour: "08:00", volume: 580 },
      { hour: "09:00", volume: 520 }, { hour: "10:00", volume: 400 }, { hour: "11:00", volume: 380 },
      { hour: "12:00", volume: 410 }, { hour: "13:00", volume: 390 }, { hour: "14:00", volume: 420 },
      { hour: "15:00", volume: 480 }, { hour: "16:00", volume: 550 }, { hour: "17:00", volume: 600 },
      { hour: "18:00", volume: 580 }, { hour: "19:00", volume: 450 }, { hour: "20:00", volume: 300 },
      { hour: "21:00", volume: 220 }, { hour: "22:00", volume: 180 }, { hour: "23:00", volume: 140 }
    ],
    classes: [
      { name: "car", count: 900 }, { name: "bike", count: 1250},
      { name: "bus", count: 85 }, { name: "truck", count: 120 }
    ]
  },
  "Main Street": {
    hourly: [
      { hour: "00:00", volume: 210 }, { hour: "01:00", volume: 150 }, { hour: "02:00", volume: 100 },
      { hour: "03:00", volume: 90 }, { hour: "04:00", volume: 120 }, { hour: "05:00", volume: 180 },
      { hour: "06:00", volume: 300 }, { hour: "07:00", volume: 600 }, { hour: "08:00", volume: 850 },
      { hour: "09:00", volume: 750 }, { hour: "10:00", volume: 550 }, { hour: "11:00", volume: 500 },
      { hour: "12:00", volume: 580 }, { hour: "13:00", volume: 540 }, { hour: "14:00", volume: 620 },
      { hour: "15:00", volume: 720 }, { hour: "16:00", volume: 880 }, { hour: "17:00", volume: 950 },
      { hour: "18:00", volume: 820 }, { hour: "19:00", volume: 600 }, { hour: "20:00", volume: 450 },
      { hour: "21:00", volume: 350 }, { hour: "22:00", volume: 280 }, { hour: "23:00", volume: 240 }
    ],
    classes: [
      { name: "car", count: 2000}, { name: "bike", count: 2500},
      { name: "bus", count: 210 }, { name: "truck", count: 450 }
    ]
  },
  "Highway Exit 42": {
    hourly: [
      { hour: "00:00", volume: 400 }, { hour: "01:00", volume: 300 }, { hour: "02:00", volume: 250 },
      { hour: "03:00", volume: 200 }, { hour: "04:00", volume: 280 }, { hour: "05:00", volume: 450 },
      { hour: "06:00", volume: 800 }, { hour: "07:00", volume: 1500 }, { hour: "08:00", volume: 2200 },
      { hour: "09:00", volume: 1900 }, { hour: "10:00", volume: 1200 }, { hour: "11:00", volume: 1100 },
      { hour: "12:00", volume: 1300 }, { hour: "13:00", volume: 1250 }, { hour: "14:00", volume: 1400 },
      { hour: "15:00", volume: 1600 }, { hour: "16:00", volume: 2100 }, { hour: "17:00", volume: 2400 },
      { hour: "18:00", volume: 2000 }, { hour: "19:00", volume: 1500 }, { hour: "20:00", volume: 1000 },
      { hour: "21:00", volume: 800 }, { hour: "22:00", volume: 600 }, { hour: "23:00", volume: 500 }
    ],
    classes: [
      { name: "car", count: 6500 }, { name: "truck", count: 2800 },
      { name: "bus", count: 400 }, { name: "bike", count: 50 } , { name: "Three_Weeler", count: 68 }
    ]
  }
};

const Statistics = () => {
  const locations = Object.keys(HISTORICAL_DATA);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]);

  const currentData = HISTORICAL_DATA[selectedLocation];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Live Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Historical Statistics</h1>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic Area Chart */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm font-medium text-foreground mb-6">24-Hour Traffic Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} vehicles`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Class Bar Chart */}
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm font-medium text-foreground mb-6">Total Vehicles by Class</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.classes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                {/* FIX: Using tickFormatter instead of textTransform */}
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}`, 'Count']}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;