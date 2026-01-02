import React, { useMemo } from 'react';
import { annotation } from 'src/data/models/annotations';
import { integerToRGBA } from 'src/utils/utils';

interface ColorFilterProps {
    annotations: annotation[];
    selectedColor: string | null;
    onColorSelect: (color: string | null) => void;
}

export function ColorFilter({ annotations, selectedColor, onColorSelect }: ColorFilterProps) {
    const uniqueColors = useMemo(() => {
        const colors = new Set<string>();
        annotations.forEach(ann => {
            if (ann.originalColor) {
                colors.add(ann.originalColor);
            }
        });
        return Array.from(colors);
    }, [annotations]);

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>Filter by color:</span>
            {uniqueColors.map(color => {
                const rgba = integerToRGBA(parseInt(color, 10));
                return (
                    <div
                        key={color}
                        onClick={() => onColorSelect(selectedColor === color ? null : color)}
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: rgba,
                            border: selectedColor === color ? '2px solid var(--text-normal)' : '1px solid var(--background-modifier-border)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                        }}
                        title={`Filter by color: ${rgba}`}
                    />
                );
            })}
        </div>
    );
}
