import { cn } from '@/lib/utils';

interface OperatorAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Shows operator hero image or styled initials placeholder if no image.
 * Prevents broken/empty images across admin and tourist sites.
 */
export function OperatorAvatar({ name, imageUrl, size = 'md', className }: OperatorAvatarProps) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

    const sizeClasses = {
        sm: 'w-10 h-10 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-20 h-20 text-xl',
    };

    const hasValidImage = imageUrl &&
        imageUrl.length > 0 &&
        !imageUrl.startsWith('/images/') &&
        (imageUrl.startsWith('https://') || imageUrl.startsWith('http://'));

    if (hasValidImage) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={imageUrl}
                alt={name}
                className={cn(
                    'rounded-lg object-cover border border-slate-800',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-lg flex items-center justify-center font-bold text-white select-none',
                sizeClasses[size],
                className
            )}
            style={{ backgroundColor: '#2D6A4F' }}
            title={name}
        >
            {initials || '?'}
        </div>
    );
}
