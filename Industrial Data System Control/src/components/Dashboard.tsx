import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DataChart } from './DataChart';
import { SystemGauges } from './SystemGauges';
import { DataTable } from './DataTable';
import { AlertPanel } from './AlertPanel';
import { Power, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const [systemStatus, setSystemStatus] = useState({
    power: true,
    cooling: true,
    ventilation: false,
    emergency: false
  });

  const [systemHealth, setSystemHealth] = useState(87);

  const toggleSystem = (system: keyof typeof systemStatus) => {
    setSystemStatus(prev => ({
      ...prev,
      [system]: !prev[system]
    }));
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Power className="h-8 w-8 text-blue-400" />
              <h1 className="text-white text-2xl font-bold">Industrial Control System</h1>
            </div>
            <Badge variant={systemHealth > 80 ? "default" : systemHealth > 60 ? "secondary" : "destructive"}>
              System Health: {systemHealth.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Main Power</span>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={systemStatus.power}
                      onCheckedChange={() => toggleSystem('power')}
                    />
                    {systemStatus.power ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cooling System</span>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={systemStatus.cooling}
                      onCheckedChange={() => toggleSystem('cooling')}
                    />
                    {systemStatus.cooling ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ventilation</span>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={systemStatus.ventilation}
                      onCheckedChange={() => toggleSystem('ventilation')}
                    />
                    {systemStatus.ventilation ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <Button 
                  variant={systemStatus.emergency ? "destructive" : "outline"}
                  className="w-full"
                  onClick={() => toggleSystem('emergency')}
                >
                  {systemStatus.emergency ? "EMERGENCY STOP ACTIVE" : "Emergency Stop"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">System Health</label>
                <Progress value={systemHealth} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Data Visualization */}
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Real-time Data Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <DataChart systemStatus={systemStatus} />
            </CardContent>
          </Card>
        </div>

        {/* System Gauges and Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemGauges systemStatus={systemStatus} />
          <AlertPanel systemStatus={systemStatus} />
        </div>

        {/* Data Table */}
        <DataTable systemStatus={systemStatus} />
      </div>
    </div>
  );
}