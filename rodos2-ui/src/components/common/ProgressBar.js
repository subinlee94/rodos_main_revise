import React from 'react';
import '../../styles/common/ProgressBar.css';

function ProgressBar({
    progress = 0,
    status = 'idle',
    moduleName = '',
    showPercentage = true,
    size = 'medium',
    animated = true,
    error = null,
    onErrorClick = null
}) {
    const getStatusClass = () => {
        switch (status) {
            case 'idle': return 'progress-idle';
            case 'running': return 'progress-running';
            case 'success': return 'progress-success';
            case 'error': return 'progress-error';
            case 'warning': return 'progress-warning';
            default: return 'progress-idle';
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small': return 'progress-small';
            case 'medium': return 'progress-medium';
            case 'large': return 'progress-large';
            default: return 'progress-medium';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            case 'running': return '⟳';
            default: return '';
        }
    };

    const handleErrorClick = () => {
        if (status === 'error' && error && onErrorClick) {
            onErrorClick(error);
        }
    };

    return (
        <div className={`progress-container ${getSizeClass()}`}>
            {moduleName && (
                <div className="progress-label">
                    <span className="progress-module-name">{moduleName}</span>
                    {showPercentage && (
                        <span className="progress-percentage">
                            {status === 'running' ? `${Math.round(progress)}%` : getStatusIcon()}
                        </span>
                    )}
                </div>
            )}
            <div
                className={`progress-bar ${getStatusClass()} ${animated ? 'animated' : ''} ${status === 'error' ? 'clickable' : ''}`}
                onClick={handleErrorClick}
                title={status === 'error' && error ? '클릭하여 에러 상세 정보 보기' : ''}
            >
                <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {status === 'error' && (
                <div className="progress-error-message">
                    {error ? '클릭하여 에러 상세 정보 보기' : '실행 중 오류가 발생했습니다'}
                </div>
            )}
        </div>
    );
}

export default ProgressBar;
