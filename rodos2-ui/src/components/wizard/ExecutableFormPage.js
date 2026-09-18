import React from 'react';
import '../../styles/wizard/ExecutableFormPage.css';
import { useExecutableFormState } from '../../hooks/useExecutableFormState';

const ExecutableFormPage = ({ moduleState, setModuleState }) => {
    const {
        activeTab,
        exeFormInputs,
        selectedExeFormIndex,
        propertyRoot,
        setLibURLInput,
        libURLInput,
        selectedLibIndex,
        setActiveTab,
        setExeFormInputs,
        handleSelectExeForm,
        handleSelectLibURL,
        handleAddExeForm,
        handleUpdateExeForm,
        handleDeleteExeForm,
        handleAddLibURL,
        handleUpdateLibURL,
        handleDeleteLibURL,
        clearInputs
    } = useExecutableFormState(moduleState, setModuleState);

    return (
        <div className="executable-form-page">
            {/* 탭 헤더 */}
            <div className="executable-form-tabs">
                <button
                    className={`executable-form-tab ${activeTab === 'exeForm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exeForm')}
                >
                    ExeForm
                </button>
                <button
                    className={`executable-form-tab ${activeTab === 'libURLs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('libURLs')}
                >
                    LibURLs
                </button>
            </div>

            {/* ExeForm 탭 */}
            {activeTab === 'exeForm' && (
                <div className="executable-form-content">
                    {/* 입력 영역 */}
                    <div className="executable-form-input-section">
                        <div className="executable-form-row">
                            <div className="executable-form-group">
                                <label className="executable-form-label">
                                    ExeFileURL (Path of executable file that shall be executed)
                                </label>
                                <input
                                    type="text"
                                    value={exeFormInputs.exeFileURL}
                                    onChange={(e) => setExeFormInputs(prev => ({ ...prev, exeFileURL: e.target.value }))}
                                    className="executable-form-input"
                                    placeholder="Enter executable file URL"
                                />
                            </div>
                            <div className="executable-form-group">
                                <label className="executable-form-label">Shell Command</label>
                                <textarea
                                    value={exeFormInputs.shell}
                                    onChange={(e) => setExeFormInputs(prev => ({ ...prev, shell: e.target.value }))}
                                    className="executable-form-textarea"
                                    placeholder="Enter shell command"
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="executable-form-row">
                            <div className="executable-form-group">
                                <label className="executable-form-label">Property</label>
                                <div className="executable-form-property-placeholder">
                                    Property tree view will be implemented here
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="executable-form-actions">
                        <button
                            onClick={handleAddExeForm}
                            className="executable-form-btn"
                            disabled={!exeFormInputs.exeFileURL.trim()}
                        >
                            Add ExeForm
                        </button>
                        <button
                            onClick={handleUpdateExeForm}
                            className="executable-form-btn"
                            disabled={selectedExeFormIndex === null}
                        >
                            Update ExeForm
                        </button>
                        <button
                            onClick={handleDeleteExeForm}
                            className="executable-form-btn executable-form-btn--danger"
                            disabled={selectedExeFormIndex === null}
                        >
                            Delete ExeForm
                        </button>
                    </div>

                    {/* ExeForm 테이블 */}
                    <div className="executable-form-table-container">
                        <table className="executable-form-table">
                            <thead>
                                <tr>
                                    <th>ExeFileURL</th>
                                    <th>Shell Cmd</th>
                                    <th>Property</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(moduleState.executableForm?.exeForms || []).map((exeForm, index) => (
                                    <tr
                                        key={index}
                                        className={selectedExeFormIndex === index ? 'selected' : ''}
                                        onClick={() => handleSelectExeForm(index)}
                                    >
                                        <td>{exeForm.exeFileURL}</td>
                                        <td>{exeForm.shell || 'None'}</td>
                                        <td>{exeForm.properties ? `${exeForm.properties.length} properties` : 'None'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* LibURLs 탭 */}
            {activeTab === 'libURLs' && (
                <div className="executable-form-content">
                    <div className="executable-form-lib-section">
                        <label className="executable-form-label">
                            Input ExForm (url, path of file, exe, sh, ph ...)
                        </label>
                        <input
                            type="text"
                            value={libURLInput}
                            onChange={(e) => setLibURLInput(e.target.value)}
                            className="executable-form-input executable-form-input--full"
                            placeholder="Enter library URL"
                        />

                        <div className="executable-form-actions">
                            <button
                                onClick={handleAddLibURL}
                                className="executable-form-btn"
                                disabled={!libURLInput.trim()}
                            >
                                Add
                            </button>
                            <button
                                onClick={handleUpdateLibURL}
                                className="executable-form-btn"
                                disabled={selectedLibIndex === null}
                            >
                                Update
                            </button>
                            <button
                                onClick={handleDeleteLibURL}
                                className="executable-form-btn executable-form-btn--danger"
                                disabled={selectedLibIndex === null}
                            >
                                Delete
                            </button>
                        </div>

                        {/* LibURL 테이블 */}
                        <div className="executable-form-table-container">
                            <table className="executable-form-table">
                                <thead>
                                    <tr>
                                        <th>Lib Executable Form</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(moduleState.executableForm?.lib?.urlnPaths || []).map((url, index) => (
                                        <tr
                                            key={index}
                                            className={selectedLibIndex === index ? 'selected' : ''}
                                            onClick={() => handleSelectLibURL(index)}
                                        >
                                            <td>{url}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutableFormPage; 