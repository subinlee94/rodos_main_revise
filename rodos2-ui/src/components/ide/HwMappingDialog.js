import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import { useHwMappingDialog } from '../../hooks/useHwMappingDialog';
import '../../styles/ide/HwMappingDialog.css';

function HwMappingDialog({ open, onClose, configuration = null }) {
    const {
        selectedModule,
        selectedHW,
        mHwContent,
        mappingList,
        moduleList,
        crdaList,
        handleModuleSelect,
        handleHWSelect,
        handleHwContentChange,
        handleMapping,
        handleDeleteMapping,
        handleSave
    } = useHwMappingDialog(open);

    const handleClose = async () => {
        const success = await handleSave();
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            className="hw-mapping-dialog"
            PaperProps={{
                style: {
                    width: '75%',
                    maxWidth: '900px',
                    minWidth: '750px'
                }
            }}
        >
            <DialogTitle className="dialog-title">
                Select Device for Hardware Information Model
            </DialogTitle>

            <DialogContent className="dialog-content">
                <div className="simulation-content-flex">
                    {/* 좌측: Hardware Information과 HW Module List를 상하로 배치 */}
                    <div className="simulation-section comp-left">
                        {/* 상단: Hardware Information */}
                        <div className="comp-left-top">
                            <h3 className="simulation-subtitle">Hardware Information</h3>
                            <div className="simulation-form">
                                <div className="simulation-group">
                                    <label className="simulation-label">HW Type</label>
                                    <input
                                        type="text"
                                        className="simulation-input"
                                        value={mHwContent['HW Type']}
                                        onChange={(e) => handleHwContentChange('HW Type', e.target.value)}
                                    />
                                </div>

                                <div className="simulation-group">
                                    <label className="simulation-label">HW Name</label>
                                    <input
                                        type="text"
                                        className="simulation-input"
                                        value={mHwContent['HW Name']}
                                        onChange={(e) => handleHwContentChange('HW Name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="simulation-table-container">
                                <table className="simulation-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>HW Name</th>
                                            <th>IP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crdaList.map((hw, index) => (
                                            <tr
                                                key={index}
                                                className={`simulation-row ${selectedHW?.id === hw.id ? 'selected' : ''}`}
                                                onClick={() => handleHWSelect(hw)}
                                            >
                                                <td>{hw.hwType}</td>
                                                <td>{hw.hwName}</td>
                                                <td>{hw.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 하단: HW Module List */}
                        <div className="comp-left-bottom">
                            <h4 className="simulation-subtitle">HW(Controller) Module List</h4>
                            <div className="simulation-table-container">
                                <table className="simulation-table">
                                    <thead>
                                        <tr>
                                            <th>Module Name</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {moduleList.map((module, index) => (
                                            <tr
                                                key={index}
                                                className={`simulation-row ${selectedModule?.name === module.name ? 'selected' : ''}`}
                                                onClick={() => handleModuleSelect(module)}
                                            >
                                                <td>{module.name}</td>
                                                <td>{module.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 우측: Mapping Results (전체 우측 공간) */}
                    <div className="simulation-section comp-right">
                        <h4 className="simulation-subtitle">Mapping Results</h4>

                        <div className="simulation-actions">
                            <button
                                onClick={handleMapping}
                                className="simulation-button primary"
                            >
                                Mapping
                            </button>
                            <button
                                onClick={handleDeleteMapping}
                                className="simulation-button danger"
                            >
                                Delete Mapping Info
                            </button>
                        </div>

                        <div className="simulation-table-container">
                            <table className="simulation-table">
                                <thead>
                                    <tr>
                                        <th>HW(Controller) Module</th>
                                        <th>HW Info</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mappingList.map((mapping, index) => (
                                        <tr
                                            key={index}
                                            className={`simulation-row ${selectedModule?.name === mapping.name ? 'selected' : ''}`}
                                            onClick={() => handleModuleSelect(mapping.module)}
                                        >
                                            <td>{mapping.name}</td>
                                            <td>
                                                {mapping.hw.type}:{mapping.hw.hwName}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DialogContent>

            <DialogActions className="dialog-actions">
                <Button onClick={handleClose} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default HwMappingDialog;
