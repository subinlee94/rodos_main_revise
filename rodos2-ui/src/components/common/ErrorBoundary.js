import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // 에러 로깅
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // 페이지 새로고침
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
                        ⚠️ Something went wrong
                    </h2>
                    <p style={{ color: '#6c757d', marginBottom: '30px' }}>
                        An unexpected error occurred. This might be due to a page refresh or network issue.
                    </p>
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginRight: '10px'
                            }}
                        >
                            🔄 Retry
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            🏠 Go Home
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
                            <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
                                Error Details (Development)
                            </summary>
                            <pre style={{
                                backgroundColor: '#f8f9fa',
                                padding: '10px',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '12px',
                                color: '#dc3545'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
