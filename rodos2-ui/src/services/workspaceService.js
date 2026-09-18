// Workspace 관련 API 서비스
export const workspaceService = {
    // 워크스페이스 구조 조회
    async getWorkspaceStructure() {
        try {
            const response = await fetch('/api/registry/workspace/structure');
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to load workspace structure');
            }
        } catch (error) {
            console.error('Error loading workspace structure:', error);
            throw error;
        }
    },
    // 파일 업로드
    async uploadFile(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            console.log('Uploading file:', file.name, file.size, 'bytes');
            
            const response = await fetch('/api/registry/module/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.text();
                console.log('Upload success:', result);
                return result;
            } else {
                const errorText = await response.text();
                console.error('Upload failed:', response.status, errorText);
                throw new Error(errorText || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },
    // 파일 삭제
    async deleteFile(filename) {
        try {
            const response = await fetch('/api/registry/module/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });

            if (response.ok) {
                return true;
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },
    // Module Info 디렉토리의 파일 내용 조회
    async getWorkspaceFileContent(filename) {
        try {
            const response = await fetch(
                `/api/registry/workspace/file?filename=${encodeURIComponent(filename)}`
            );
            if (response.ok) {
                return await response.text();
            } else {
                throw new Error('Failed to read file from workspace');
            }
        } catch (error) {
            console.error('Error reading workspace file:', error);
            throw error;
        }
    },
    // 백엔드 응답 구조를 트리 구조로 변환
    transformStructureToTree(structure) {
        let moduleInfo = [];
        let appConfiguration = [];

        // structure는 배열이므로 첫 번째 요소(workspace 노드)에서 children 찾기
        if (structure && Array.isArray(structure) && structure.length > 0) {
            const workspaceNode = structure[0];
            console.log('Workspace node:', workspaceNode);

            if (workspaceNode.children && Array.isArray(workspaceNode.children)) {
                workspaceNode.children.forEach(node => {
                    if (node.key === 'moduleinfo' && node.children) {
                        moduleInfo = node.children;
                        console.log('Module Info found:', moduleInfo);
                    } else if (node.key === 'configuration' && node.children) {
                        appConfiguration = node.children;
                        console.log('Configuration found:', appConfiguration);
                    }
                });
            }
        }

        return [
            {
                key: 'module-info',
                label: 'Module Info',
                type: 'directory',
                children: moduleInfo.map(file => ({
                    key: file.key,
                    label: file.label,
                    type: 'file',
                    fileType: file.label.endsWith('.xml') ? 'xml' : 'other',
                    path: file.path
                }))
            },
            {
                key: 'canvas-configuration',
                label: 'Canvas Configuration',
                type: 'directory',
                children: appConfiguration.map(file => ({
                    key: file.key,
                    label: file.label,
                    type: 'file',
                    fileType: file.label.endsWith('.xml') ? 'xml' : 'other',
                    path: file.path
                }))
            }
        ];
    },

    // 기본 트리 구조 반환
    getDefaultTree() {
        return [
            { key: 'module-info', label: 'Module Info', type: 'directory', children: [] },
            { key: 'canvas-configuration', label: 'Canvas Configuration', type: 'directory', children: [] }
        ];
    }
};
