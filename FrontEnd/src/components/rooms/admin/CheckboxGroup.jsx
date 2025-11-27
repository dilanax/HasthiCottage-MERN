import React from 'react';

const CheckboxGroup = ({ 
  title, 
  description, 
  icon: Icon, 
  items, 
  values, 
  onChange, 
  enabled, 
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-yellow-600" />}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      
      <div className={!enabled ? 'opacity-60 pointer-events-none' : ''}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(({ key, label, icon: ItemIcon, description: itemDescription }) => (
            <label 
              key={key} 
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <input
                type="checkbox"
                name={`${key}`}
                checked={!!values[key]}
                onChange={onChange}
                disabled={!enabled}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {ItemIcon && <ItemIcon className="w-4 h-4 text-gray-600" />}
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </div>
                {itemDescription && (
                  <p className="text-xs text-gray-500 mt-1">{itemDescription}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckboxGroup;
