import { useState, useEffect, useCallback } from 'react';

export function useCheckPageState({
    moduleName, manufacturer, description, examples,
    idnType, properties, ioVariables, services, infrastructure, safeSecure, modelling, executableForm
}) {
    const [xml, setXml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchXMLFromBackend = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 모듈 타입 결정 (idnType.idtype이 'Comp'이면 Composite, 아니면 SIM)
            const isComposite = idnType && idnType.idtype === 'Comp';
            const moduleType = isComposite ? 'Composite' : 'SIM';

            console.log('CheckPage - isComposite:', isComposite, 'moduleType:', moduleType);

            // 모듈 타입에 따라 데이터 구성
            const moduleData = {
                type: moduleType,
                moduleName: moduleName || '',
                manufacturer: manufacturer || '',
                description: description || '',
                examples: examples || '',
                idnType: idnType || {},
                properties: properties || {},
                ioVariables: ioVariables || {},
                services: services || {},
                infrastructure: infrastructure || {},
                safeSecure: safeSecure || {},
                modelling: modelling || {},
                executableForm: executableForm || {}
            };

            // Composite 모듈인 경우 추가 필드 설정
            if (isComposite) {
                moduleData.isSafety = false;
                moduleData.isSecurity = false;
                moduleData.isHw = true;
                moduleData.isSw = true;
                moduleData.isTool = false;
                moduleData.complexList = ['None', 'array', 'class', 'pointer', 'vector'];
            }

            console.log('Sending module data to backend:', moduleData);

            const response = await fetch('/api/module/preview-xml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moduleData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const xmlData = await response.text();
            setXml(xmlData);
        } catch (error) {
            console.error('Error fetching XML:', error);
            setError('Failed to load XML from backend');
        } finally {
            setLoading(false);
        }
    }, [moduleName, manufacturer, description, examples, idnType, properties, ioVariables, services, infrastructure, safeSecure, modelling, executableForm]);

    // 백엔드에서 XML 가져오기
    useEffect(() => {
        fetchXMLFromBackend();
    }, [fetchXMLFromBackend]);

    return {
        xml,
        loading,
        error,
        fetchXMLFromBackend
    };
}
