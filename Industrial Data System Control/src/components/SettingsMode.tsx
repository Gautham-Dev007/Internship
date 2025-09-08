import { useState } from 'react';
import { Gauge, Languages, Shield, Key, ChevronRight, Plus, Minus, Save, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsModeProps {
  showConfirmation: (config: any) => void;
  hideConfirmation: () => void;
}

export function SettingsMode({ showConfirmation, hideConfirmation }: SettingsModeProps) {
  const [settings, setSettings] = useState({
    ratio: 10.00,
    alarmPressure: 4.50,
    scaleCorrection: 2.00,
    gluePosition: 10,
    language: 'English',
    userPassword: '123456',
    engineerPassword: '••••••••',
    vendorPassword: '••••••••'
  });

  const [originalSettings, setOriginalSettings] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('parameters');
  const [hasChanges, setHasChanges] = useState(false);

  const adjustValue = (key: keyof typeof settings, direction: 'up' | 'down', step = 0.1) => {
    const currentValue = settings[key];
    if (typeof currentValue === 'number') {
      const newValue = Math.max(0, currentValue + (direction === 'up' ? step : -step));
      
      showConfirmation({
        title: 'PARAMETER CHANGE',
        message: `Change ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} from ${currentValue.toFixed(2)} to ${newValue.toFixed(2)}?`,
        onConfirm: () => {
          setSettings(prev => ({
            ...prev,
            [key]: newValue
          }));
          setHasChanges(true);
          hideConfirmation();
        },
        variant: 'info',
        timeout: 8
      });
    }
  };

  const saveSettings = () => {
    showConfirmation({
      title: 'SAVE SETTINGS',
      message: 'Save all parameter changes? This will update system configuration and may affect operation.',
      onConfirm: () => {
        setOriginalSettings({ ...settings });
        setHasChanges(false);
        console.log('Settings saved:', settings);
        hideConfirmation();
      },
      variant: 'warning',
      timeout: 10
    });
  };

  const resetSettings = () => {
    showConfirmation({
      title: 'RESET CHANGES',
      message: 'Discard all unsaved changes and revert to previous settings?',
      onConfirm: () => {
        setSettings({ ...originalSettings });
        setHasChanges(false);
        hideConfirmation();
      },
      variant: 'info',
      timeout: 8
    });
  };

  const restoreDefaults = () => {
    showConfirmation({
      title: 'RESTORE DEFAULTS',
      message: 'Reset ALL settings to factory defaults? This will overwrite current configuration and cannot be undone.',
      onConfirm: () => {
        const defaults = {
          ratio: 10.00,
          alarmPressure: 4.50,
          scaleCorrection: 2.00,
          gluePosition: 10,
          language: 'English',
          userPassword: '123456',
          engineerPassword: '••••••••',
          vendorPassword: '••••••••'
        };
        setSettings(defaults);
        setHasChanges(true);
        hideConfirmation();
      },
      variant: 'danger',
      timeout: 15
    });
  };

  const renderParameters = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Ratio(A:B)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustValue('ratio', 'down', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Minus className="w-2 h-2 text-white" />
          </button>
          <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[3rem] text-center">
            {settings.ratio.toFixed(2)}:1
          </span>
          <button
            onClick={() => adjustValue('ratio', 'up', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Plus className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Alarm pressure(Mpa)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustValue('alarmPressure', 'down', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Minus className="w-2 h-2 text-white" />
          </button>
          <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[3rem] text-center">
            {settings.alarmPressure.toFixed(2)}
          </span>
          <button
            onClick={() => adjustValue('alarmPressure', 'up', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Plus className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Scale correction(mm)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustValue('scaleCorrection', 'down', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Minus className="w-2 h-2 text-white" />
          </button>
          <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[3rem] text-center">
            {settings.scaleCorrection.toFixed(2)}
          </span>
          <button
            onClick={() => adjustValue('scaleCorrection', 'up', 0.1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Plus className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Glue position diff(mm)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustValue('gluePosition', 'down', 1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Minus className="w-2 h-2 text-white" />
          </button>
          <span className="text-xs font-mono text-white bg-blue-800 px-2 py-1 rounded min-w-[3rem] text-center">
            {settings.gluePosition}
          </span>
          <button
            onClick={() => adjustValue('gluePosition', 'up', 1)}
            className="w-4 h-4 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center"
          >
            <Plus className="w-2 h-2 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Language</span>
        <button
          onClick={() => {
            const languages = ['English', 'Chinese', 'German', 'Spanish'];
            const currentIndex = languages.indexOf(settings.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            const newLang = languages[nextIndex];
            
            showConfirmation({
              title: 'CHANGE LANGUAGE',
              message: `Change interface language from ${settings.language} to ${newLang}? Interface will restart.`,
              onConfirm: () => {
                setSettings(prev => ({ ...prev, language: newLang }));
                setHasChanges(true);
                hideConfirmation();
              },
              variant: 'info',
              timeout: 10
            });
          }}
          className="text-white bg-blue-800 px-2 py-1 rounded hover:bg-blue-700 text-xs"
        >
          {settings.language}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Restore defaults</span>
        <button
          onClick={restoreDefaults}
          className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs border border-red-500"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
          <AlertTriangle className="w-2 h-2" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">User password</span>
        <div className="text-white bg-blue-800 px-2 py-1 rounded flex items-center gap-1 text-xs">
          {settings.userPassword}
          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Engineer password</span>
        <div className="text-white bg-blue-800 px-2 py-1 rounded text-xs">
          {settings.engineerPassword}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs">Vendor Password</span>
        <div className="text-white bg-blue-800 px-2 py-1 rounded text-xs">
          {settings.vendorPassword}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-2">
      <div className="bg-blue-700/50 rounded border border-blue-500 p-2 h-full flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex mb-2 bg-blue-800/50 rounded p-0.5">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-all ${
              activeTab === 'parameters'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Parameters
            {hasChanges && activeTab === 'parameters' && <AlertTriangle className="w-2 h-2 ml-1 inline" />}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Security
            {hasChanges && activeTab === 'security' && <AlertTriangle className="w-2 h-2 ml-1 inline" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'parameters' ? renderParameters() : renderSecurity()}
        </div>

        {/* Control Buttons */}
        {hasChanges && (
          <div className="mt-2 pt-2 border-t border-blue-600 flex gap-2">
            <button
              onClick={saveSettings}
              className="flex-1 h-6 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1 border border-green-500"
            >
              <Save className="w-3 h-3" />
              Save
              <span className="text-xs">[!]</span>
            </button>
            <button
              onClick={resetSettings}
              className="flex-1 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}