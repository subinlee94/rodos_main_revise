import { useState, useCallback } from 'react';

export function useIDEState() {
    const [wizardType, setWizardType] = useState('sim');
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState(null);

    const openWizard = useCallback((type, data = null) => {
        setWizardType(type);
        setWizardData(data);
        setWizardOpen(true);
    }, []);

    const closeWizard = useCallback(() => {
        setWizardOpen(false);
        setWizardData(null);
    }, []);

    return {
        wizardType,
        wizardOpen,
        wizardData,
        openWizard,
        closeWizard
    };
} 