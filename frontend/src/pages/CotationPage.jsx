import React, { useState, useEffect } from 'react';
import { cotationsAPI, usersAPI } from '../services/api';
import {
    Search,
    User,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Check,
    Briefcase,
    ChevronRight,
    ArrowRightLeft,
    Layers,
    Info,
    History
} from 'lucide-react';

const CotationPage = () => {
    const [dossiers, setDossiers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'assigned'

    // Selection state
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [reassignMotif, setReassignMotif] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashRes, agentsRes] = await Promise.all([
                cotationsAPI.getDashboard(),
                usersAPI.getAll()
            ]);
            setDossiers(dashRes.data);

            // Filter agents who are "Déclarants" (IDGroupes === 10)
            const declarants = agentsRes.data.filter(a => a.id_groupe === 10 || a.IDGroupes === 10);
            setAgents(declarants);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!selectedDossier || !selectedAgent) {
            return;
        }

        if (viewMode === 'assigned' && !reassignMotif) {
            alert('Veuillez saisir un motif pour la réaffectation.');
            return;
        }

        try {
            setIsSubmitting(true);
            await cotationsAPI.create({
                dossier_id: selectedDossier.id,
                agent_id: selectedAgent.id,
                date_effet: assignmentDate,
                motif: reassignMotif
            });

            await fetchData();
            setSelectedDossier(null);
            setSelectedAgent(null);
            setReassignMotif('');
        } catch (err) {
            console.error('Error applying assignment:', err);
            alert('Erreur lors de l\'affectation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDossiers = dossiers.filter(d => {
        const matchesSearch =
            d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

        const isAssigned = d.active_cotation_id !== null;

        if (viewMode === 'pending') return matchesSearch && !isAssigned;
        return matchesSearch && isAssigned;
    });

    if (loading) return (
        <div className="cotation-loading">
            <div className="spinner"></div>
            <style>{`
                .cotation-loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
                .spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <div className="cotation-container">
            <style>{`
                .cotation-container { min-height: 100vh; background: #f8fafc; padding: 2rem; font-family: 'Inter', sans-serif; color: #1e293b; }
                .cotation-wrapper { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .cotation-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1.5rem 2rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .header-title h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 0.75rem; margin: 0; }
                .header-title p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0 0; }
                
                .view-toggle { display: flex; background: #f1f5f9; padding: 0.375rem; border-radius: 0.75rem; }
                .toggle-btn { padding: 0.625rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; color: #64748b; background: transparent; display: flex; align-items: center; gap: 0.5rem; }
                .toggle-btn.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                .main-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
                @media (max-width: 1024px) { .main-layout { grid-template-columns: 1fr; } }
                
                .card { background: white; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column; }
                .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fcfcfd; }
                .card-title { font-size: 0.875rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
                
                .search-wrapper { position: relative; width: 280px; }
                .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; width: 1rem; height: 1rem; }
                .search-input { width: 100%; padding: 0.5rem 1rem 0.5rem 2.25rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
                .search-input:focus { border-color: #2563eb; }
                
                .table-container { overflow-y: auto; max-height: 550px; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
                td { padding: 1rem 1.5rem; font-size: 0.875rem; border-bottom: 1px solid #f8fafc; }
                tr.row-selected { background: #eff6ff !important; }
                tr.row-hover:hover { background: #f8fafc; cursor: pointer; }
                
                .agent-list { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; }
                .agent-card { padding: 1rem; border-radius: 0.75rem; border: 2px solid #f1f5f9; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; background: #fafafa; }
                .agent-card:hover { border-color: #cbd5e1; background: white; }
                .agent-card.selected { border-color: #2563eb; background: #eff6ff; }
                .agent-avatar { width: 40px; height: 40px; background: #e2e8f0; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #475569; }
                .agent-card.selected .agent-avatar { background: #2563eb; color: white; }
                
                .form-area { padding: 1.5rem; border-top: 1px solid #f1f5f9; background: #fcfcfd; }
                .form-group { margin-bottom: 1.25rem; }
                .label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
                .input, .textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; outline: none; }
                .input:focus, .textarea:focus { border-color: #2563eb; }
                
                .actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn { flex: 1; padding: 0.75rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-primary { background: #2563eb; color: white; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { background: #1d4ed8; }
                .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
                .btn-secondary { background: #f1f5f9; color: #475569; }
                .btn-secondary:hover { background: #e2e8f0; }
                
                .badge { padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
                .badge-blue { background: #dbeafe; color: #1e40af; }
                
                /* Selection summary */
                .selection-summary { margin-top: 1.5rem; padding: 1.25rem; background: #0f172a; color: white; border-radius: 1rem; position: relative; overflow: hidden; }
                .selection-summary::after { content: ''; position: absolute; right: -20px; bottom: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%; }
                .summary-item { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
                .summary-item:last-child { margin-bottom: 0; }
                .summary-label { font-size: 0.75rem; color: #94a3b8; min-width: 80px; }
                .summary-value { font-size: 0.875rem; font-weight: 600; }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>

            <div className="cotation-wrapper">
                {/* Header Section */}
                <header className="cotation-header">
                    <div className="header-title">
                        <h1>
                            <ArrowRightLeft className="icon-blue" />
                            Affectation des Déclarants
                        </h1>
                        <p>Imputation et suivi des dossiers par agent.</p>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'pending' ? 'active' : ''}`}
                            onClick={() => { setViewMode('pending'); setSelectedDossier(null); }}
                        >
                            <Layers size={18} />
                            À Imputer
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'assigned' ? 'active' : ''}`}
                            onClick={() => { setViewMode('assigned'); setSelectedDossier(null); }}
                        >
                            <History size={18} />
                            Réaffectation
                        </button>
                    </div>
                </header>

                <main className="main-layout">
                    {/* Dossiers List Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                {viewMode === 'pending' ? 'Dossiers Non Affectés' : 'Dossiers En Cours'}
                                <span className="badge badge-blue">{filteredDossiers.length}</span>
                            </h2>
                            <div className="search-wrapper">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Rechercher un dossier..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Libellé / Client</th>
                                        <th style={{ textAlign: 'center' }}>Volume</th>
                                        {viewMode === 'assigned' && <th>Déclarant</th>}
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDossiers.length > 0 ? (
                                        filteredDossiers.map(d => (
                                            <tr
                                                key={d.id}
                                                className={`row-hover ${selectedDossier?.id === d.id ? 'row-selected' : ''}`}
                                                onClick={() => setSelectedDossier(d)}
                                            >
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.code}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.shortCode}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#334155' }} className="truncate">{d.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <User size={12} /> {d.clientName}
                                                        {d.clientNinea && <span style={{ color: '#cbd5e1' }}>• {d.clientNinea}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ fontWeight: 700 }}>{d.total_colis || 0} Colis</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{Number(d.total_poids || 0).toFixed(0)} kg</div>
                                                </td>
                                                {viewMode === 'assigned' && (
                                                    <td>
                                                        <span className="badge badge-blue">{d.active_agent_name}</span>
                                                    </td>
                                                )}
                                                <td>
                                                    <ChevronRight size={18} color={selectedDossier?.id === d.id ? '#2563eb' : '#cbd5e1'} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={viewMode === 'assigned' ? 5 : 4} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                                <Info size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                                <div style={{ fontSize: '1rem', fontWeight: 500 }}>Aucun dossier trouvé</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Panel: Agent & Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Choisir le Déclarant</h2>
                            </div>

                            <div className="agent-list">
                                {agents.length > 0 ? agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <div className="agent-avatar">
                                            {agent.NomAgent?.charAt(0) || agent.name?.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{agent.NomAgent || agent.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{agent.login}</div>
                                        </div>
                                        {selectedAgent?.id === agent.id && <Check size={18} color="#2563eb" />}
                                    </div>
                                )) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        Chargement des agents...
                                    </div>
                                )}
                            </div>

                            <div className="form-area">
                                <div className="form-group">
                                    <label className="label">Date d'Imputation</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={assignmentDate}
                                        onChange={(e) => setAssignmentDate(e.target.value)}
                                    />
                                </div>

                                {viewMode === 'assigned' && (
                                    <div className="form-group">
                                        <label className="label">Motif du changement</label>
                                        <textarea
                                            className="textarea"
                                            rows="3"
                                            placeholder="Ex: Maladie, Congé, Rééquilibrage..."
                                            value={reassignMotif}
                                            onChange={(e) => setReassignMotif(e.target.value)}
                                        />
                                    </div>
                                )}

                                {selectedDossier && selectedAgent && (
                                    <div className="selection-summary">
                                        <div className="summary-item">
                                            <span className="summary-label">Dossier:</span>
                                            <span className="summary-value uppercase">{selectedDossier.code}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="summary-label">Agent:</span>
                                            <span className="summary-value underline decoration-blue-500">{selectedAgent.NomAgent || selectedAgent.name}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="actions">
                                    <button className="btn btn-secondary" onClick={() => window.history.back()}>Fermer</button>
                                    <button
                                        className="btn btn-primary"
                                        disabled={!selectedDossier || !selectedAgent || isSubmitting}
                                        onClick={handleApply}
                                    >
                                        {isSubmitting ? 'Traitement...' : 'Appliquer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CotationPage;
