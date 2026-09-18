import { useState, useEffect } from 'react';
import { TreeNode } from '../utils/tree/TreeNode';
import { createTreeNode } from '../utils/tree/TreeUtils';

export function useExecutableFormState(moduleState, setModuleState) {
    const [activeTab, setActiveTab] = useState('exeForm');

    // ExeForm 관련 상태
    const [exeFormInputs, setExeFormInputs] = useState({
        exeFileURL: '',
        shell: ''
    });
    const [selectedExeFormIndex, setSelectedExeFormIndex] = useState(null);
    const [propertyRoot, setPropertyRoot] = useState(new TreeNode());

    // LibURL 관련 상태
    const [libURLInput, setLibURLInput] = useState('');
    const [selectedLibIndex, setSelectedLibIndex] = useState(null);

    // ExecutableForm 초기화
    useEffect(() => {
        if (!moduleState.executableForm) {
            setModuleState(prev => ({
                ...prev,
                executableForm: {
                    exeForms: [],
                    lib: {
                        urlnPaths: []
                    }
                }
            }));
        }
    }, [moduleState.executableForm, setModuleState]);

    // ExeForm 선택 시 입력폼에 값 반영
    const handleSelectExeForm = (index) => {
        setSelectedExeFormIndex(index);
        const exeForm = moduleState.executableForm.exeForms[index];
        if (exeForm) {
            setExeFormInputs({
                exeFileURL: exeForm.exeFileURL || '',
                shell: exeForm.shell || ''
            });
            // Property 설정 (간단히 구현)
            if (exeForm.properties) {
                setPropertyRoot(createTreeNode(exeForm.properties));
            } else {
                setPropertyRoot(new TreeNode());
            }
        }
    };

    // LibURL 선택 시 입력폼에 값 반영
    const handleSelectLibURL = (index) => {
        setSelectedLibIndex(index);
        const url = moduleState.executableForm.lib.urlnPaths[index];
        if (url) {
            setLibURLInput(url);
        }
    };

    // ExeForm 추가
    const handleAddExeForm = () => {
        if (!exeFormInputs.exeFileURL.trim()) {
            alert('ExeFileURL을 입력해주세요.');
            return;
        }

        const newExeForm = {
            exeFileURL: exeFormInputs.exeFileURL,
            shell: exeFormInputs.shell || null,
            properties: propertyRoot.getValue()?.properties || null
        };

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                exeForms: [...(prev.executableForm?.exeForms || []), newExeForm]
            }
        }));

        setExeFormInputs({ exeFileURL: '', shell: '' });
        setSelectedExeFormIndex(null);
        setPropertyRoot(new TreeNode());
    };

    // ExeForm 업데이트
    const handleUpdateExeForm = () => {
        if (selectedExeFormIndex === null) return;
        if (!exeFormInputs.exeFileURL.trim()) {
            alert('ExeFileURL을 입력해주세요.');
            return;
        }

        const updatedExeForm = {
            exeFileURL: exeFormInputs.exeFileURL,
            shell: exeFormInputs.shell || null,
            properties: propertyRoot.getValue()?.properties || null
        };

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                exeForms: prev.executableForm.exeForms.map((form, i) =>
                    i === selectedExeFormIndex ? updatedExeForm : form
                )
            }
        }));

        setExeFormInputs({ exeFileURL: '', shell: '' });
        setSelectedExeFormIndex(null);
        setPropertyRoot(new TreeNode());
    };

    // ExeForm 삭제
    const handleDeleteExeForm = () => {
        if (selectedExeFormIndex === null) return;

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                exeForms: prev.executableForm.exeForms.filter((_, i) => i !== selectedExeFormIndex)
            }
        }));

        setExeFormInputs({ exeFileURL: '', shell: '' });
        setSelectedExeFormIndex(null);
        setPropertyRoot(new TreeNode());
    };

    // LibURL 추가
    const handleAddLibURL = () => {
        if (!libURLInput.trim()) {
            alert('Library URL을 입력해주세요.');
            return;
        }

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                lib: {
                    ...prev.executableForm.lib,
                    urlnPaths: [...(prev.executableForm?.lib?.urlnPaths || []), libURLInput]
                }
            }
        }));

        setLibURLInput('');
        setSelectedLibIndex(null);
    };

    // LibURL 업데이트
    const handleUpdateLibURL = () => {
        if (selectedLibIndex === null) return;
        if (!libURLInput.trim()) {
            alert('Library URL을 입력해주세요.');
            return;
        }

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                lib: {
                    ...prev.executableForm.lib,
                    urlnPaths: prev.executableForm.lib.urlnPaths.map((url, i) =>
                        i === selectedLibIndex ? libURLInput : url
                    )
                }
            }
        }));

        setLibURLInput('');
        setSelectedLibIndex(null);
    };

    // LibURL 삭제
    const handleDeleteLibURL = () => {
        if (selectedLibIndex === null) return;

        setModuleState(prev => ({
            ...prev,
            executableForm: {
                ...prev.executableForm,
                lib: {
                    ...prev.executableForm.lib,
                    urlnPaths: prev.executableForm.lib.urlnPaths.filter((_, i) => i !== selectedLibIndex)
                }
            }
        }));

        setLibURLInput('');
        setSelectedLibIndex(null);
    };

    // 입력폼 초기화
    const clearInputs = () => {
        setExeFormInputs({ exeFileURL: '', shell: '' });
        setLibURLInput('');
        setSelectedExeFormIndex(null);
        setSelectedLibIndex(null);
        setPropertyRoot(new TreeNode());
    };

    return {
        // 상태
        activeTab,
        exeFormInputs,
        selectedExeFormIndex,
        propertyRoot,
        libURLInput,
        selectedLibIndex,

        // 상태 설정 함수
        setActiveTab,
        setExeFormInputs,
        setLibURLInput,

        // 이벤트 핸들러
        handleSelectExeForm,
        handleSelectLibURL,
        handleAddExeForm,
        handleUpdateExeForm,
        handleDeleteExeForm,
        handleAddLibURL,
        handleUpdateLibURL,
        handleDeleteLibURL,
        clearInputs
    };
}
