import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Thermometer, Gauge, Zap, Wind } from 'lucide-react';

interface SystemGaugesProps {
  systemStatus: {
    power: boolean;
    cooling: boolean;
    ventilation: boolean;
    emergency: boolean;
  };
}

export function SystemGauges({ systemStatus }: SystemGaugesProps) {
  const [metrics, setMetrics] = useState({
    temperature: 68.5,
    pressure: 14.7,
    voltage: 415.2,
    current: 12.8,
    flow: 125.3,
    vibration: 2.1
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        temperature: systemStatus.cooling 
          ? Math.max(60, Math.min(80, prev.temperature + (Math.random() - 0.5) * 2))
          : Math.max(80, Math.min(120, prev.temperature + (Math.random() - 0.5) * 3)),
        pressure: systemStatus.power 
          ? Math.max(12, Math.min(16, prev.pressure + (Math.random() - 0.5) * 0.3))
          : Math.max(8, Math.min(12, prev.pressure + (Math.random() - 0.5) * 0.2)),
        voltage: systemStatus.power 
          ? Math.max(400, Math.min(430, prev.voltage + (Math.random() - 0.5) * 2))
          : 0,
        current: systemStatus.power 
          ? Math.max(8, Math.min(18, prev.current + (Math.random() - 0.5) * 1))
          : 0,
        flow: systemStatus.ventilation 
          ? Math.max(100, Math.min(150, prev.flow + (Math.random() - 0.5) * 5))
          : Math.max(20, Math.min(60, prev.flow + (Math.random() - 0.5) * 3)),
        vibration: systemStatus.power 
          ? Math.max(0.5, Math.min(5, prev.vibration + (Math.random() - 0.5) * 0.3))
          : Math.max(0.1, Math.min(1, prev.vibration + (Math.random() - 0.5) * 0.1))
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [systemStatus]);

  const getStatusColor = (value: number, min: number, max: number, ideal: number) => {
    const distance = Math.abs(value - ideal) / (max - min);
    if (distance < 0.1) return 'text-green-400';
    if (distance < 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (value: number, min: number, max: number, ideal: number) => {
    const distance = Math.abs(value - ideal) / (max - min);
    if (distance < 0.1) return 'bg-green-400';
    if (distance < 0.3) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const gauges = [
    {
      title: 'Temperature',
      value: metrics.temperature,
      unit: '°F',
      min: 40,
      max: 120,
      ideal: 70,
      icon: Thermometer,
      description: 'System Temperature'
    },
    {
      title: 'Pressure',
      value: metrics.pressure,
      unit: 'PSI',
      min: 0,
      max: 20,
      ideal: 14.7,
      icon: Gauge,
      description: 'System Pressure'
    },
    {
      title: 'Voltage',
      value: metrics.voltage,
      unit: 'V',
      min: 0,
      max: 500,
      ideal: 415,
      icon: Zap,
      description: 'Supply Voltage'
    },
    {
      title: 'Current',
      value: metrics.current,
      unit: 'A',
      min: 0,
      max: 25,
      ideal: 12,
      icon: Zap,
      description: 'Current Draw'
    },
    {
      title: 'Flow Rate',
      value: metrics.flow,
      unit: 'L/min',
      min: 0,
      max: 200,
      ideal: 125,
      icon: Wind,
      description: 'Coolant Flow'
    },
    {
      title: 'Vibration',
      value: metrics.vibration,
      unit: 'mm/s',
      min: 0,
      max: 10,
      ideal: 1.5,
      icon: Gauge,
      description: 'Machine Vibration'
    }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">System Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {gauges.map((gauge) => {
            const percentage = ((gauge.value - gauge.min) / (gauge.max - gauge.min)) * 100;
            const Icon = gauge.icon;
            
            return (
              <div key={gauge.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{gauge.title}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-mono ${getStatusColor(gauge.value, gauge.min, gauge.max, gauge.ideal)}`}>
                      {gauge.value.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-xs">{gauge.unit}</span>
                  </div>
                  
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    <div 
                      className="absolute top-0 w-0.5 h-2 bg-white opacity-50"
                      style={{ left: `${((gauge.ideal - gauge.min) / (gauge.max - gauge.min)) * 100}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">{gauge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}