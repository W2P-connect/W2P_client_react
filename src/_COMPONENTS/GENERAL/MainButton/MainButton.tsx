import { classNames } from 'helpers';
import { ReactNode, MouseEvent } from 'react'

interface MainButtonProps {
    children: ReactNode;
    type?: "submit" | "button" | "reset" | undefined
    className?: string
    style?: number
    loading?: boolean
    disabled?: boolean
    onClick?: (event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * 
 * @param children,
    @param type ex:'submit',
    @param className default'',
    @param style button style between 1 and 4. default 1,
    @param loading = false,
    @param disabled = false,
    @param onClick 
 * @returns ReactNode 
 */

export default function MainButton({
    children,
    type = 'submit',
    className = '',
    style = 1,
    loading = false,
    disabled = false,
    onClick
}: MainButtonProps) {

    const getClasseFromStyle = (style: number) => {
        switch (style) {
            case 1:
                return "bg-pipedrive border-2 border-pipedrive text-white"
            case 2:
                return "bg-woocommerce border-2 border-woocommerce text-white"
            case 3:
                return "!text-darkPurple bg-white border-2 border-darkPurple"
            case 4:
                return "bg-white border-2 border-pipedrive text-pipedrive";
            default:
                return ""
        }
    }

    let defaultClassName = "rounded-[4px] px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold block text-center"
    defaultClassName += " relative transform hover:shadow-inner-md hover:scale-[0.98] active:scale-95 active:shadow-inner transition-scale duration-200"


    return (
        <button
            type={type}
            className={classNames('rounded-md px-3.5 py-2.5 text-sm font-semibold text-white block text-center',
                'duration-150 transition-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ',
                getClasseFromStyle(style),
                loading ? 'cursor-wait' : '',
                disabled ? 'opacity-90 cursor-not-allowed' : '',
                className
            )}
            disabled={disabled || loading}
            onClick={e => onClick && onClick(e)}
        >
            {children}
        </button>
    )
}
