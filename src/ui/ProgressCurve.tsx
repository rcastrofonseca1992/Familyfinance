import React from 'react';

export const ProgressCurve = ({ progress }: { progress: number }) => {
    const clamped = Math.min(100, Math.max(0, progress));
    
    return (
        <svg viewBox="0 0 100 40" className="w-full h-20 opacity-50" preserveAspectRatio="none">
            <path d="M0,40 Q50,40 100,20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/20" />
            <path 
                d={`M0,40 Q${clamped/2},40 ${clamped},${40 - (clamped * 0.4)}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                className="text-primary"
                strokeLinecap="round"
            />
        </svg>
    );
};
