import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface DataTableProps {
  systemStatus: {
    power: boolean;
    cooling: boolean;
    ventilation: boolean;
    emergency: boolean;
  };
}

interface SensorReading {
  id: string;
  sensor: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export function DataTable({ systemStatus }: DataTableProps) {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);

  useEffect(() => {
    // Initialize sensor data
    const sensors = [
      { id: 'temp-01', sensor: 'Temperature Sensor 1', unit: '°F', baseValue: 68 },
      { id: 'temp-02', sensor: 'Temperature Sensor 2', unit: '°F', baseValue: 72 },
      { id: 'press-01', sensor: 'Pressure Sensor 1', unit: 'PSI', baseValue: 14.7 },
      { id: 'press-02', sensor: 'Pressure Sensor 2', unit: 'PSI', baseValue: 14.2 },
      { id: 'flow-01', sensor: 'Flow Meter 1', unit: 'L/min', baseValue: 125 },
      { id: 'flow-02', sensor: 'Flow Meter 2', unit: 'L/min', baseValue: 118 },
      { id: 'volt-01', sensor: 'Voltage Monitor', unit: 'V', baseValue: 415 },
      { id: 'curr-01', sensor: 'Current Monitor', unit: 'A', baseValue: 12.8 },
      { id: 'vib-01', sensor: 'Vibration Sensor 1', unit: 'mm/s', baseValue: 1.8 },
      { id: 'vib-02', sensor: 'Vibration Sensor 2', unit: 'mm/s', baseValue: 2.1 }
    ];

    const initialData = sensors.map(sensor => ({
      ...sensor,
      value: sensor.baseValue + (Math.random() - 0.5) * sensor.baseValue * 0.1,
      status: 'normal' as const,
      lastUpdated: new Date()
    }));

    setSensorData(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => prev.map(sensor => {
        let newValue = sensor.value;
        let newStatus: 'normal' | 'warning' | 'critical' = 'normal';

        // Apply system status effects
        if (sensor.id.startsWith('temp')) {
          const baseTemp = systemStatus.cooling ? 68 : 85;
          newValue = baseTemp + (Math.random() - 0.5) * 8;
          if (newValue > 90) newStatus = 'critical';
          else if (newValue > 80) newStatus = 'warning';
        } else if (sensor.id.startsWith('press')) {
          const basePressure = systemStatus.power ? 14.5 : 8;
          newValue = basePressure + (Math.random() - 0.5) * 1;
          if (newValue < 10) newStatus = 'critical';
          else if (newValue < 12) newStatus = 'warning';
        } else if (sensor.id.startsWith('flow')) {
          const baseFlow = systemStatus.ventilation ? 120 : 40;
          newValue = baseFlow + (Math.random() - 0.5) * 20;
          if (newValue < 60) newStatus = 'critical';
          else if (newValue < 90) newStatus = 'warning';
        } else if (sensor.id.startsWith('volt') || sensor.id.startsWith('curr')) {
          if (!systemStatus.power) {
            newValue = 0;
            newStatus = 'critical';
          } else {
            newValue = sensor.value + (Math.random() - 0.5) * sensor.value * 0.05;
          }
        } else if (sensor.id.startsWith('vib')) {
          const baseVib = systemStatus.power ? 2 : 0.5;
          newValue = baseVib + (Math.random() - 0.5) * 1;
          if (newValue > 4) newStatus = 'critical';
          else if (newValue > 3) newStatus = 'warning';
        }

        return {
          ...sensor,
          value: Math.max(0, newValue),
          status: systemStatus.emergency ? 'critical' : newStatus,
          lastUpdated: new Date()
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [systemStatus]);

  const getStatusBadge = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return <Badge variant="default" className="bg-green-600">Normal</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-600">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Sensor Data Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Sensor</TableHead>
                <TableHead className="text-gray-300">Current Value</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensorData.map((sensor) => (
                <TableRow key={sensor.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">
                    {sensor.sensor}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono">
                    {sensor.value.toFixed(1)} {sensor.unit}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sensor.status)}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {sensor.lastUpdated.toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}