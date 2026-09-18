// 실행 관련 서비스 함수들

export const executionService = {
    async executeModule(moduleData) {
        try {
            console.log('Executing module:', moduleData);

            // 모듈 실행 로직
            const response = await fetch('/api/execution/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(moduleData)
            });

            if (!response.ok) {
                throw new Error(`Execution failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Execution failed:', error);
            throw error;
        }
    },

    async stopExecution(executionId) {
        try {
            console.log('Stopping execution:', executionId);

            const response = await fetch(`/api/execution/stop/${executionId}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Stop execution failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Stop execution failed:', error);
            throw error;
        }
    },

    async deployModule(moduleData) {
        try {
            console.log('Deploying module:', moduleData);

            const response = await fetch('/api/deployment/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(moduleData)
            });

            if (!response.ok) {
                throw new Error(`Deployment failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Deployment failed:', error);
            throw error;
        }
    },

    async getExecutionStatus(executionId) {
        try {
            const response = await fetch(`/api/execution/status/${executionId}`);

            if (!response.ok) {
                throw new Error(`Failed to get execution status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get execution status:', error);
            throw error;
        }
    },

    async linkModules(sourceModule, targetModule) {
        try {
            console.log('Linking modules:', sourceModule, targetModule);

            const response = await fetch('/api/link/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sourceModule,
                    targetModule
                })
            });

            if (!response.ok) {
                throw new Error(`Link creation failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Link creation failed:', error);
            throw error;
        }
    },

    async deleteModule(moduleId) {
        try {
            console.log('Deleting module:', moduleId);

            const response = await fetch(`/api/modules/${moduleId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Module deletion failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Module deletion failed:', error);
            throw error;
        }
    }
}; 