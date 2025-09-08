import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertPanelProps {
  systemStatus: {
    power: boolean;
    cooling: boolean;
    ventilation: boolean;
    emergency: boolean;
  };
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function AlertPanel({ systemStatus }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    const now = new Date();

    if (systemStatus.emergency) {
      newAlerts.push({
        id: 'emergency',
        type: 'error',
        message: 'EMERGENCY STOP ACTIVATED - System shutdown initiated',
        timestamp: now,
        acknowledged: false
      });
    }

    if (!systemStatus.power) {
      newAlerts.push({
        id: 'power',
        type: 'error',
        message: 'Main power system offline',
        timestamp: now,
        acknowledged: false
      });
    }

    if (!systemStatus.cooling) {
      newAlerts.push({
        id: 'cooling',
        type: 'warning',
        message: 'Cooling system disabled - Temperature rising',
        timestamp: now,
        acknowledged: false
      });
    }

    if (!systemStatus.ventilation) {
      newAlerts.push({
        id: 'ventilation',
        type: 'warning',
        message: 'Ventilation system offline',
        timestamp: now,
        acknowledged: false
      });
    }

    if (systemStatus.power && systemStatus.cooling && systemStatus.ventilation && !systemStatus.emergency) {
      newAlerts.push({
        id: 'operational',
        type: 'success',
        message: 'All systems operational',
        timestamp: now,
        acknowledged: false
      });
    }

    setAlerts(prev => {
      // Remove old alerts and add new ones
      const filtered = prev.filter(alert => 
        newAlerts.some(newAlert => newAlert.id === alert.id) ? alert.acknowledged : false
      );
      
      const merged = [...filtered];
      newAlerts.forEach(newAlert => {
        if (!merged.some(existing => existing.id === newAlert.id)) {
          merged.push(newAlert);
        }
      });

      // Keep only last 10 alerts
      return merged.slice(-10);
    });
  }, [systemStatus]);

  // Simulate random system alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3 && systemStatus.power) { // 30% chance every 5 seconds
        const randomAlerts = [
          { type: 'info' as const, message: 'System backup completed successfully' },
          { type: 'warning' as const, message: 'High vibration detected on Motor 2' },
          { type: 'info' as const, message: 'Maintenance window scheduled for 02:00' },
          { type: 'warning' as const, message: 'Coolant level below optimal range' },
          { type: 'info' as const, message: 'Data synchronization complete' }
        ];

        const randomAlert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
        
        setAlerts(prev => [...prev.slice(-9), {
          id: `random-${Date.now()}`,
          type: randomAlert.type,
          message: randomAlert.message,
          timestamp: new Date(),
          acknowledged: false
        }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [systemStatus.power]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getAlertBadgeVariant = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'success':
        return 'default' as const;
      case 'info':
        return 'outline' as const;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">System Alerts</CardTitle>
          <Badge variant="outline" className="text-gray-300">
            {alerts.filter(a => !a.acknowledged).length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p>No active alerts</p>
              </div>
            ) : (
              alerts
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.acknowledged 
                        ? 'bg-gray-700/50 border-gray-600 opacity-60' 
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 space-y-1">
                          <p className="text-white text-sm">{alert.message}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                              {alert.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}