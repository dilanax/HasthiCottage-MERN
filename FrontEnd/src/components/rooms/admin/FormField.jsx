import React from 'react';
import { Pencil } from 'lucide-react';

const FormField = ({ 
  label, 
  enabled, 
  onEnable, 
  required = false, 
  description,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700 flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {!enabled && (
          <button
            type="button"
            onClick={onEnable}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            title="Enable editing"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      <div className={!enabled ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

export default FormField;
