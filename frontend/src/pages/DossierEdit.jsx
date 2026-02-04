import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dossiersAPI, clientsAPI, authAPI } from '../services/api';
import CotationManager from '../components/dossiers/CotationManager';
import OrdreTransitManager from '../components/dossiers/OrdreTransitManager';
import {
    Save,
    X,
    Link as LinkIcon,
    FileText,
    User,
    Phone,
    Mail,
    Info,
    Settings,
    CheckCircle,
    Building2,
    Briefcase,
    FileSearch,
    ChevronLeft,
    Shield
} from 'lucide-react';

const DossierEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [dossierInfo, setDossierInfo] = useState(null);

    const [form, setForm] = useState({
        label: '',
        nature: 'IMP',
        mode: 'MA',
        type: 'TC',
        description: '',
        contactId: '',
        isFacturable: false,
        dpiNumber: '',
        quotationStep: false,
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        observations: '',
        clientId: ''
    });

    const [editCode, setEditCode] = useState(false);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('detail');

    const tabs = [
        { id: 'detail', label: 'Détails du Dossier', icon: <Info size={18} /> },
        { id: 'cotation', label: 'Cotation / Agent', icon: <User size={18} /> },
        { id: 'ot', label: 'Ordre de Transit', icon: <FileText size={18} /> },
        { id: 'transport', label: 'Titre de Transport', icon: <LinkIcon size={18} />, disabled: true },
        { id: 'declaration', label: 'Déclaration', icon: <Shield size={18} />, disabled: true }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dossierRes, clientsRes, userRes] = await Promise.all([
                    dossiersAPI.getOne(id),
                    clientsAPI.getAll(),
                    authAPI.getMe()
                ]);

                const data = dossierRes.data;
                setDossierInfo(data);
                setClients(clientsRes.data);
                setCurrentUser(userRes.data);

                setForm({
                    label: data.label,
                    nature: data.nature,
                    mode: data.mode,
                    type: data.type,
                    description: data.description || '',
                    contactId: data.contactId || '',
                    isFacturable: data.isFacturable === 1 || data.isFacturable === true,
                    dpiNumber: data.dpiNumber || '',
                    quotationStep: data.quotationStep === 1 || data.quotationStep === true,
                    contactName: data.contactName || '',
                    contactPhone: data.contactPhone || '',
                    contactEmail: data.contactEmail || '',
                    observations: data.observations || '',
                    clientId: data.clientId || ''
                });
            } catch (err) {
                console.error('Fetch data error:', err);
                setError('Échec du chargement des données du dossier');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                formData.append(key, form[key]);
            });
            formData.append('editCode', editCode);

            if (file) {
                formData.append('file', file);
            }

            await dossiersAPI.update(id, formData);
            navigate('/dossiers');
        } catch (err) {
            console.error('Update dossier error:', err);
            setError(err.response?.data?.error || 'Échec de la mise à jour');
        }
    };

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

    const clientName = clients.find(c => c.IDClients === form.clientId)?.NomClient || 'Client inconnu';

    return (
        <div className="edit-wrapper">
            <style>{`
                .edit-wrapper { min-height: 100vh; background: var(--bg); padding: 2.5rem; }
                .edit-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .edit-header { display: flex; justify-content: space-between; align-items: center; }
                .back-link { display: flex; align-items: center; gap: 0.5rem; color: var(--slate-500); text-decoration: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
                .back-link:hover { color: var(--primary); }
                
                .header-title-box h1 { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); margin: 0.5rem 0 0 0; }
                
                /* Tab System */
                .tab-bar { display: flex; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 1rem; border: 1px solid var(--border); margin-bottom: 1rem; position: sticky; top: 1rem; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .tab-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; color: var(--slate-500); cursor: pointer; transition: all 0.2s; border: none; background: transparent; }
                .tab-item:hover:not(.disabled) { background: var(--slate-50); color: var(--slate-900); }
                .tab-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px color-mix(in srgb, var(--primary), transparent 70%); }
                .tab-item.disabled { opacity: 0.5; cursor: not-allowed; }

                .form-main { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
                .client-strip { padding: 1.25rem 2rem; background: var(--primary-light); border-bottom: 1px solid color-mix(in srgb, var(--primary), transparent 90%); display: flex; align-items: center; gap: 1rem; }
                .client-strip h2 { font-size: 0.875rem; font-weight: 800; color: var(--primary); margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .form-content { padding: 2.5rem 3rem; }
                .form-section { margin-bottom: 3rem; }
                .form-section:last-child { margin-bottom: 0; }
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--slate-100); }
                .section-title { font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; }
                
                .grid-form { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
                .col-2 { grid-column: span 2; }
                .col-3 { grid-column: span 3; }
                .col-4 { grid-column: span 4; }
                .col-6 { grid-column: span 6; }
                .col-12 { grid-column: span 12; }
                @media (max-width: 768px) { .col-2, .col-3, .col-4, .col-6 { grid-column: span 12; } }
                
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-label { font-size: 0.75rem; font-weight: 700; color: var(--slate-600); }
                .premium-input, .premium-select, .premium-textarea { 
                    width: 100%; 
                    padding: 0.75rem 1rem; 
                    border: 1px solid var(--border); 
                    border-radius: var(--radius-md); 
                    font-size: 0.875rem; 
                    outline: none; 
                    background: var(--slate-50); 
                    transition: all 0.2s; 
                }
                .premium-input:focus, .premium-select:focus, .premium-textarea:focus { 
                    border-color: var(--primary); 
                    background: white; 
                    box-shadow: 0 0 0 4px var(--primary-light); 
                }
                .premium-input:read-only { background: #f1f5f9; color: var(--slate-400); border-style: dashed; }
                
                .input-with-actions { display: flex; gap: 0.5rem; }
                .mini-btn { padding: 0.5rem; background: var(--slate-100); border: none; border-radius: 0.5rem; cursor: pointer; color: var(--slate-500); }
                .mini-btn:hover { background: var(--slate-200); color: var(--slate-900); }
                .mini-btn.active { background: var(--primary); color: white; }
                
                .checkbox-card { 
                    background: #f8fafc; 
                    padding: 1.25rem; 
                    border-radius: var(--radius-md); 
                    border: 1px solid var(--border); 
                    display: flex; 
                    align-items: center; 
                    gap: 1rem; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .checkbox-card:hover { border-color: var(--primary); background: var(--primary-light); }
                .checkbox-card input { width: 1.25rem; height: 1.25rem; accent-color: var(--primary); }
                .checkbox-label { font-size: 0.875rem; font-weight: 700; color: var(--slate-900); }
                
                .footer-actions { padding: 1.5rem 3rem; background: var(--surface-header); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 1rem; }
                .btn { padding: 0.75rem 2rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-secondary { background: white; color: var(--slate-600); border: 1px solid var(--border); }
                .btn-secondary:hover { background: var(--slate-50); border-color: var(--slate-300); }
                .btn-primary { background: var(--primary); color: white; box-shadow: var(--shadow); }
                .btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); }
            `}</style>

            <div className="edit-container">
                <header className="edit-header">
                    <div className="header-title-box">
                        <div className="back-link" onClick={() => navigate('/dossiers')}>
                            <ChevronLeft size={16} />
                            Retour à la liste
                        </div>
                        <h1>Modifier le Dossier <span style={{ color: 'var(--primary)' }}>{dossierInfo?.code}</span></h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Code Court</div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--slate-700)' }}>{dossierInfo?.shortCode}</div>
                    </div>
                </header>

                <nav className="tab-bar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`tab-item ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {activeTab === 'detail' && (
                    <form className="form-main" onSubmit={handleSubmit}>
                        <div className="client-strip">
                            <Building2 size={20} color="var(--primary)" />
                            <h2>Client : <span style={{ color: 'var(--slate-900)' }}>{clientName}</span></h2>
                        </div>

                        <div className="form-content">
                            {/* Section 1: Informations Générales */}
                            <div className="form-section">
                                <div className="section-header">
                                    <FileSearch size={14} color="var(--slate-400)" />
                                    <span className="section-title">Identification & Type</span>
                                </div>

                                <div className="grid-form">
                                    <div className="input-group col-4">
                                        <label className="input-label">Libellé du dossier</label>
                                        <input
                                            name="label"
                                            className="premium-input"
                                            value={form.label}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group col-2">
                                        <label className="input-label">Nature</label>
                                        <select
                                            name="nature"
                                            className="premium-select"
                                            value={form.nature}
                                            onChange={handleChange}
                                            disabled={!editCode}
                                        >
                                            <option value="IMP">Importation</option>
                                            <option value="EXP">Exportation</option>
                                        </select>
                                    </div>
                                    <div className="input-group col-2">
                                        <label className="input-label">Expédition</label>
                                        <select
                                            name="mode"
                                            className="premium-select"
                                            value={form.mode}
                                            onChange={handleChange}
                                            disabled={!editCode}
                                        >
                                            <option value="MA">Maritime</option>
                                            <option value="AE">Aérien</option>
                                            <option value="TE">Terrestre</option>
                                        </select>
                                    </div>
                                    <div className="input-group col-2">
                                        <label className="input-label">Type</label>
                                        <select
                                            name="type"
                                            className="premium-select"
                                            value={form.type}
                                            onChange={handleChange}
                                            disabled={!editCode}
                                        >
                                            <option value="TC">Conteneur</option>
                                            <option value="GR">Groupage</option>
                                            <option value="CO">Conv.</option>
                                        </select>
                                    </div>
                                    <div className="input-group col-2">
                                        <label className="input-label">Document</label>
                                        <input
                                            className="premium-input"
                                            readOnly
                                            value={form.mode === 'MA' ? 'BL' : form.mode === 'AE' ? 'LTA' : 'LVI'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Validation & Fichiers */}
                            <div className="form-section">
                                <div className="section-header">
                                    <Shield size={14} color="var(--slate-400)" />
                                    <span className="section-title">Validation & Fiches</span>
                                </div>

                                <div className="grid-form">
                                    <div className="input-group col-4">
                                        <label className="input-label">Numéro de dossier</label>
                                        <div className="input-with-actions">
                                            <input className="premium-input" readOnly value={dossierInfo?.code || ''} />
                                            <button
                                                type="button"
                                                className={`mini-btn ${editCode ? 'active' : ''}`}
                                                onClick={() => setEditCode(!editCode)}
                                                title="Modifier les champs verrouillés"
                                            >
                                                <Settings size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="input-group col-4">
                                        <label className="input-label">Validé par</label>
                                        <input className="premium-input" readOnly value={currentUser?.name || ''} />
                                    </div>
                                    <div className="input-group col-4">
                                        <label className="input-label">Fiche Dossier (Scan)</label>
                                        <input type="file" className="premium-input" onChange={handleFileChange} style={{ padding: '0.5rem' }} />
                                        {dossierInfo?.fileUrl && (
                                            <a
                                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${dossierInfo.fileUrl}`}
                                                target="_blank"
                                                className="back-link"
                                                style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}
                                            >
                                                <LinkIcon size={12} /> Voir la fiche actuelle
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Contact & Observations */}
                            <div className="form-section">
                                <div className="section-header">
                                    <User size={14} color="var(--slate-400)" />
                                    <span className="section-title">Contact & Suivi</span>
                                </div>

                                <div className="grid-form">
                                    <div className="input-group col-4">
                                        <label className="input-label">Point focal</label>
                                        <input name="contactName" className="premium-input" value={form.contactName} onChange={handleChange} placeholder="Nom du contact..." />
                                    </div>
                                    <div className="input-group col-4">
                                        <label className="input-label">Téléphone</label>
                                        <input name="contactPhone" className="premium-input" value={form.contactPhone} onChange={handleChange} placeholder="+221..." />
                                    </div>
                                    <div className="input-group col-4">
                                        <label className="input-label">Email</label>
                                        <input name="contactEmail" className="premium-input" value={form.contactEmail} onChange={handleChange} placeholder="email@domaine.com" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Observations / Notes</label>
                                        <textarea name="observations" rows="3" className="premium-textarea" value={form.observations} onChange={handleChange} placeholder="Commentaires internes..." />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                <div className="checkbox-card" onClick={() => handleChange({ target: { name: 'isFacturable', type: 'checkbox', checked: !form.isFacturable } })}>
                                    <input type="checkbox" checked={form.isFacturable} readOnly />
                                    <div>
                                        <div className="checkbox-label">Prêt pour facturation</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Marquer comme éligible à la clôture financière</div>
                                    </div>
                                </div>
                                <div className="checkbox-card" onClick={() => handleChange({ target: { name: 'quotationStep', type: 'checkbox', checked: !form.quotationStep } })}>
                                    <input type="checkbox" checked={form.quotationStep} readOnly />
                                    <div>
                                        <div className="checkbox-label">Étape de Cotation</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Requiert l'imputation d'un déclarant</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="footer-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dossiers')}>Annuler</button>
                            <button type="submit" className="btn btn-primary">
                                <Save size={18} />
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'cotation' && (
                    <div className="premium-card" style={{ padding: '0.5rem' }}>
                        <CotationManager dossierId={id} />
                    </div>
                )}

                {activeTab === 'ot' && (
                    <div className="premium-card" style={{ padding: '0.5rem' }}>
                        <OrdreTransitManager dossierId={id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DossierEdit;
