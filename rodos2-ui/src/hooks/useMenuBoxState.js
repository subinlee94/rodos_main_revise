import { useState, useCallback } from 'react';
import { canvasAPI } from '../services/api';

export function useMenuBoxState() {
    const [isLoading, setIsLoading] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', message: '', icon: null });

    const showDialog = useCallback((title, message, icon) => {
        setDialogContent({ title, message, icon });
        setDialogOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);

    const handleNew = useCallback(async () => {
        setIsLoading(true);
        try {
            // 새 파일 생성 로직
            console.log('Creating new file...');
            setCurrentFile(null);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to create new file:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleOpen = useCallback(async () => {
        setIsLoading(true);
        try {
            // 파일 열기 로직
            console.log('Opening file...');
            // 파일 선택 다이얼로그 구현 필요
        } catch (error) {
            console.error('Failed to open file:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!currentFile) {
            return handleSaveAs();
        }

        setIsLoading(true);
        try {
            // 파일 저장 로직
            console.log('Saving file...');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save file:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentFile]);

    const handleSaveAs = useCallback(async () => {
        setIsLoading(true);
        try {
            // 다른 이름으로 저장 로직
            console.log('Saving file as...');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save file as:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleUndo = useCallback(() => {
        console.log('Undo action');
        // 실행 취소 로직
    }, []);

    const handleRedo = useCallback(() => {
        console.log('Redo action');
        // 다시 실행 로직
    }, []);

    const handleLink = useCallback(() => {
        console.log('Link action');
        // 링크 기능 로직
    }, []);

    const handleDelete = useCallback(() => {
        console.log('Delete action');
        // 삭제 로직
    }, []);

    const handleValidationCheck = useCallback(() => {
        console.log('Validation check');
        // 유효성 검사 로직
    }, []);

    const handleMappingWithHW = useCallback(() => {
        showDialog(
            'Mapping with Hardware',
            'This feature will allow you to map software modules with hardware components.',
            '🔧'
        );
    }, [showDialog]);

    const handleMappingWithSimulation = useCallback(() => {
        showDialog(
            'Mapping with Simulation',
            'This feature will allow you to map software modules with simulation environments.',
            '🎮'
        );
    }, [showDialog]);

    const handleStop = useCallback(() => {
        // Progress Dialog에서 처리
        console.log('Stop action - will be handled by Progress Dialog');
    }, []);

    const handleDeploy = useCallback(() => {
        // Progress Dialog에서 처리
        console.log('Deploy action - will be handled by Progress Dialog');
    }, []);

    const handleExecute = useCallback(() => {
        // Progress Dialog에서 처리
        console.log('Execute action - will be handled by Progress Dialog');
    }, []);

    return {
        isLoading,
        currentFile,
        hasUnsavedChanges,
        setHasUnsavedChanges,
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
    };
} 