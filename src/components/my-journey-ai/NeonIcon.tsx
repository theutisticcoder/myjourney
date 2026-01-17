import { cn } from '@/lib/utils';

export const NeonIcon = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'text-primary [filter:drop-shadow(0_0_2px_hsl(var(--primary)))_drop-shadow(0_0_5px_hsl(var(--primary)))]',
        className
      )}
    >
      {children}
    </div>
  );
};
