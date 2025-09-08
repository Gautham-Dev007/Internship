import { useState, useEffect } from 'react';
import { Settings, Plus, Minus, RotateCcw, AlertTriangle } from 'lucide-react';

interface AutomaticModeProps {
  isRunning: boolean;
  showConfirmation: (config: any) => void;
  hideConfirmation: () => void;
}

export function AutomaticMode({ isRunning, showConfirmation, hideConfirmation }: AutomaticModeProps) {
  const [pressureA, setPressureA] = useState(0.02);
  const [pressureB, setPressureB] = useState(0.15);
  const [positionA, setPositionA] = useState(0.000);
  const [positionB, setPositionB] = useState(0.000);
  const [timeA, setTimeA] = useState(0.000);
  const [timeB, setTimeB] = useState(0.000);

  const [targetPressureA, setTargetPressureA] = useState(0.10);
  const [targetPressureB, setTargetPressureB] = useState(0.20);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPressureA(prev => {
        const target = targetPressureA;
        const diff = target - prev;
        return prev + diff * 0.1 + (Math.random() - 0.5) * 0.005;
      });
      setPressureB(prev => {
        const target = targetPressureB;
        const diff = target - prev;
        return prev + diff * 0.1 + (Math.random() - 0.5) * 0.005;
      });
      setPositionA(prev => prev + (Math.random() - 0.5) * 0.001);
      setPositionB(prev => prev + (Math.random() - 0.5) * 0.001);
      setTimeA(prev => prev + 0.001);
      setTimeB(prev => prev + 0.001);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, targetPressureA, targetPressureB]);

  const adjustTarget = (type: 'A' | 'B', direction: 'up' | 'down') => {
    const adjustment = direction === 'up' ? 0.01 : -0.01;
    const currentValue = type === 'A' ? targetPressureA : targetPressureB;
    const newValue = Math.max(0, Math.min(1, currentValue + adjustment));
    
    if (isRunning && Math.abs(adjustment) > 0.005) {
      showConfirmation({
        title: 'PRESSURE ADJUSTMENT',
        message: `Adjust ${type} pressure from ${currentValue.toFixed(2)} to ${newValue.toFixed(2)} Mpa while system is running?`,
        onConfirm: () => {
          if (type === 'A') {
            setTargetPressureA(newValue);
          } else {
            setTargetPressureB(newValue);
          }
          hideConfirmation();
        },
        variant: 'warning',
        timeout: 8
      });
    } else {
      if (type === 'A') {
        setTargetPressureA(newValue);
      } else {
        setTargetPressureB(newValue);
      }
    }
  };

  const resetValues = () => {
    if (isRunning) {
      showConfirmation({
        title: 'RESET COUNTERS',
        message: 'Reset position and time counters while system is running? This will clear current measurement data.',
        onConfirm: () => {
          setPositionA(0.000);
          setPositionB(0.000);
          setTimeA(0.000);
          setTimeB(0.000);
          hideConfirmation();
        },
        variant: 'warning',
        timeout: 10
      });
    } else {
      setPositionA(0.000);
      setPositionB(0.000);
      setTimeA(0.000);
      setTimeB(0.000);
    }
  };

  const isOutOfRange = (current: number, target: number) => {
    return Math.abs(current - target) > target * 0.2; // 20% tolerance
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-2 overflow-hidden">
      <div className="bg-blue-700/50 rounded border border-blue-500 p-2 h-full flex flex-col overflow-hidden">
        
        {/* Pressure Section */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white font-bold text-xs">Pressure (Mpa)</span>
            {isRunning && (isOutOfRange(pressureA, targetPressureA) || isOutOfRange(pressureB, targetPressureB)) && (
              <AlertTriangle className="w-3 h-3 text-yellow-400 animate-pulse" />
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs">A:</span>
                <span className={`text-sm font-mono px-2 py-1 rounded min-w-[3rem] text-center ${
                  isOutOfRange(pressureA, targetPressureA) ? 'text-yellow-300 bg-yellow-900/50' : 'text-white bg-blue-800'
                }`}>
                  {pressureA.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs">Target:</span>
                <button
                  onClick={() => adjustTarget('A', 'down')}
                  disabled={isRunning && targetPressureA <= 0.01}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2rem] text-center">
                  {targetPressureA.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustTarget('A', 'up')}
                  disabled={isRunning && targetPressureA >= 0.99}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs">B:</span>
                <span className={`text-sm font-mono px-2 py-1 rounded min-w-[3rem] text-center ${
                  isOutOfRange(pressureB, targetPressureB) ? 'text-yellow-300 bg-yellow-900/50' : 'text-white bg-blue-800'
                }`}>
                  {pressureB.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs">Target:</span>
                <button
                  onClick={() => adjustTarget('B', 'down')}
                  disabled={isRunning && targetPressureB <= 0.01}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-800 px-1 py-0.5 rounded min-w-[2rem] text-center">
                  {targetPressureB.toFixed(2)}
                </span>
                <button
                  onClick={() => adjustTarget('B', 'up')}
                  disabled={isRunning && targetPressureB >= 0.99}
                  className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Position Section */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-white font-bold text-xs">Position (ul)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">A:</span>
              <span className="text-sm font-mono text-white bg-blue-800 px-2 py-1 rounded">
                {positionA.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">B:</span>
              <span className="text-sm font-mono text-white bg-blue-800 px-2 py-1 rounded">
                {positionB.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Time Section */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-white font-bold text-xs">Time (mm)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">A:</span>
              <span className="text-sm font-mono text-white bg-blue-800 px-2 py-1 rounded">
                {timeA.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">B:</span>
              <span className="text-sm font-mono text-white bg-blue-800 px-2 py-1 rounded">
                {timeB.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-auto flex-shrink-0">
          <button
            onClick={resetValues}
            className={`w-full h-6 rounded text-xs flex items-center justify-center gap-1 transition-all ${
              isRunning 
                ? 'bg-orange-700 hover:bg-orange-800 border border-orange-500 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset Counters
            {isRunning && <span className="text-xs ml-1">[!]</span>}
          </button>
        </div>
      </div>
    </div>
  );
}