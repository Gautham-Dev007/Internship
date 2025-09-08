import { useState } from 'react';
import { Shield, Play, Plus, Minus, RotateCw, Save, Target, AlertTriangle } from 'lucide-react';

interface CalibrationModeProps {
  showConfirmation: (config: any) => void;
  hideConfirmation: () => void;
}

export function CalibrationMode({ showConfirmation, hideConfirmation }: CalibrationModeProps) {
  const [calibrationData, setCalibrationData] = useState({
    startAf: { ulr: 55.790, fineTuning: 0 },
    startBf: { ulr: 58.400, fineTuning: 3 }
  });

  const [inputFiltering, setInputFiltering] = useState(6);
  const [maxCurrent, setMaxCurrent] = useState(900);
  const [correctionRange, setCorrectionRange] = useState(5);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const adjustCalibration = (pump: 'startAf' | 'startBf', field: 'ulr' | 'fineTuning', direction: 'up' | 'down') => {
    const currentValue = calibrationData[pump][field];
    const step = field === 'ulr' ? 0.001 : 1;
    const newValue = Math.max(0, currentValue + (direction === 'up' ? step : -step));

    showConfirmation({
      title: 'CALIBRATION ADJUSTMENT',
      message: `Adjust ${pump} ${field} from ${currentValue.toFixed(field === 'ulr' ? 3 : 0)} to ${newValue.toFixed(field === 'ulr' ? 3 : 0)}? This affects system precision.`,
      onConfirm: () => {
        setCalibrationData(prev => ({
          ...prev,
          [pump]: {
            ...prev[pump],
            [field]: newValue
          }
        }));
        setHasUnsavedChanges(true);
        hideConfirmation();
      },
      variant: 'warning',
      timeout: 10
    });
  };

  const adjustSetting = (setValue: React.Dispatch<React.SetStateAction<number>>, currentValue: number, direction: 'up' | 'down', step = 1, name: string) => {
    const newValue = Math.max(0, currentValue + (direction === 'up' ? step : -step));
    
    showConfirmation({
      title: 'SYSTEM PARAMETER',
      message: `Change ${name} from ${currentValue} to ${newValue}? This affects system behavior.`,
      onConfirm: () => {
        setValue(newValue);
        setHasUnsavedChanges(true);
        hideConfirmation();
      },
      variant: 'info',
      timeout: 8
    });
  };

  const startCalibration = () => {
    showConfirmation({
      title: 'START CALIBRATION',
      message: 'Begin automatic calibration process? System will test pumps and adjust parameters. This may take several minutes.',
      onConfirm: () => {
        setIsCalibrating(true);
        // Simulate calibration process
        setTimeout(() => {
          setIsCalibrating(false);
          console.log('Calibration completed');
          // Update calibration values with new results
          setCalibrationData(prev => ({
            startAf: { ulr: prev.startAf.ulr + (Math.random() - 0.5) * 0.01, fineTuning: Math.round(Math.random() * 5) },
            startBf: { ulr: prev.startBf.ulr + (Math.random() - 0.5) * 0.01, fineTuning: Math.round(Math.random() * 5) }
          }));
          setHasUnsavedChanges(true);
        }, 3000);
        hideConfirmation();
      },
      variant: 'warning',
      timeout: 10
    });
  };

  const saveCalibration = () => {
    showConfirmation({
      title: 'SAVE CALIBRATION',
      message: 'Save all calibration parameters? This will update system precision settings and cannot be easily undone.',
      onConfirm: () => {
        console.log('Calibration saved:', calibrationData);
        setHasUnsavedChanges(false);
        hideConfirmation();
      },
      variant: 'warning',
      timeout: 10
    });
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-2">
      <div className="bg-blue-700/50 rounded border border-blue-500 p-2 h-full flex flex-col">
        
        {/* Header with status */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-yellow-300 text-xs mb-2">
            <AlertTriangle className="w-3 h-3" />
            <span>Unsaved changes</span>
          </div>
        )}
        
        {/* Calibration Table */}
        <div className="bg-blue-800/50 rounded p-2 mb-3">
          <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
            <div className="text-white font-bold"></div>
            <div className="text-white font-bold text-center">ul/r</div>
            <div className="text-white font-bold text-center">Fine</div>
            <div className="text-white font-bold text-center">Action</div>
          </div>
          
          {Object.entries(calibrationData).map(([key, data]) => (
            <div key={key} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <div className="text-white font-bold text-xs">{key}</div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustCalibration(key as any, 'ulr', 'down')}
                  disabled={isCalibrating}
                  className="w-3 h-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-700 px-1 py-0.5 rounded min-w-[3rem] text-center">
                  {data.ulr.toFixed(3)}
                </span>
                <button
                  onClick={() => adjustCalibration(key as any, 'ulr', 'up')}
                  disabled={isCalibrating}
                  className="w-3 h-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustCalibration(key as any, 'fineTuning', 'down')}
                  disabled={isCalibrating}
                  className="w-3 h-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
                >
                  <Minus className="w-2 h-2 text-white" />
                </button>
                <span className="text-xs font-mono text-white bg-blue-700 px-1 py-0.5 rounded min-w-[2rem] text-center">
                  {data.fineTuning}
                </span>
                <button
                  onClick={() => adjustCalibration(key as any, 'fineTuning', 'up')}
                  disabled={isCalibrating}
                  className="w-3 h-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
                >
                  <Plus className="w-2 h-2 text-white" />
                </button>
              </div>
              
              <button
                onClick={startCalibration}
                disabled={isCalibrating}
                className={`w-full h-4 rounded text-xs font-bold flex items-center justify-center border ${
                  isCalibrating
                    ? 'bg-yellow-600 text-white cursor-not-allowed border-yellow-500'
                    : 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                }`}
              >
                {isCalibrating ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>CAL</span>
                  </div>
                ) : (
                  <>CAL<AlertTriangle className="w-2 h-2 ml-1" /></>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Settings */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs">Input filtering(ms)</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustSetting(setInputFiltering, inputFiltering, 'down', 1, 'Input Filtering')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Minus className="w-2 h-2 text-white" />
              </button>
              <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[2rem] text-center">
                {inputFiltering}
              </span>
              <button
                onClick={() => adjustSetting(setInputFiltering, inputFiltering, 'up', 1, 'Input Filtering')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Plus className="w-2 h-2 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs">Max Current(mA)</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustSetting(setMaxCurrent, maxCurrent, 'down', 10, 'Max Current')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Minus className="w-2 h-2 text-white" />
              </button>
              <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[3rem] text-center">
                {maxCurrent}
              </span>
              <button
                onClick={() => adjustSetting(setMaxCurrent, maxCurrent, 'up', 10, 'Max Current')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Plus className="w-2 h-2 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs">Correction Range</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustSetting(setCorrectionRange, correctionRange, 'down', 1, 'Correction Range')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Minus className="w-2 h-2 text-white" />
              </button>
              <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[2rem] text-center">
                {correctionRange}
              </span>
              <button
                onClick={() => adjustSetting(setCorrectionRange, correctionRange, 'up', 1, 'Correction Range')}
                disabled={isCalibrating}
                className="w-4 h-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded flex items-center justify-center"
              >
                <Plus className="w-2 h-2 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-2 pt-2 border-t border-blue-600 flex gap-2">
          <button
            onClick={saveCalibration}
            disabled={!hasUnsavedChanges || isCalibrating}
            className={`flex-1 h-6 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              hasUnsavedChanges && !isCalibrating
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
            }`}
          >
            <Save className="w-3 h-3" />
            Save
            {hasUnsavedChanges && !isCalibrating && <span className="text-xs ml-1">[!]</span>}
          </button>
          <button
            onClick={startCalibration}
            disabled={isCalibrating}
            className={`flex-1 h-6 rounded text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
              isCalibrating
                ? 'bg-yellow-600 text-white cursor-not-allowed border-yellow-500'
                : 'bg-orange-600 hover:bg-orange-700 text-white border-orange-500'
            }`}
          >
            <Target className="w-3 h-3" />
            {isCalibrating ? 'Calibrating...' : 'Auto Cal'}
            {!isCalibrating && <span className="text-xs ml-1">[!]</span>}
          </button>
        </div>
      </div>
    </div>
  );
}