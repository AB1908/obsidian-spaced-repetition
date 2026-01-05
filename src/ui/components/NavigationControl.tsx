import React, { useEffect, useRef } from 'react';
import { setIcon } from 'src/infrastructure/obsidian-facade';
import { Icon } from 'src/types/obsidian-icons';

interface NavigationControlProps {
    onClick: () => void;
    isDisabled: boolean;
    direction: 'previous' | 'next';
    className?: string;
    navigationKey?: string | number;
}

const NavigationControl: React.FC<NavigationControlProps> = ({
    onClick,
    isDisabled,
    direction,
    className = "annotation-nav is-clickable",
    navigationKey,
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const icon: Icon = direction === 'previous' ? 'chevron-left' : 'chevron-right';

    useEffect(() => {
        if (buttonRef.current) {
            setIcon(buttonRef.current, icon);
        }
    }, [icon, navigationKey]);

    if (isDisabled) {
        return <div className="annotation-nav"></div>; // Placeholder to maintain layout
    }

    return (
        <div className={className} onClick={onClick}>
            <div ref={buttonRef}></div>
        </div>
    );
};

export default NavigationControl;
