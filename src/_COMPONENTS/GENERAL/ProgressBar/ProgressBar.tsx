import './ProgressBar.css'; // On utilisera un fichier CSS séparé pour gérer le style

type ProgressBarProps = {
    completed: number;
};

export default function ProgressBar({ completed }: ProgressBarProps) {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${completed}%` }}
                >
                    <span className="progress-text px-4">{`${completed}%`}</span>
                    {completed < 100 ? <div className="highlight"></div> : null}
                </div>
            </div>
        </div>
    );
};
