import React from 'react';
import { useMenuBarState } from '../../hooks/useMenuBarState';
import { useCanvasState } from '../../hooks/useCanvasState';
import '../../styles/ide/IDEMenuBar.css';

function IDEMenuBar({ onNewSIM, onNewController, onNewRobot }) {
    const { activeMenu, menuRef, handleMenuClick, handleMenuItemClick } = useMenuBarState();
    const { saveCanvasState, loadCanvasState, newConfiguration } = useCanvasState();


    const handleAction = (action) => {
        const result = handleMenuItemClick(action);
        if (result === 'new-sim') {
            onNewSIM();
        } else if (result === 'new-imcon') {
            onNewController();
        } else if (result === 'new-robot') {
            onNewRobot();
        } else if (result === 'new-config') {
            newConfiguration();
        } else if (result === 'save-canvas') {
            saveCanvasState();
        } else if (result === 'load-canvas') {
            loadCanvasState();
        }
        // execute, deploy, stop은 MenuBox에서 ProgressDialog를 통해 처리됨
    };

    return (
        <div className="ide-menu-bar" ref={menuRef}>
            <div className="menu-item">
                <button
                    className={`menu-button ${activeMenu === 'file' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('file')}
                >
                    File
                </button>
                {activeMenu === 'file' && (
                    <div className="dropdown-menu">
                        <div className="dropdown-item">
                            <span>New IM</span>
                            <div className="submenu">
                                <div
                                    className="submenu-item"
                                    onClick={() => handleAction('new-sim')}
                                >
                                    Software
                                </div>
                                <div
                                    className="submenu-item"
                                    onClick={() => handleAction('new-imr')}
                                >
                                    Recognition
                                </div>
                                <div
                                    className="submenu-item"
                                    onClick={() => handleAction('new-imcon')}
                                >
                                    Controller
                                </div>
                                <div
                                    className="submenu-item"
                                    onClick={() => handleAction('new-robot')}
                                >
                                    Robot
                                </div>
                            </div>
                        </div>
                        <div className="dropdown-divider" />
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('open')}
                        >
                            Open
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('new-config')}
                        >
                            New Configuration
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('save')}
                        >
                            Save
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('save-as')}
                        >
                            Save As
                        </div>
                        <div className="dropdown-divider" />
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('save-canvas')}
                        >
                            Save Canvas State
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('load-canvas')}
                        >
                            Load Canvas State
                        </div>
                        <div className="dropdown-divider" />
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('exit')}
                        >
                            Exit
                        </div>
                    </div>
                )}
            </div>

            <div className="menu-item">
                <button
                    className={`menu-button ${activeMenu === 'edit' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('edit')}
                >
                    Edit
                </button>
                {activeMenu === 'edit' && (
                    <div className="dropdown-menu">
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('undo')}
                        >
                            Undo
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('redo')}
                        >
                            Redo
                        </div>
                        <div className="dropdown-divider" />
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('cut')}
                        >
                            Cut
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('copy')}
                        >
                            Copy
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('paste')}
                        >
                            Paste
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('delete')}
                        >
                            Delete
                        </div>
                    </div>
                )}
            </div>

            <div className="menu-item">
                <button
                    className={`menu-button ${activeMenu === 'view' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('view')}
                >
                    View
                </button>
                {activeMenu === 'view' && (
                    <div className="dropdown-menu">
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('explorer')}
                        >
                            Explorer
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('search')}
                        >
                            Search
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('source-control')}
                        >
                            Source Control
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('run-and-debug')}
                        >
                            Run and Debug
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('extensions')}
                        >
                            Extensions
                        </div>
                    </div>
                )}
            </div>

            <div className="menu-item">
                <button
                    className={`menu-button ${activeMenu === 'launch' ? 'active' : ''}`}
                    onClick={() => handleMenuClick('launch')}
                >
                    Launch
                </button>
                {activeMenu === 'launch' && (
                    <div className="dropdown-menu">
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('start-debugging')}
                        >
                            Start Debugging
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('start-without-debugging')}
                        >
                            Start Without Debugging
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleAction('restart')}
                        >
                            Restart
                        </div>
                    </div>
                )}
            </div>

            <div className="menu-item">
                <button
                    className="menu-button"
                    onClick={() => {
                        console.log('Hello button clicked!');
                        alert('Hello!');
                    }}
                >
                    Hello
                </button>
            </div>

        </div>
    );
}

export default IDEMenuBar; 