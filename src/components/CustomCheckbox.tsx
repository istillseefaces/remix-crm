import React from 'react';
import { Check, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface CustomCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  id,
  className = '',
  ariaLabel,
  size = 'md',
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5 rounded',
    md: 'w-4 h-4 rounded-md',
    lg: 'w-5 h-5 rounded-lg',
  }[size];

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled && onChange) {
      e.preventDefault();
      e.stopPropagation();
      onChange(!checked);
    }
  };

  const isCheckedOrIndeterminate = checked || indeterminate;

  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      className={`
        relative inline-flex items-center justify-center shrink-0 select-none cursor-pointer
        transition-all duration-150 focus:outline-none active:opacity-80
        ${sizeClasses}
        ${
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : isCheckedOrIndeterminate
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
            : isLight
            ? 'bg-black/[0.02] border border-black/20 hover:border-black/40 hover:bg-black/[0.04]'
            : 'bg-white/[0.03] border border-white/20 hover:border-white/40 hover:bg-white/[0.06]'
        }
        ${className}
      `}
    >
      {checked && !indeterminate && (
        <Check className={`${iconSizes} stroke-[3] text-white animate-in zoom-in-50 duration-150`} />
      )}
      {indeterminate && (
        <Minus className={`${iconSizes} stroke-[3] text-white animate-in zoom-in-50 duration-150`} />
      )}
    </button>
  );
};
