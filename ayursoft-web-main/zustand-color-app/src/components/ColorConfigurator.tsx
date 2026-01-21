import React, { useEffect } from 'react';
import { useColorStore } from '../store/colorStore';

const ColorConfigurator: React.FC = () => {
    const { colors, fetchColors, selectedColor, setSelectedColor } = useColorStore();

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    return (
        <div>
            <h1>Color Configurator</h1>
            <div>
                {colors.map(color => (
                    <div key={color.id} style={{ margin: '10px' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: color.hex,
                                cursor: 'pointer',
                                border: selectedColor?.id === color.id ? '2px solid black' : 'none'
                            }}
                            onClick={() => setSelectedColor(color)}
                        />
                        <span>{color.name}</span>
                    </div>
                ))}
            </div>
            {selectedColor && (
                <div>
                    <h2>Selected Color</h2>
                    <div style={{ width: '100px', height: '100px', backgroundColor: selectedColor.hex }} />
                    <p>{selectedColor.name}</p>
                </div>
            )}
        </div>
    );
};

export default ColorConfigurator;