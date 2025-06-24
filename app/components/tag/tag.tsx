interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium';
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  size = 'medium',
  className,
}: TagProps) {
  const baseClasses =
    'inline-flex items-center rounded-full font-medium transition-colors';
  const variantClasses = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    primary: 'bg-purple-900/30 text-purple-300 border border-purple-700/50',
    secondary: 'bg-pink-900/30 text-pink-300 border border-pink-700/50',
  };
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}
    >
      {children}
    </span>
  );
}
