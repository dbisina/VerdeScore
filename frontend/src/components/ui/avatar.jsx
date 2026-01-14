'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const avatarStatusVariants = cva('flex items-center rounded-full size-2 border-2 border-background', {
    variants: {
        variant: {
            online: 'bg-green-600',
            offline: 'bg-zinc-600 dark:bg-zinc-300',
            busy: 'bg-yellow-600',
            away: 'bg-blue-600',
        },
    },
    defaultVariants: {
        variant: 'online',
    },
});

function Avatar({ className, ...props }) {
    return (
        <AvatarPrimitive.Root data-slot="avatar" className={cn('relative flex shrink-0 size-10', className)} {...props} />
    );
}

function AvatarImage({ className, ...props }) {
    return (
        <div className={cn('relative overflow-hidden rounded-full font-sans', className)}>
            <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square h-full w-full object-cover')} {...props} />
        </div>
    );
}

function AvatarFallback({ className, ...props }) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full border border-border bg-muted text-muted-foreground text-xs font-sans',
                className,
            )}
            {...props}
        />
    );
}

function AvatarIndicator({ className, ...props }) {
    return (
        <div
            data-slot="avatar-indicator"
            className={cn('absolute flex size-6 items-center justify-center', className)}
            {...props}
        />
    );
}

function AvatarStatus({
    className,
    variant,
    ...props
}) {
    return <div data-slot="avatar-status" className={cn(avatarStatusVariants({ variant }), className)} {...props} />;
}

export { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus, avatarStatusVariants };
