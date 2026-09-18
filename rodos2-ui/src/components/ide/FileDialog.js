import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useCanvasState } from '../../hooks/useCanvasState';

function FileDialog({ open, type, onClose, onConfirm }) {
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [configFiles, setConfigFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getConfigurationFiles } = useCanvasState();

    useEffect(() => {
        if (open && (type === 'open' || type === 'saveAs')) {
            loadConfigFiles();
        }
    }, [open, type]);

    const loadConfigFiles = async () => {
        try {
            setLoading(true);
            const files = await getConfigurationFiles();
            setConfigFiles(files);
        } catch (error) {
            console.error('Failed to load configuration files:', error);
            setConfigFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (type === 'save' || type === 'saveAs') {
            if (!fileName.trim()) {
                alert('Please enter a file name');
                return;
            }
            onConfirm(fileName.trim());
        } else if (type === 'open') {
            if (!selectedFile) {
                alert('Please select a file');
                return;
            }
            onConfirm(selectedFile);
        }
        handleClose();
    };

    const handleClose = () => {
        setFileName('');
        setSelectedFile('');
        setConfigFiles([]);
        onClose();
    };

    const getTitle = () => {
        switch (type) {
            case 'save': return 'Save Configuration';
            case 'saveAs': return 'Save Configuration As';
            case 'open': return 'Open Configuration';
            default: return 'File Dialog';
        }
    };

    const getConfirmText = () => {
        switch (type) {
            case 'save': return 'Save';
            case 'saveAs': return 'Save As';
            case 'open': return 'Open';
            default: return 'Confirm';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogContent>
                {(type === 'save' || type === 'saveAs') && (
                    <TextField
                        autoFocus
                        margin="dense"
                        label="File Name"
                        fullWidth
                        variant="outlined"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter configuration name (without .xml extension)"
                        sx={{ mb: 2 }}
                    />
                )}

                {(type === 'open' || type === 'saveAs') && (
                    <div>
                        <Typography variant="h6" gutterBottom>
                            Existing Configurations
                        </Typography>
                        {loading ? (
                            <Typography>Loading...</Typography>
                        ) : configFiles.length === 0 ? (
                            <Typography color="text.secondary">
                                No configuration files found
                            </Typography>
                        ) : (
                            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {configFiles.map((file, index) => (
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton
                                            selected={selectedFile === file}
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            <ListItemText primary={file} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained">
                    {getConfirmText()}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default FileDialog;
