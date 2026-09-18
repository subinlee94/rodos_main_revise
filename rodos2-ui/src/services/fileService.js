import { moduleAPI } from './api';

// 파일 관련 서비스 함수들

export const fileService = {
    async createNewFile() {
        try {
            // 새 파일 생성 로직
            const newFile = {
                id: Date.now().toString(),
                name: 'Untitled',
                content: {},
                createdAt: new Date().toISOString()
            };

            // 로컬 스토리지에 임시 저장
            localStorage.setItem('currentFile', JSON.stringify(newFile));

            return newFile;
        } catch (error) {
            console.error('Failed to create new file:', error);
            throw error;
        }
    },

    async openFile(filePath) {
        try {
            // 파일 열기 로직
            const response = await fetch(`/api/files/${filePath}`);
            if (!response.ok) {
                throw new Error(`Failed to open file: ${response.status}`);
            }

            const fileData = await response.json();
            localStorage.setItem('currentFile', JSON.stringify(fileData));

            return fileData;
        } catch (error) {
            console.error('Failed to open file:', error);
            throw error;
        }
    },

    async saveFile(fileData) {
        try {
            // 파일 저장 로직
            const response = await moduleAPI.updateModule(fileData);
            localStorage.setItem('currentFile', JSON.stringify(fileData));

            return response;
        } catch (error) {
            console.error('Failed to save file:', error);
            throw error;
        }
    },

    async saveFileAs(fileData, fileName) {
        try {
            // 다른 이름으로 저장 로직
            const fileToSave = {
                ...fileData,
                name: fileName,
                savedAt: new Date().toISOString()
            };

            const response = await moduleAPI.saveXML(fileToSave);
            localStorage.setItem('currentFile', JSON.stringify(fileToSave));

            return response;
        } catch (error) {
            console.error('Failed to save file as:', error);
            throw error;
        }
    },

    getCurrentFile() {
        try {
            const fileData = localStorage.getItem('currentFile');
            return fileData ? JSON.parse(fileData) : null;
        } catch (error) {
            console.error('Failed to get current file:', error);
            return null;
        }
    },

    hasUnsavedChanges() {
        const currentFile = this.getCurrentFile();
        return currentFile && currentFile.hasUnsavedChanges;
    }
}; 