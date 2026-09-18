import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useSimulationDialog } from '../../hooks/useSimulationDialog';
import '../../styles/ide/SimulationDialog.css';

function SimulationDialog({ open, onClose, configuration = null }) {
    const {
        selectedModule,
        selectedHW,
        mContent,
        mHwContent,
        mappingList,
        crdaList,
        handleModuleSelect,
        handleHWSelect,
        handleContentChange,
        handleSave
    } = useSimulationDialog(open, configuration);

    const handleClose = async () => {
        const result = await handleSave();
        if (result.success) {
            alert(result.message);
            onClose();
        } else {
            alert(result.message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            className="simulation-dialog"
            PaperProps={{
                style: {
                    width: '75%',
                    maxWidth: '900px',
                    minWidth: '750px'
                }
            }}
        >
            <DialogTitle className="dialog-title">
                Select Simulation for running configuration
            </DialogTitle>

            <DialogContent className="dialog-content">
                <div className="simulation-page">
                    {/* 상단: Simulation HW Name (수평으로 최대) */}
                    <div className="simulation-section">
                        <div className="simulation-hw-section">
                            <div className="simulation-hw-input">
                                <label className="simulation-label">Simulation HW Name</label>
                                <input
                                    type="text"
                                    value={mHwContent['Simulation HW Name']}
                                    disabled
                                    className="simulation-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 중간: Simulation HW Name 리스트 (수평으로 최대) */}
                    <div className="simulation-section">
                        <div className="simulation-hw-list">
                            <label className="simulation-label">Simulation HW Name</label>
                            <div className="simulation-table-container">
                                <table className="simulation-table">
                                    <thead>
                                        <tr>
                                            <th>Simulation HW Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crdaList.map((hw, index) => (
                                            <tr
                                                key={index}
                                                className={`simulation-row ${selectedHW?.id === hw.id ? 'selected' : ''}`}
                                                onClick={() => handleHWSelect(hw)}
                                            >
                                                <td>{hw.hwName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 하단: HW Module List와 Module Configuration을 좌우로 배치 */}
                    <div className="simulation-content-flex">
                        {/* 좌측: HW Module List */}
                        <div className="simulation-module-area">
                            <h3 className="simulation-section-title">HW(Controller) Module List</h3>
                            <div className="simulation-table-container">
                                <table className="simulation-table">
                                    <thead>
                                        <tr>
                                            <th>Module Name</th>
                                            <th>Name Space</th>
                                            <th>x</th>
                                            <th>y</th>
                                            <th>Θ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mappingList.map((module, index) => (
                                            <tr
                                                key={index}
                                                className={`simulation-row ${selectedModule?.name === module.name ? 'selected' : ''}`}
                                                onClick={() => handleModuleSelect(module)}
                                            >
                                                <td>{module.name}</td>
                                                <td>{module.namespace || ''}</td>
                                                <td>{module.x || ''}</td>
                                                <td>{module.y || ''}</td>
                                                <td>{module.theta || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 우측: Module Configuration */}
                        <div className="simulation-config-area">
                            <div className="simulation-config-form">
                                <div className="simulation-config-section">
                                    <div className="simulation-group">
                                        <label className="simulation-label">Module Name</label>
                                        <input
                                            type="text"
                                            value={mContent['Module Name']}
                                            disabled
                                            className="simulation-input"
                                        />
                                    </div>

                                    <div className="simulation-group">
                                        <label className="simulation-label">Namespace</label>
                                        <input
                                            type="text"
                                            value={mContent['Namespace']}
                                            onChange={(e) => handleContentChange('Namespace', e.target.value)}
                                            className="simulation-input"
                                        />
                                    </div>
                                </div>

                                <div className="simulation-config-section">
                                    <h4 className="simulation-subtitle">Spawn Pose</h4>
                                    <div className="simulation-pose-row">
                                        <div className="simulation-pose-group">
                                            <label className="simulation-label">x</label>
                                            <input
                                                type="number"
                                                value={mContent['x']}
                                                onChange={(e) => handleContentChange('x', e.target.value)}
                                                className="simulation-input"
                                            />
                                        </div>
                                        <div className="simulation-pose-group">
                                            <label className="simulation-label">y</label>
                                            <input
                                                type="number"
                                                value={mContent['y']}
                                                onChange={(e) => handleContentChange('y', e.target.value)}
                                                className="simulation-input"
                                            />
                                        </div>
                                        <div className="simulation-pose-group">
                                            <label className="simulation-label">Θ</label>
                                            <input
                                                type="number"
                                                value={mContent['Θ']}
                                                onChange={(e) => handleContentChange('Θ', e.target.value)}
                                                className="simulation-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="simulation-actions">
                                    <button
                                        onClick={handleSave}
                                        className="simulation-btn"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>

            <DialogActions className="dialog-actions">
                <Button onClick={handleClose} variant="contained" color="primary">
                    Finish
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SimulationDialog;
