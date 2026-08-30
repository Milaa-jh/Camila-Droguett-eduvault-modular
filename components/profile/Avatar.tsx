import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, url, size = 64, className }: AvatarProps) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700',
        className
      )}
    >
      {getInitials(name) || '?'}
    </div>
  );
}
