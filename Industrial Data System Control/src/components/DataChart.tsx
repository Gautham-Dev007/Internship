import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DataChartProps {
  systemStatus: {
    power: boolean;
    cooling: boolean;
    ventilation: boolean;
    emergency: boolean;
  };
}

export function DataChart({ systemStatus }: DataChartProps) {
  const [data, setData] = useState<Array<{
    time: string;
    temperature: number;
    pressure: number;
    flow: number;
    power: number;
  }>>([]);

  useEffect(() => {
    // Initialize with some data points
    const initialData = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30000); // 30 seconds apart
      initialData.push({
        time: time.toLocaleTimeString(),
        temperature: 65 + Math.random() * 10,
        pressure: 14.5 + Math.random() * 0.5,
        flow: 120 + Math.random() * 20,
        power: 85 + Math.random() * 10
      });
    }
    setData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        
        // Remove oldest point if we have too many
        if (newData.length >= 20) {
          newData.shift();
        }

        // Generate new data point based on system status
        const baseTemp = systemStatus.cooling ? 65 : 85;
        const basePressure = systemStatus.power ? 14.5 : 10;
        const baseFlow = systemStatus.ventilation ? 120 : 60;
        const basePower = systemStatus.power ? 85 : 0;

        newData.push({
          time: new Date().toLocaleTimeString(),
          temperature: Math.max(0, baseTemp + (Math.random() - 0.5) * 10),
          pressure: Math.max(0, basePressure + (Math.random() - 0.5) * 1),
          flow: Math.max(0, baseFlow + (Math.random() - 0.5) * 30),
          power: Math.max(0, basePower + (Math.random() - 0.5) * 15)
        });

        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [systemStatus]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature and Pressure */}
        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium">Temperature & Pressure</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
                name="Temperature (°F)"
              />
              <Area
                type="monotone"
                dataKey="pressure"
                stackId="2"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Pressure (PSI)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Flow and Power */}
        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium">Flow Rate & Power Consumption</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line
                type="monotone"
                dataKey="flow"
                stroke="#10B981"
                strokeWidth={2}
                name="Flow Rate (L/min)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Power (kW)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}