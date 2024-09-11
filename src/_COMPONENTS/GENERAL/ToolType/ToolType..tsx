import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // Assurez-vous d'importer votre icône correctement

interface TooltipProps {
    tooltipText: ReactNode;
    mainText: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ tooltipText, mainText }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});


    const updateTooltipPosition = () => {
        const tooltipElement = tooltipRef.current;
        if (tooltipElement) {
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const tooltipWidth = tooltipRect.width;
            const tooltipHeight = tooltipRect.height;

            let newStyles: React.CSSProperties = {
                left: '50%',
                transform: 'translateX(-50%)',
                top: '100%', // Position tooltip below the icon
            };

            if (tooltipRect.left < 0) {
                newStyles.left = '0';
                newStyles.transform = 'translateX(0)';
            } else if (tooltipRect.right + (tooltipWidth / 2) > viewportWidth - 10) {
                newStyles.left = `calc(100% - ${tooltipWidth}px)`; //centre le tooltype
                newStyles.transform = 'translateX(0)';
            }

            if (tooltipRect.bottom > viewportHeight) {
                newStyles.top = `-${tooltipHeight + 10}px`; // 10px is margin from the top
            }

            console.log("----trigegred----");
            console.log("window.scrollX", window.scrollX);
            console.log("window.scrollY", window.scrollY);
            console.log("tooltipRect", tooltipRect);
            console.log("viewportWidth", viewportWidth);
            setTooltipStyles(newStyles);
        }
    };

    useEffect(() => {
        // Update tooltip position on component mount and window resize
        updateTooltipPosition();
        window.addEventListener('resize', updateTooltipPosition);
        return () => {
            window.removeEventListener('resize', updateTooltipPosition);
        };
    }, []);

    // Re-calculate tooltip position if tooltipRef changes
    useEffect(() => {
        updateTooltipPosition();
    }, [tooltipRef.current]);

    return (
        <div className="relative flex items-center space-x-2">
            <span>{mainText}</span>
            <div className="relative group">
                <InformationCircleIcon className="text-gray-600" width={22} />
                <div
                    ref={tooltipRef}
                    className="pointer-events-none absolute mt-2 w-64 bg-black text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50"
                    style={tooltipStyles}
                >
                    <div className="px-3 py-2 text-xs">
                        {tooltipText}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tooltip;
