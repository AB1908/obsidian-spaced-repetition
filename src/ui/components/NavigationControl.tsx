import React, { useEffect, useRef } from 'react';
import { setIcon } from 'src/infrastructure/obsidian-facade';
import { Icon } from 'src/types/obsidian-icons';

interface NavigationControlProps {
    onClick: () => void;
    isDisabled: boolean;
    icon: Icon;
    className?: string;
}

const NavigationControl: React.FC<NavigationControlProps> = ({
    onClick,
    isDisabled,
    icon,
    className = "annotation-nav is-clickable",
}) => {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (buttonRef.current) {
            setIcon(buttonRef.current, icon);
        }
    }, [icon]);

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
