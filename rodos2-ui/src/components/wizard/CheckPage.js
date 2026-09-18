import React from 'react';
import '../../styles/wizard/CheckPage.css';
import { useCheckPageState } from '../../hooks/useCheckPageState';

function CheckPage({
    moduleName, manufacturer, description, examples,
    idnType, properties, ioVariables, services, infrastructure, safeSecure, modelling, executableForm
}) {
    const { xml, loading, error, fetchXMLFromBackend } = useCheckPageState({
        moduleName, manufacturer, description, examples,
        idnType, properties, ioVariables, services, infrastructure, safeSecure, modelling, executableForm
    });

    if (loading) {
        return (
            <div className="check-page">
                <h2>XML Preview</h2>
                <div className="xml-preview-desc">Loading XML from backend...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="check-page">
                <h2>XML Preview</h2>
                <div className="xml-preview-desc">Error: {error}</div>
                <button onClick={fetchXMLFromBackend} className="save-xml-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="check-page">
            <h2>XML Preview</h2>
            <div className="xml-preview-area">
                <pre>{xml}</pre>
            </div>
        </div>
    );
}

export default CheckPage; 