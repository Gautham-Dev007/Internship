import { useState } from 'react';
import { Wrench, Clock, Play, Settings as SettingsIcon, Plus, Minus, RotateCw, AlertTriangle } from 'lucide-react';

interface ManualModeProps {
  isRunning: boolean;
  showConfirmation: (config: any) => void;
  hideConfirmation: () => void;
}

export function ManualMode({ isRunning, showConfirmation, hideConfirmation }: ManualModeProps) {
  const [automaticSpeed, setAutomaticSpeed] = useState(7.00);
  const [timeSpeed, setTimeSpeed] = useState(50.00);
  const [time, setTime] = useState(30.00);
  const [dropSpeed, setDropSpeed] = useState(7.00);
  const [dispensingTime, setDispensingTime] = useState(2.00);
  const [intervalTime, setIntervalTime] = useState(3.00);
  const [selectedPump, setSelectedPump] = useState<'A' | 'B' | 'Both'>('A');

  const adjustValue = (setValue: React.Dispatch<React.SetStateAction<number>>, currentValue: number, direction: 'up' | 'down', step = 0.1, paramName: string) => {
    const newValue = Math.max(0, currentValue + (direction === 'up' ? step : -step));
    
    if (isRunning && Math.abs(newValue - currentValue) >= step) {
      showConfirmation({
        title: 'PARAMETER CHANGE',
        message: `Change ${paramName} from ${currentValue.toFixed(2)} to ${newValue.toFixed(2)} while system is running?`,
        onConfirm: () => {
          setValue(newValue);
          hideConfirmation();
        },
        variant: 'warning',
        timeout: 8
      });
    } else {
      setValue(newValue);
    }
  };

  const executePump = () => {
    showConfirmation({
      title: 'EXECUTE PUMP',
      message: `Execute pump ${selectedPump} with current parameters? This will dispense material according to set values.`,
      onConfirm: () => {
        console.log(`Executing pump ${selectedPump}`);
        hideConfirmation();
      },
      variant: 'info',
      timeout: 10
    });
  };

  const selectPump = (pump: 'A' | 'B' | 'Both') => {
    if (isRunning && pump !== selectedPump) {
      showConfirmation({
        title: 'CHANGE PUMP SELECTION',
        message: `Switch from pump ${selectedPump} to pump ${pump} while system is running?`,
        onConfirm: () => {
          setSelectedPump(pump);
          hideConfirmation();
        },
        variant: 'warning',
        timeout: 8
      });
    } else {
      setSelectedPump(pump);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-2 overflow-hidden">
      <div className="bg-blue-700/50 rounded border border-blue-500 p-2 h-full flex flex-col overflow-hidden">
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Pump Selection */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className="text-white font-bold text-xs">Select Pump:</span>
            <div className="flex bg-blue-800 rounded">
              {(['A', 'B', 'Both'] as const).map((pump) => (
                <button
                  key={pump}
                  onClick={() => selectPump(pump)}
                  className={`px-2 py-1 text-xs font-bold transition-colors ${
                    selectedPump === pump
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-200 hover:text-white'
                  } ${isRunning && pump !== selectedPump ? 'border border-orange-400' : ''}`}
                >
                  {pump}
                  {isRunning && pump !== selectedPump && <AlertTriangle className="w-2 h-2 ml-1 inline" />}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Controls */}
          <div className="space-y-1">
            {/* Automatic Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Auto Speed(ul/s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setAutomaticSpeed, automaticSpeed, 'down', 0.1, 'Automatic Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {automaticSpeed.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setAutomaticSpeed, automaticSpeed, 'up', 0.1, 'Automatic Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>

            {/* Time Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Time Speed(ul/s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setTimeSpeed, timeSpeed, 'down', 1, 'Time Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {timeSpeed.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setTimeSpeed, timeSpeed, 'up', 1, 'Time Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Time(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setTime, time, 'down', 1, 'Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {time.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setTime, time, 'up', 1, 'Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>

            {/* Drop Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Drop Speed(ul/s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setDropSpeed, dropSpeed, 'down', 0.1, 'Drop Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {dropSpeed.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setDropSpeed, dropSpeed, 'up', 0.1, 'Drop Speed')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>

            {/* Dispensing Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Dispensing time(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setDispensingTime, dispensingTime, 'down', 0.1, 'Dispensing Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {dispensingTime.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setDispensingTime, dispensingTime, 'up', 0.1, 'Dispensing Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>

            {/* Interval Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">Interval time(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustValue(setIntervalTime, intervalTime, 'down', 0.1, 'Interval Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2.5rem] text-center">
                  {intervalTime.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustValue(setIntervalTime, intervalTime, 'up', 0.1, 'Interval Time')}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Execute Button */}
        <div className="pt-2 border-t border-blue-600 flex-shrink-0">
          <button
            onClick={executePump}
            className="w-full h-6 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1 transition-all border border-green-500"
          >
            <RotateCw className="w-3 h-3" />
            Execute {selectedPump}
            <span className="text-xs ml-1">[!]</span>
          </button>
        </div>
      </div>
    </div>
  );
}