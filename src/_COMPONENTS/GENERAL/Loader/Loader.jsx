import './loader.css'

export default function Loader({ className }) {
    return (
        <div className={`w2p-loader ${className ?? ''}`}>
            <svg viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    )
}
