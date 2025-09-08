import { useState, useEffect } from 'react';
import { Settings, Power, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

interface IOControlModeProps {
  isRunning: boolean;
  showConfirmation: (config: any) => void;
  hideConfirmation: () => void;
}

export function IOControlMode({ isRunning, showConfirmation, hideConfirmation }: IOControlModeProps) {
  const [inputs, setInputs] = useState({
    IN00: { label: 'Start', status: false },
    IN01: { label: 'Stop', status: true },
    IN02: { label: 'Reset', status: false },
    IN03: { label: 'Door', status: true },
    IN04: { label: 'E-Stop', status: false },
    IN05: { label: 'Sensor', status: false }
  });

  const [outputs, setOutputs] = useState({
    OUT00: { label: 'Relay1', status: false, controllable: true, critical: false },
    OUT01: { label: 'Buzzer', status: true, controllable: true, critical: false },
    OUT02: { label: 'Alarm', status: false, controllable: false, critical: true },
    OUT03: { label: 'Valve1', status: false, controllable: true, critical: true },
    OUT04: { label: 'Valve2', status: true, controllable: true, critical: true },
    OUT05: { label: 'Motor', status: false, controllable: false, critical: true }
  });

  const [systemInfo] = useState({
    model: 'NDG20ll',
    version: '126.3',
    serial: 'STA20240408'
  });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Simulate random input changes (read-only)
      if (Math.random() < 0.1) {
        const inputKeys = Object.keys(inputs);
        const randomInput = inputKeys[Math.floor(Math.random() * inputKeys.length)];
        setInputs(prev => ({
          ...prev,
          [randomInput]: {
            ...prev[randomInput as keyof typeof prev],
            status: !prev[randomInput as keyof typeof prev].status
          }
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, inputs]);

  const toggleOutput = (outputId: string) => {
    const output = outputs[outputId as keyof typeof outputs];
    
    if (!output.controllable) return;

    const newStatus = !output.status;
    const isCritical = output.critical || isRunning;

    if (isCritical) {
      const variant = output.critical ? 'danger' : 'warning';
      const systemState = isRunning ? ' while system is running' : '';
      
      showConfirmation({
        title: 'OUTPUT CONTROL',
        message: `${newStatus ? 'Activate' : 'Deactivate'} ${output.label}${systemState}? This may affect system operation.`,
        onConfirm: () => {
          setOutputs(prev => ({
            ...prev,
            [outputId]: {
              ...prev[outputId as keyof typeof prev],
              status: newStatus
            }
          }));
          hideConfirmation();
        },
        variant: variant,
        timeout: isRunning ? 8 : 12
      });
    } else {
      setOutputs(prev => ({
        ...prev,
        [outputId]: {
          ...prev[outputId as keyof typeof prev],
          status: newStatus
        }
      }));
    }
  };

  const testAllOutputs = () => {
    showConfirmation({
      title: 'TEST ALL OUTPUTS',
      message: 'Activate all controllable outputs for 2 seconds? This will test system responses and may cause audible alarms.',
      onConfirm: () => {
        // Activate all controllable outputs
        setOutputs(prev => {
          const newOutputs = { ...prev };
          Object.keys(newOutputs).forEach(key => {
            if (newOutputs[key as keyof typeof newOutputs].controllable) {
              newOutputs[key as keyof typeof newOutputs].status = true;
            }
          });
          return newOutputs;
        });

        // Reset after 2 seconds
        setTimeout(() => {
          setOutputs(prev => {
            const newOutputs = { ...prev };
            Object.keys(newOutputs).forEach(key => {
              if (newOutputs[key as keyof typeof newOutputs].controllable) {
                newOutputs[key as keyof typeof newOutputs].status = false;
              }
            });
            return newOutputs;
          });
        }, 2000);

        hideConfirmation();
      },
      variant: 'warning',
      timeout: 10
    });
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-2 overflow-hidden">
      <div className="bg-blue-700/50 rounded border border-blue-500 p-2 h-full flex flex-col overflow-hidden">
        
        {/* System Info */}
        <div className="flex items-center justify-between text-white mb-2 flex-shrink-0">
          <div className="text-xs font-bold">{systemInfo.model}.{systemInfo.version}</div>
          {isRunning && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">LIVE</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Inputs Section */}
          <div className="space-y-1 overflow-y-auto">
            <h3 className="text-white font-bold text-xs border-b border-blue-600 pb-1 flex-shrink-0">INPUTS</h3>
            {Object.entries(inputs).map(([key, input]) => (
              <div key={key} className="flex items-center justify-between bg-blue-800/50 p-1 rounded">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    input.status ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <span className="text-white text-xs">●</span>
                  </div>
                  <span className="text-white text-xs">{key.slice(-2)}:{input.label}</span>
                </div>
                <div className={`w-6 h-3 rounded-full ${input.status ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-2 h-2 bg-white rounded-full mt-0.5 transition-transform ${
                    input.status ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Outputs Section */}
          <div className="space-y-1 overflow-y-auto">
            <h3 className="text-white font-bold text-xs border-b border-blue-600 pb-1 flex-shrink-0">OUTPUTS</h3>
            {Object.entries(outputs).map(([key, output]) => (
              <div key={key} className="flex items-center justify-between bg-blue-800/50 p-1 rounded">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    output.status ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <span className="text-white text-xs">●</span>
                  </div>
                  <span className="text-white text-xs">{key.slice(-2)}:{output.label}</span>
                  {output.critical && (
                    <AlertTriangle className="w-2 h-2 text-orange-400" />
                  )}
                </div>
                <button
                  onClick={() => toggleOutput(key)}
                  disabled={!output.controllable}
                  className={`w-6 h-3 rounded-full transition-all ${
                    output.status ? 'bg-green-500' : 'bg-gray-600'
                  } ${
                    output.controllable 
                      ? 'cursor-pointer hover:opacity-80' 
                      : 'opacity-50 cursor-not-allowed'
                  } ${
                    output.controllable && (output.critical || isRunning) 
                      ? 'ring-1 ring-yellow-400' 
                      : ''
                  }`}
                  title={!output.controllable ? 'Read-only output' : 'Click to toggle'}
                >
                  <div className={`w-2 h-2 bg-white rounded-full mt-0.5 transition-transform ${
                    output.status ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-2 pt-2 border-t border-blue-600 flex-shrink-0">
          <button
            onClick={testAllOutputs}
            className="w-full h-6 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold border border-orange-500 flex items-center justify-center gap-1"
          >
            <Power className="w-3 h-3" />
            Test All Outputs
            <span className="text-xs">[!]</span>
          </button>
        </div>
      </div>
    </div>
  );
}