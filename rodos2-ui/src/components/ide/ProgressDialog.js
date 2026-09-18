import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    MdCheckCircle,
    MdError,
    MdPlayArrow,
    MdStop,
    MdInfo,
    MdClose
} from 'react-icons/md';
import { useModuleProgress } from '../../hooks/useModuleProgress';
import '../../styles/ide/ProgressDialog.css';

const ProgressDialog = ({
    open,
    onClose,
    taskType = 'execute',
    onTaskComplete
}) => {
    const {
        overallProgress,
        moduleProgress,
        isRunning,
        startOverallOperation,
        resetProgress
    } = useModuleProgress();

    const [taskCompleted, setTaskCompleted] = useState(false);
    const [errorDialog, setErrorDialog] = useState({ open: false, error: null });

    // Task type에 따른 설정
    const getTaskConfig = () => {
        switch (taskType) {
            case 'execute':
                return { title: 'Execute Progress', icon: <MdPlayArrow />, color: '#4caf50' };
            case 'deploy':
                return { title: 'Deploy Progress', icon: <MdStop />, color: '#2196f3' };
            case 'stop':
                return { title: 'Stop Progress', icon: <MdStop />, color: '#ff9800' };
            default:
                return { title: 'Task Progress', icon: <MdInfo />, color: '#9e9e9e' };
        }
    };

    const config = getTaskConfig();

    // Dialog가 열릴 때 Progress 시작
    useEffect(() => {
        console.log('=== ProgressDialog useEffect ===');
        console.log('open:', open);
        console.log('taskType:', taskType);

        if (open) {
            console.log('ProgressDialog가 열렸습니다. 작업을 시작합니다.');
            resetProgress();
            setTaskCompleted(false);
            startOverallOperation(taskType);
        }
    }, [open, taskType, startOverallOperation, resetProgress]);

    // 전체 작업 완료 체크
    useEffect(() => {
        if (Object.keys(moduleProgress).length > 0) {
            const allCompleted = Object.values(moduleProgress).every(
                progress => progress.status === 'completed' || progress.status === 'error'
            );

            if (allCompleted && !taskCompleted) {
                console.log('모든 작업 완료됨:', moduleProgress);
                setTaskCompleted(true);
                if (onTaskComplete) {
                    onTaskComplete(moduleProgress);
                }
            }
        }
    }, [moduleProgress, taskCompleted, onTaskComplete]);

    const handleClose = () => {
        if (taskCompleted) {
            onClose();
        }
    };

    const handleErrorClick = (error) => {
        setErrorDialog({ open: true, error });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <MdCheckCircle style={{ color: '#4caf50', fontSize: '20px' }} />;
            case 'error':
                return <MdError style={{ color: '#f44336', fontSize: '20px' }} />;
            case 'running':
                return <CircularProgress size={20} />;
            default:
                return <MdInfo style={{ color: '#9e9e9e', fontSize: '20px' }} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Success';
            case 'error':
                return 'Failed';
            case 'running':
                return 'Running...';
            default:
                return 'Pending';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#4caf50';
            case 'error':
                return '#f44336';
            case 'running':
                return '#2196f3';
            default:
                return '#9e9e9e';
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                className="progress-dialog"
            >
                <DialogTitle className="progress-dialog-title">
                    <Box display="flex" alignItems="center" gap={1}>
                        <span className="task-icon" style={{ color: config.color }}>
                            {config.icon}
                        </span>
                        <Typography variant="h6" style={{ fontSize: '16px', fontWeight: '600' }}>
                            {config.title}
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent className="progress-dialog-content">
                    {/* Overall Progress */}
                    <Box mb={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" style={{ fontSize: '13px', fontWeight: '500' }}>
                                Overall Progress
                            </Typography>
                            <Typography variant="body2" style={{ fontSize: '13px', color: '#6c757d' }}>
                                {overallProgress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={overallProgress}
                            className="overall-progress-bar"
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#e1e1e1',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: config.color,
                                    borderRadius: 4
                                }
                            }}
                        />
                    </Box>

                    {/* Module Progress Table */}
                    <Box className="module-progress-table">
                        <Box className="table-header">
                            <Typography variant="subtitle2" style={{ fontSize: '13px', fontWeight: '600' }}>
                                Module Name
                            </Typography>
                            <Typography variant="subtitle2" style={{ fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                                Status
                            </Typography>
                            <Typography variant="subtitle2" style={{ fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>
                                Container / Message
                            </Typography>
                        </Box>

                        <Box className="table-body">
                            {Object.entries(moduleProgress).map(([moduleId, progress]) => (
                                <Box key={moduleId} className="table-row">
                                    <Box className="cell module-name-cell">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {getStatusIcon(progress.status)}
                                            <Typography variant="body2" style={{ fontSize: '13px' }}>
                                                {progress.moduleName || moduleId}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box className="cell status-cell">
                                        <Chip
                                            label={getStatusText(progress.status)}
                                            size="small"
                                            style={{
                                                backgroundColor: getStatusColor(progress.status),
                                                color: 'white',
                                                fontWeight: '500',
                                                fontSize: '11px',
                                                height: '24px'
                                            }}
                                        />
                                    </Box>

                                    <Box className="cell message-cell">
                                        {progress.status === 'completed' && (
                                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                                                <Typography variant="body2" style={{ fontSize: '12px', color: '#28a745', fontWeight: '500' }}>
                                                    {progress.message || 'Success'}
                                                </Typography>
                                                {progress.containerName && (
                                                    <Typography variant="caption" style={{ fontSize: '11px', color: '#6c757d' }}>
                                                        Container: {progress.containerName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                        {progress.status === 'error' && (
                                            <button
                                                className="error-button"
                                                onClick={() => handleErrorClick(progress.error)}
                                            >
                                                View Error
                                            </button>
                                        )}
                                        {progress.status === 'running' && (
                                            <Typography variant="body2" style={{ fontSize: '13px', color: '#6c757d' }}>
                                                Running...
                                            </Typography>
                                        )}
                                        {progress.status === 'pending' && (
                                            <Typography variant="body2" style={{ fontSize: '13px', color: '#6c757d' }}>
                                                Pending
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Task Summary */}
                    {taskCompleted && (
                        <Box className="task-summary">
                            <Typography variant="h6" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                                Task Summary
                            </Typography>

                            {/* 전체 성공/실패 메시지 */}
                            {Object.values(moduleProgress).some(p => p.status === 'completed') && (
                                <Box display="flex" alignItems="center" gap={1} marginBottom={2}>
                                    <MdCheckCircle style={{ color: '#28a745', fontSize: '18px' }} />
                                    <Typography variant="body2" style={{ fontSize: '13px', color: '#28a745', fontWeight: '500' }}>
                                        {Object.values(moduleProgress).find(p => p.status === 'completed')?.message || 'Container deployment successful'}
                                    </Typography>
                                </Box>
                            )}

                            <Box display="flex" gap={1}>
                                <Chip
                                    icon={<MdCheckCircle />}
                                    label={`${Object.values(moduleProgress).filter(p => p.status === 'completed').length} Completed`}
                                    style={{
                                        backgroundColor: '#d4edda',
                                        color: '#155724',
                                        border: '1px solid #c3e6cb',
                                        fontSize: '11px',
                                        height: '24px'
                                    }}
                                />
                                <Chip
                                    icon={<MdError />}
                                    label={`${Object.values(moduleProgress).filter(p => p.status === 'error').length} Failed`}
                                    style={{
                                        backgroundColor: '#f8d7da',
                                        color: '#721c24',
                                        border: '1px solid #f5c6cb',
                                        fontSize: '11px',
                                        height: '24px'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions className="progress-dialog-actions">
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        disabled={!taskCompleted}
                        style={{
                            backgroundColor: taskCompleted ? '#0078d4' : '#6c757d',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            textTransform: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px'
                        }}
                    >
                        {taskCompleted ? 'Finish' : 'Processing...'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Detail Dialog */}
            <Dialog
                open={errorDialog.open}
                onClose={() => setErrorDialog({ open: false, error: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <MdError color="#f44336" />
                        <Typography variant="h6">Error Details</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                        {errorDialog.error || 'No error details available'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setErrorDialog({ open: false, error: null })}
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProgressDialog;