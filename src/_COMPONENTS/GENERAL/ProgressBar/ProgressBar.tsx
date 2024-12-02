import './ProgressBar.css'; // On utilisera un fichier CSS séparé pour gérer le style

type ProgressBarProps = {
    completed: number;
};

export default function ProgressBar({ completed }: ProgressBarProps) {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div
                    className="bg-pipedrive progress-fill"
                    style={{ width: `${completed}%` }}
                >
                    <span className="px-2 progress-text">{`${completed}%`}</span>
                    {completed < 100 ? <div className="highlight"></div> : null}
                </div>
            </div>
        </div>
    );
};
