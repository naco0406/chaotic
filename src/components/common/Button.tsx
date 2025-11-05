import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, FC, ReactNode } from 'react';

type MotionButtonProps = Omit<ComponentProps<typeof motion.button>, 'ref'>;

interface ButtonProps extends MotionButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'font-quicksand font-semibold rounded-full transition-all duration-200 flex items-center gap-2 justify-center shadow-lg';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-lime-300 via-emerald-300 to-sky-300 text-slate-900 hover:from-lime-200 hover:via-cyan-200 hover:to-sky-200 cute-shadow hover:cute-shadow-hover',
    secondary:
      'bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {children}
    </motion.button>
  );
};
