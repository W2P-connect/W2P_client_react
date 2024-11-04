import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // Assurez-vous d'importer votre icône correctement
import { classNames } from 'helpers';
import { InformationCircleIcon as InformationCircleIconSolid } from '@heroicons/react/20/solid';

interface TooltipProps {
    tooltipText: ReactNode;
    mainText: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ tooltipText, mainText }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null); // Référence pour l'icône
    const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
    const [show, setShow] = useState<boolean>(false);

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
                newStyles.left = `calc(100% - ${tooltipWidth}px)`; //centre le tooltip
                newStyles.transform = 'translateX(0)';
            }

            if (tooltipRect.bottom > viewportHeight) {
                newStyles.top = `-${tooltipHeight + 10}px`; // 10px is margin from the top
            }
            setTooltipStyles(newStyles);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            tooltipRef.current &&
            !tooltipRef.current.contains(event.target as Node) && // Si le clic n'est pas sur le tooltip
            iconRef.current &&
            !iconRef.current.contains(event.target as Node) // Si le clic n'est pas sur l'icône
        ) {
            setShow(false); // Masquer le tooltip
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        updateTooltipPosition();
        window.addEventListener('resize', updateTooltipPosition);
        return () => {
            window.removeEventListener('resize', updateTooltipPosition);
        };
    }, []);

    useEffect(() => {
        updateTooltipPosition();
    }, [tooltipRef.current]);

    const handleToolTypeClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setShow((prv) => !prv)
    }
    return (
        <div className="relative flex items-center space-x-2">
            <span>{mainText}</span>
            <div className="relative" ref={iconRef}> {/* Ajout de la référence à l'icône */}
                <div onClick={(e) => handleToolTypeClick(e)}>
                    {show
                        ? <InformationCircleIconSolid className="text-secondary" width={22} />
                        : <InformationCircleIcon className="text-gray-600" width={22} />
                    }
                </div>
                <div
                    ref={tooltipRef}
                    className={classNames(
                        "absolute mt-2 max-w-96 !min-w-72 bg-black text-white text-sm rounded-lg shadow-lg transition-opacity duration-300 z-50",
                        show ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 invisible pointer-events-none"
                    )}

                    style={tooltipStyles}
                >
                    <div className="px-3 py-2 text-xs">{tooltipText}</div>
                </div>
            </div>
        </div>
    );
};

export default Tooltip;
