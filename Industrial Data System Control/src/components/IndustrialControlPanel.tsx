import { useState } from 'react';
import { Home, Grid3X3, Settings, Wrench, Gauge, Languages, Shield, User, Check, X, Power } from 'lucide-react';
import { AutomaticMode } from './AutomaticMode';
import { ManualMode } from './ManualMode';
import { IOControlMode } from './IOControlMode';
import { SettingsMode } from './SettingsMode';
import { CalibrationMode } from './CalibrationMode';
import { ConfirmationDialog } from './ConfirmationDialog';
import microLogixLogo from 'figma:asset/a36df5ba32ef98cfa987e0f4e907899cb0362bb5.png';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'warning' | 'danger' | 'info';
  timeout?: number;
}

export function IndustrialControlPanel() {
  const [activeMode, setActiveMode] = useState('automatic');
  const [isRunning, setIsRunning] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'automatic', icon: Grid3X3, label: 'Auto' },
    { id: 'manual', icon: Wrench, label: 'Manual' },
    { id: 'io', icon: Settings, label: 'I/O' },
    { id: 'settings', icon: Gauge, label: 'Setup' },
    { id: 'calibration', icon: Shield, label: 'Calib' }
  ];

  const showConfirmation = (config: Omit<ConfirmationState, 'isOpen'>) => {
    setConfirmation({
      ...config,
      isOpen: true
    });
  };

  const hideConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const getModeTitle = () => {
    const mode = navigationItems.find(item => item.id === activeMode);
    return mode ? mode.label.toUpperCase() : 'CONTROL PANEL';
  };

  const handleModeSelect = (modeId: string) => {
    if (modeId !== activeMode) {
      if (isRunning) {
        showConfirmation({
          title: 'SYSTEM RUNNING',
          message: `System is currently running. Switching to ${modeId.toUpperCase()} mode may affect operation. Continue?`,
          onConfirm: () => {
            setPendingMode(modeId);
            hideConfirmation();
          },
          variant: 'warning',
          timeout: 15
        });
      } else {
        setPendingMode(modeId);
      }
    }
  };

  const handleConfirm = () => {
    if (pendingMode) {
      setActiveMode(pendingMode);
      setPendingMode(null);
    }
  };

  const handleCancel = () => {
    setPendingMode(null);
  };

  const handleStartStop = () => {
    if (isRunning) {
      // Stopping - always requires confirmation
      showConfirmation({
        title: 'STOP SYSTEM',
        message: 'Are you sure you want to stop the system? This will halt all current operations immediately.',
        onConfirm: () => {
          setIsRunning(false);
          hideConfirmation();
        },
        variant: 'danger',
        timeout: 10
      });
    } else {
      // Starting - requires confirmation
      showConfirmation({
        title: 'START SYSTEM',
        message: 'System will begin operation with current parameters. Ensure all safety protocols are in place.',
        onConfirm: () => {
          setIsRunning(true);
          hideConfirmation();
        },
        variant: 'warning',
        timeout: 15
      });
    }
  };

  const renderContent = () => {
    const commonProps = {
      isRunning,
      showConfirmation,
      hideConfirmation
    };

    switch (activeMode) {
      case 'automatic':
        return <AutomaticMode {...commonProps} />;
      case 'manual':
        return <ManualMode {...commonProps} />;
      case 'io':
        return <IOControlMode {...commonProps} />;
      case 'settings':
        return <SettingsMode {...commonProps} />;
      case 'calibration':
        return <CalibrationMode {...commonProps} />;
      default:
        return <AutomaticMode {...commonProps} />;
    }
  };

  return (
    <div className="w-[480px] h-[272px] bg-gradient-to-b from-blue-800 to-blue-900 flex flex-col text-xs relative overflow-hidden">
      {/* Title Bar */}
      <div className="h-8 bg-blue-900 border-b-2 border-blue-700 flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <img 
            src={microLogixLogo} 
            alt="MicroLOGIX" 
            className="w-5 h-5 object-contain"
          />
          <span className="text-white font-bold text-xs">{getModeTitle()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-sm flex items-center justify-center ${
            isRunning ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <span className="text-white text-xs">●</span>
          </div>
          <span className="text-white text-xs">{isRunning ? 'RUN' : 'STOP'}</span>
          {pendingMode && (
            <div className="w-3 h-3 bg-yellow-500 rounded-sm animate-pulse">
              <span className="text-white text-xs">!</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {renderContent()}
        </div>

        {/* Right Sidebar */}
        <div className="w-16 bg-blue-900 border-l-2 border-blue-700 flex flex-col flex-shrink-0">
          {/* Navigation Icons */}
          <div className="flex-1 py-1 overflow-hidden">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMode === item.id;
              const isPending = pendingMode === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleModeSelect(item.id)}
                  className={`w-full h-9 flex flex-col items-center justify-center mb-1 transition-colors text-xs border ${
                    isActive 
                      ? 'bg-blue-600 border-blue-400' 
                      : isPending
                      ? 'bg-orange-600 border-orange-400 animate-pulse'
                      : 'hover:bg-blue-700 border-transparent'
                  }`}
                  title={item.label}
                >
                  <IconComponent className={`w-3 h-3 ${
                    isActive ? 'text-white' : isPending ? 'text-white' : 'text-blue-300'
                  }`} />
                  <span className={`text-xs mt-0.5 ${
                    isActive ? 'text-white' : isPending ? 'text-white' : 'text-blue-300'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm/Cancel Buttons for Mode Change */}
          {pendingMode && (
            <div className="p-1 border-t border-blue-700 space-y-1 flex-shrink-0">
              <div className="text-center text-white text-xs mb-1">Change?</div>
              <button
                onClick={handleConfirm}
                className="w-full h-5 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center font-bold"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancel}
                className="w-full h-5 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center justify-center font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Emergency Stop Button */}
          {isRunning && (
            <div className="p-1 border-t border-blue-700 flex-shrink-0">
              <button
                onClick={() => {
                  showConfirmation({
                    title: 'EMERGENCY STOP',
                    message: 'EMERGENCY STOP will immediately halt all system operations. This action cannot be undone. Continue?',
                    onConfirm: () => {
                      setIsRunning(false);
                      hideConfirmation();
                    },
                    variant: 'danger',
                    timeout: 5
                  });
                }}
                className="w-full h-6 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs border-2 border-red-500"
              >
                E-STOP
              </button>
            </div>
          )}

          {/* Start/Stop Button */}
          <div className="p-1 border-t border-blue-700 flex-shrink-0">
            <button
              onClick={handleStartStop}
              className={`w-full h-6 rounded font-bold text-xs transition-all border-2 ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-400'
                  : 'bg-green-600 hover:bg-green-700 text-white border-green-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Power className="w-3 h-3" />
                {isRunning ? 'STOP' : 'START'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={hideConfirmation}
        variant={confirmation.variant}
        timeout={confirmation.timeout}
      />
    </div>
  );
}