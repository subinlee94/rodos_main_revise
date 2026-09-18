import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';
import {
    MdAdd,
    MdCheckCircle,
    MdCloudUpload,
    MdDelete,
    MdFolderOpen,
    MdLink,
    MdPlayArrow,
    MdRedo,
    MdSave, MdSaveAlt,
    MdSettings,
    MdStop,
    MdUndo,
    MdWarning
} from 'react-icons/md';
import { useMenuBoxState } from '../../hooks/useMenuBoxState';
import { useCanvasState } from '../../hooks/useCanvasState';
import { fileService } from '../../services/fileService';
import { validationService } from '../../services/validationService';
import '../../styles/ide/MenuBox.css';
import HwMappingDialog from './HwMappingDialog';
import SimulationDialog from './SimulationDialog';
import FileDialog from './FileDialog';
import ProgressDialog from './ProgressDialog';

function MenuBox() {
    const {
        isLoading,
        currentFile,
        hasUnsavedChanges,
        dialogOpen,
        dialogContent,
        closeDialog,
        handleNew,
        handleOpen,
        handleSave,
        handleSaveAs,
        handleUndo,
        handleRedo,
        handleLink,
        handleDelete,
        handleValidationCheck,
        handleMappingWithHW,
        handleMappingWithSimulation,
        handleStop,
        handleDeploy,
        handleExecute
    } = useMenuBoxState();

    // Progress Dialog state
    const [progressDialogOpen, setProgressDialogOpen] = useState(false);
    const [progressDialogType, setProgressDialogType] = useState('execute');

    const {
        saveConfiguration,
        openConfiguration,
        newConfiguration
    } = useCanvasState();

    // 새로운 다이얼로그 상태
    const [hwMappingDialogOpen, setHwMappingDialogOpen] = useState(false);
    const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [fileDialogType, setFileDialogType] = useState('save');

    const handleSaveClick = async () => {
        setFileDialogType('save');
        setFileDialogOpen(true);
    };

    const handleSaveAsClick = () => {
        setFileDialogType('saveAs');
        setFileDialogOpen(true);
    };

    const handleOpenClick = () => {
        setFileDialogType('open');
        setFileDialogOpen(true);
    };

    const handleNewClick = async () => {
        try {
            if (window.confirm('Are you sure you want to create a new configuration? This will clear the current canvas.')) {
                await newConfiguration();
                alert('New configuration created successfully!');
            }
        } catch (error) {
            console.error('Failed to create new configuration:', error);
            alert('Failed to create new configuration: ' + error.message);
        }
    };

    const handleValidationClick = async () => {
        try {
            const currentFileData = fileService.getCurrentFile();
            if (currentFileData) {
                const validation = validationService.validateModuleData(currentFileData.content);
                if (validation.isValid) {
                    alert('✅ Validation passed!');
                } else {
                    alert(`❌ Validation failed:\n${validation.errors.join('\n')}`);
                }
            } else {
                alert('No file to validate');
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleMappingWithHWClick = () => {
        setHwMappingDialogOpen(true);
    };

    const handleMappingWithSimulationClick = () => {
        setSimulationDialogOpen(true);
    };

    const handleFileDialogConfirm = async (fileName) => {
        try {
            if (fileDialogType === 'save' || fileDialogType === 'saveAs') {
                await saveConfiguration(fileName);
                alert('Configuration saved successfully: ' + fileName);
            } else if (fileDialogType === 'open') {
                await openConfiguration(fileName);
                alert('Configuration opened successfully: ' + fileName);
            }
        } catch (error) {
            console.error('File operation failed:', error);
            alert('File operation failed: ' + error.message);
        }
    };

    return (
        <>
            <div className="menu-box">
                {/* File Operations */}
                <button
                    className={`menu-button menu-button--primary ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleNewClick}
                    disabled={isLoading}
                    title="Create new configuration"
                >
                    <span className="menu-button-icon">
                        <MdAdd />
                    </span>
                    <span className="menu-button-text">New</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleOpenClick}
                    disabled={isLoading}
                    title="Open existing configuration"
                >
                    <span className="menu-button-icon">
                        <MdFolderOpen />
                    </span>
                    <span className="menu-button-text">Open</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    title="Save current configuration"
                >
                    <span className="menu-button-icon">
                        <MdSave />
                    </span>
                    <span className="menu-button-text">Save</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleSaveAsClick}
                    disabled={isLoading}
                    title="Save as new configuration"
                >
                    <span className="menu-button-icon">
                        <MdSaveAlt />
                    </span>
                    <span className="menu-button-text">Save As</span>
                </button>

                {/* Divider */}
                <div className="menu-divider" />

                {/* Edit Operations */}
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleUndo}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdUndo />
                    </span>
                    <span className="menu-button-text">Undo</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleRedo}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdRedo />
                    </span>
                    <span className="menu-button-text">Redo</span>
                </button>

                {/* Divider */}
                <div className="menu-divider" />

                {/* Link & Delete */}
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleLink}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdLink />
                    </span>
                    <span className="menu-button-text">Link</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleDelete}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdDelete />
                    </span>
                    <span className="menu-button-text">Delete</span>
                </button>

                {/* Divider */}
                <div className="menu-divider" />

                {/* Validation & Mapping */}
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleValidationClick}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdCheckCircle />
                    </span>
                    <span className="menu-button-text">Validation Check</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleMappingWithHWClick}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdSettings />
                    </span>
                    <span className="menu-button-text">Mapping with HW</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={handleMappingWithSimulationClick}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdSettings />
                    </span>
                    <span className="menu-button-text">Mapping with Simulation</span>
                </button>

                {/* Divider */}
                <div className="menu-divider" />

                {/* Control Operations */}
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={() => {
                        setProgressDialogType('stop');
                        setProgressDialogOpen(true);
                    }}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdStop />
                    </span>
                    <span className="menu-button-text">Stop</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={() => {
                        setProgressDialogType('deploy');
                        setProgressDialogOpen(true);
                    }}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdCloudUpload />
                    </span>
                    <span className="menu-button-text">deploy</span>
                </button>
                <button
                    className={`menu-button ${isLoading ? 'menu-button--loading' : ''}`}
                    onClick={() => {
                        console.log('=== Execute 버튼 클릭됨 ===');
                        console.log('ProgressDialog 열기 시도');
                        setProgressDialogType('execute');
                        setProgressDialogOpen(true);
                        console.log('ProgressDialog 상태 변경 완료');
                    }}
                    disabled={isLoading}
                >
                    <span className="menu-button-icon">
                        <MdPlayArrow />
                    </span>
                    <span className="menu-button-text">Execute</span>
                </button>

                {/* Status Indicators */}
                {hasUnsavedChanges && (
                    <div className="unsaved-indicator">
                        <MdWarning />
                        <span>Unsaved changes</span>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <span>Processing...</span>
                    </div>
                )}
            </div>

            {/* 기존 간단한 다이얼로그 */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle className="menu-dialog-header">
                    <span className="menu-dialog-icon">{dialogContent.icon}</span>
                    <h3 className="menu-dialog-title">{dialogContent.title}</h3>
                </DialogTitle>
                <DialogContent>
                    <p className="menu-dialog-message">
                        {dialogContent.message}
                    </p>
                </DialogContent>
                <DialogActions className="menu-dialog-actions">
                    <Button
                        onClick={closeDialog}
                        variant="contained"
                        color="primary"
                        className="menu-dialog-button menu-dialog-button--primary"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* HW Mapping Dialog */}
            <HwMappingDialog
                open={hwMappingDialogOpen}
                onClose={() => setHwMappingDialogOpen(false)}
                configuration={null} // 실제 configuration은 props로 전달
            />

            {/* Simulation Dialog */}
            <SimulationDialog
                open={simulationDialogOpen}
                onClose={() => setSimulationDialogOpen(false)}
                configuration={null} // 실제 configuration은 props로 전달
            />

            {/* File Dialog */}
            <FileDialog
                open={fileDialogOpen}
                type={fileDialogType}
                onClose={() => setFileDialogOpen(false)}
                onConfirm={handleFileDialogConfirm}
            />

            {/* Progress Dialog */}
            <ProgressDialog
                open={progressDialogOpen}
                onClose={() => setProgressDialogOpen(false)}
                taskType={progressDialogType}
                onTaskComplete={(moduleProgress) => {
                    console.log('Task completed:', moduleProgress);
                }}
            />
        </>
    );
}

export default MenuBox;