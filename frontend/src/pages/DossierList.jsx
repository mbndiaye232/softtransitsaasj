import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dossiersAPI } from '../services/api';
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronRight,
    Ship,
    Plane,
    Truck,
    Info
} from 'lucide-react';

const DossierList = () => {
    const navigate = useNavigate();
    const [dossiers, setDossiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDossiers();
    }, []);

    const fetchDossiers = async () => {
        try {
            setLoading(true);
            const response = await dossiersAPI.getAll();
            setDossiers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dossiers:', err);
            setError('Impossible de charger les dossiers. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
            try {
                await dossiersAPI.delete(id);
                setDossiers(dossiers.filter(d => d.id !== id));
            } catch (err) {
                console.error('Error deleting dossier:', err);
                alert('Erreur lors de la suppression du dossier');
            }
        }
    };

    const getModeIcon = (mode) => {
        switch (mode) {
            case 'MA': return <Ship size={14} />;
            case 'AE': return <Plane size={14} />;
            case 'TE': return <Truck size={14} />;
            default: return <FileText size={14} />;
        }
    };

    const filteredDossiers = dossiers.filter(dossier =>
        dossier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="view-loading">
            <div className="spinner"></div>
            <style>{`
                .view-loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--bg); }
                .spinner { width: 40px; height: 40px; border: 3px solid var(--slate-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    return (
        <div className="page-wrapper">
            <style>{`
                .page-wrapper { min-height: 100vh; background: var(--bg); padding: 2.5rem; }
                .page-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .view-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
                .title-area h1 { font-size: 1.75rem; font-weight: 800; color: var(--slate-900); display: flex; align-items: center; gap: 0.75rem; margin: 0; letter-spacing: -0.02em; }
                .title-area p { font-size: 0.875rem; color: var(--slate-500); margin: 0.25rem 0 0 0; font-weight: 500; }
                
                .action-btn { 
                    padding: 0.75rem 1.5rem; 
                    background: var(--primary); 
                    color: white; 
                    border-radius: var(--radius-md); 
                    font-weight: 700; 
                    font-size: 0.875rem; 
                    border: none; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.625rem; 
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); 
                    transition: all 0.2s; 
                }
                .action-btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.3); }

                .list-card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
                .filter-bar { padding: 1.25rem 2rem; border-bottom: 1px solid var(--border-light); background: var(--surface-header); display: flex; justify-content: space-between; align-items: center; }
                
                .search-box { position: relative; width: 320px; }
                .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); width: 1.125rem; height: 1.125rem; }
                .search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.875rem; outline: none; transition: all 0.2s; }
                .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
                
                .table-scroll { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 1.25rem 1.5rem; background: var(--slate-50); font-size: 0.75rem; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
                td { padding: 1.25rem 1.5rem; font-size: 0.875rem; border-bottom: 1px solid var(--slate-50); color: var(--slate-700); }
                
                .tr-row { transition: all 0.2s; cursor: pointer; }
                .tr-row:hover { background: var(--slate-50); }
                
                .code-pill { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 0.25rem 0.625rem; border-radius: var(--radius-sm); font-size: 0.8125rem; border: 1px solid color-mix(in srgb, var(--primary), transparent 85%); }
                .client-name { font-weight: 700; color: var(--slate-900); }
                .label-text { font-size: 0.8125rem; color: var(--slate-500); display: block; margin-top: 0.125rem; }
                
                .badge { padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.375rem; }
                .badge-blue { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
                .badge-green { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
                .badge-amber { background: #fffbeb; color: #92400e; border: 1px solid #fef3c7; }
                
                .mode-badge { display: flex; align-items: center; gap: 0.5rem; color: var(--slate-600); font-size: 0.8125rem; font-weight: 600; }
                
                .row-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
                .icon-btn { padding: 0.5rem; border-radius: 0.5rem; border: none; background: transparent; color: var(--slate-400); cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { background: var(--slate-100); color: var(--slate-900); }
                .icon-btn.delete:hover { background: #fef2f2; color: var(--danger); }
                
                .empty-view { padding: 6rem 2rem; text-align: center; color: var(--slate-400); }
            `}</style>

            <div className="page-container">
                <header className="view-header">
                    <div className="title-area">
                        <h1>
                            <FileText size={32} color="var(--primary)" />
                            Gestion des Dossiers
                        </h1>
                        <p>Visualisez et gérez l'ensemble de vos opérations de transit.</p>
                    </div>
                    <button onClick={() => navigate('/dossiers/new')} className="action-btn">
                        <Plus size={20} />
                        Nouveau Dossier
                    </button>
                </header>

                {error && (
                    <div className="premium-card" style={{ padding: '1rem 2rem', color: 'var(--danger)', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                <div className="list-card">
                    <div className="filter-bar">
                        <div className="search-box">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher code, libellé, client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-400)' }}>
                                {filteredDossiers.length} DOSSIERS
                            </span>
                        </div>
                    </div>

                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Identifiant</th>
                                    <th>Détails du dossier</th>
                                    <th>Destination / Client</th>
                                    <th>Flux / Mode</th>
                                    <th>État</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDossiers.length > 0 ? (
                                    filteredDossiers.map((dossier) => (
                                        <tr
                                            key={dossier.id}
                                            className="tr-row"
                                            onClick={() => navigate(`/dossiers/${dossier.id}`)}
                                        >
                                            <td>
                                                <span className="code-pill">{dossier.code}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{dossier.label}</span>
                                                <span className="label-text">{dossier.nature === 'IMP' ? 'Importation' : 'Exportation'}</span>
                                            </td>
                                            <td>
                                                <span className="client-name">{dossier.clientName || '---'}</span>
                                                <span className="label-text">ID: {dossier.clientId || 'N/A'}</span>
                                            </td>
                                            <td>
                                                <div className="mode-badge">
                                                    {getModeIcon(dossier.mode)}
                                                    {dossier.mode === 'MA' ? 'Maritime' : dossier.mode === 'AE' ? 'Aérien' : 'Routier'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${dossier.status === 'CLOSED' ? 'badge-amber' : 'badge-green'}`}>
                                                    {dossier.status === 'CLOSED' ? 'Clôturé' : 'En cours'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button className="icon-btn" title="Modifier">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-btn delete"
                                                        title="Supprimer"
                                                        onClick={(e) => handleDelete(e, dossier.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="icon-btn">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="empty-view">
                                                <Info size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                                <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>Aucun dossier disponible</p>
                                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{searchTerm ? 'Affines vos critères de recherche.' : 'Commencez par créer votre premier dossier.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DossierList;
