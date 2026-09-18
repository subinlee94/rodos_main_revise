import React from 'react';
import { useInfrastructureState } from '../../hooks/useInfrastructureState';
import '../../styles/wizard/InfrastructurePage.css';

function InfraTypeInput({ value, onChange, onAdd, isEditing }) {
    return (
        <div className="infra-row infra-row--fullwidth">
            <input type="text" name="name" placeholder="Name" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
            <input type="text" name="versionMin" placeholder="Version Min" value={value.version?.min || ''} onChange={e => onChange({ ...value, version: { ...value.version, min: e.target.value } })} />
            <input type="text" name="versionMax" placeholder="Version Max" value={value.version?.max || ''} onChange={e => onChange({ ...value, version: { ...value.version, max: e.target.value } })} />
            {onAdd && <button type="button" className="infra-btn" onClick={onAdd} disabled={!value.name}>Add</button>}
        </div>
    );
}

function ProtocolInput({ value, onChange, onAdd, isEditing }) {
    return (
        <div className="infra-row infra-row--compact">
            <input type="text" name="name" placeholder="Protocol Name" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
            <input type="text" name="layerType" placeholder="Layer Type" value={value.layerType} onChange={e => onChange({ ...value, layerType: e.target.value })} />
            {onAdd && <button type="button" className="infra-btn" onClick={onAdd} disabled={!value.name}>Add</button>}
        </div>
    );
}

function InfrastructurePage({ infrastructure, setInfrastructure }) {
    const {
        infraState,
        dbInput,
        mwInput,
        commList,
        commInput,
        mtpInput,
        underInput,
        setDbInput,
        setMwInput,
        setCommInput,
        setMtpInput,
        setUnderInput,
        handleAddDb,
        handleRemoveDb,
        handleAddMw,
        handleRemoveMw,
        handleAddMtp,
        handleRemoveMtp,
        handleSetUnder,
        handleAddComm,
        handleRemoveComm
    } = useInfrastructureState(infrastructure, setInfrastructure);

    return (
        <div className="infra-page">
            <div className="infra-section">
                <div className="infra-label">Database</div>
                <InfraTypeInput value={dbInput} onChange={setDbInput} onAdd={handleAddDb} />
                <div className="infra-list-viewer">
                    {(infraState?.databases || []).map((db, idx) => (
                        <div key={idx} className="infra-row infra-row--fullwidth infra-list-row">
                            <span className="infra-list-item">{db.name}</span>
                            <span className="infra-list-item">{db.version?.min} ~ {db.version?.max}</span>
                            <button type="button" className="infra-btn" onClick={() => handleRemoveDb(idx)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="infra-section">
                <div className="infra-label">Middleware</div>
                <InfraTypeInput value={mwInput} onChange={setMwInput} onAdd={handleAddMw} />
                <div className="infra-list-viewer">
                    {(infraState?.middlewares || []).map((mw, idx) => (
                        <div key={idx} className="infra-row infra-row--fullwidth infra-list-row">
                            <span className="infra-list-item">{mw.name}</span>
                            <span className="infra-list-item">{mw.version?.min} ~ {mw.version?.max}</span>
                            <button type="button" className="infra-btn" onClick={() => handleRemoveMw(idx)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="infra-section">
                <div className="infra-label">Communications</div>
                <div className="infra-comm-box">
                    <div className="infra-comm-protocols">
                        <div className="infra-label-sm">Most Top Protocols</div>
                        <ProtocolInput value={mtpInput} onChange={setMtpInput} onAdd={handleAddMtp} />
                        <div className="infra-list-viewer">
                            {(commInput.mostTopProtocol || []).map((mtp, idx) => (
                                <div key={idx} className="infra-row infra-row--compact infra-list-row">
                                    <span className="infra-list-item">{mtp.name}</span>
                                    <span className="infra-list-item">{mtp.layerType}</span>
                                    <button type="button" className="infra-btn" onClick={() => handleRemoveMtp(idx)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="infra-label-sm">Underlying Protocol</div>
                    <ProtocolInput value={commInput.underlyingProtocol} onChange={handleSetUnder} />
                    <button type="button" className="infra-btn" onClick={handleAddComm} style={{ marginTop: 10 }}>Add Communication</button>
                </div>
                <div className="infra-list-viewer">
                    {commList.map((comm, idx) => (
                        <div key={idx} className="infra-row infra-row--fullwidth infra-list-row">
                            <span className="infra-list-item">Comm #{idx + 1}</span>
                            <span className="infra-list-item">MostTop: {comm.mostTopProtocol?.map(p => p.name).join(', ')}</span>
                            <span className="infra-list-item">Underlying: {comm.underlyingProtocol?.name}</span>
                            <button type="button" className="infra-btn" onClick={() => handleRemoveComm(idx)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InfrastructurePage; 