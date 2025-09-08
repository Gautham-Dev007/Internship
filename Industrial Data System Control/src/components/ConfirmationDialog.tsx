import { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Clock } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  timeout?: number; // Auto-cancel after timeout (seconds)
  variant?: 'warning' | 'danger' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  onConfirm,
  onCancel,
  timeout = 10,
  variant = 'warning'
}: ConfirmationDialogProps) {
  const [timeLeft, setTimeLeft] = useState(timeout);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(timeout);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onCancel(); // Auto-cancel when timeout reaches 0
          return timeout;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeout, onCancel]);

  if (!isOpen) return null;

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: 'bg-red-900/95',
          border: 'border-red-600',
          icon: 'text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          cancelBg: 'bg-gray-600 hover:bg-gray-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/95',
          border: 'border-yellow-600',
          icon: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          cancelBg: 'bg-gray-600 hover:bg-gray-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-900/95',
          border: 'border-blue-600',
          icon: 'text-blue-400',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          cancelBg: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 w-[260px] mx-2`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />
          <span className="text-white font-bold text-xs">{title}</span>
          <div className="ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">{timeLeft}s</span>
          </div>
        </div>

        {/* Message */}
        <div className="text-white text-xs mb-3 leading-relaxed">
          {message}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={`flex-1 h-6 ${colors.cancelBg} text-white rounded text-xs font-bold flex items-center justify-center gap-1 transition-all`}
          >
            <X className="w-3 h-3" />
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-6 ${colors.confirmBg} text-white rounded text-xs font-bold flex items-center justify-center gap-1 transition-all`}
          >
            <Check className="w-3 h-3" />
            {confirmText}
          </button>
        </div>

        {/* Progress bar showing timeout */}
        <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
          <div 
            className="bg-gray-400 h-1 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / timeout) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}