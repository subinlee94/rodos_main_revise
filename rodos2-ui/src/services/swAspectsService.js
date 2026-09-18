// SWAspects 관련 API 서비스
export const swAspectsService = {
    // Registry에서 SW 모듈 목록 조회 (software classification)
    async getSWModules() {
        try {
            const response = await fetch('/api/registry/all');
            if (response.ok) {
                const data = await response.json();
                return data.software || [];
            }
            throw new Error('Failed to fetch SW modules');
        } catch (error) {
            console.error('Error fetching SW modules:', error);
            return [];
        }
    },

    // 선택된 SW 모듈들을 ModuleID 형태로 변환
    transformToModuleIDs(selectedModules) {
        return selectedModules.map(module => {
            const moduleID = module.moduleID || '';
            // moduleID에서 mID와 iID 추출
            const parts = moduleID.split('-');
            let mID, iID;
            
            if (parts.length >= 5) {
                // 기존 형태: 5개 이상의 부분으로 분리됨
                mID = parts.slice(0, 4).join('-');
                iID = parts[4];
            } else if (parts.length === 2) {
                // 새로운 형태: 2개 부분으로 분리됨 (mID-iID)
                mID = parts[0];
                iID = parts[1];
            } else {
                // 기본값
                mID = moduleID;
                iID = '00';
            }

            return {
                mID: mID,
                iID: iID
            };
        });
    }
};
