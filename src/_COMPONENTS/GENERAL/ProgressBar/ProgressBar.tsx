import './ProgressBar.css'; // On utilisera un fichier CSS séparé pour gérer le style

type ProgressBarProps = {
    completed: number;
    running: boolean;
};

export default function ProgressBar({ completed, running }: ProgressBarProps) {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar">
                <div
                    className="bg-pipedrive progress-fill"
                    style={{ width: `${completed}%` }}
                >
                    <span className="px-2 progress-text">{`${completed}%`}</span>
                    {completed < 100 && running ? <div className="highlight"></div> : null}
                </div>
            </div>
        </div>
    );
};
