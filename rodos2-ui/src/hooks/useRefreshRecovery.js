import { useEffect, useRef, useState } from 'react';

/**
 * 새로고침 감지 및 복구를 위한 훅
 */
export function useRefreshRecovery() {
    const isRefreshing = useRef(false);
    const beforeUnloadHandler = useRef(null);

    useEffect(() => {
        // 새로고침 감지
        const handleBeforeUnload = (event) => {
            isRefreshing.current = true;
            // 새로고침 시 경고 메시지 (선택사항)
            // event.preventDefault();
            // event.returnValue = 'Are you sure you want to refresh?';
        };

        const handleLoad = () => {
            // 페이지 로드 시 새로고침 상태 확인
            if (isRefreshing.current) {
                console.log('Page refreshed, initializing recovery...');
                // 새로고침 후 복구 로직
                setTimeout(() => {
                    isRefreshing.current = false;
                }, 1000);
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('load', handleLoad);

        // 정리 함수
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    return {
        isRefreshing: isRefreshing.current
    };
}

/**
 * 네트워크 상태 감지 훅
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('Network is back online');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('Network is offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

/**
 * API 재시도 로직을 위한 훅
 */
export function useRetryableApi() {
    const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiFunction();
            } catch (error) {
                console.warn(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);

                if (i === maxRetries - 1) {
                    throw error;
                }

                // 지수 백오프로 재시도 간격 증가
                await new Promise(resolve =>
                    setTimeout(resolve, delay * Math.pow(2, i))
                );
            }
        }
    };

    return { retryApiCall };
}
