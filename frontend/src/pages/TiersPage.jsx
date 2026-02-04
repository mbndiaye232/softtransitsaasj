import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Globe, Mail, Phone, MapPin, Building2, UserCircle, Briefcase, Info, X, Save, Tag } from 'lucide-react'
import { tiersAPI, statutsAPI, activitesAPI } from '../services/api'

export default function TiersPage() {
    const [tiers, setTiers] = useState([])
    const [statuts, setStatuts] = useState([])
    const [activites, setActivites] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedActivity, setSelectedActivity] = useState('')
    const [error, setError] = useState('')

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [editingTier, setEditingTier] = useState(null)
    const [formData, setFormData] = useState({
        libtier: '',
        adresseTiers: '',
        TelTiers: '',
        CelTiers: '',
        EmailTiers: '',
        NINEATiers: '',
        SiteWeb: '',
        IDStatuts: '',
        Observations: '',
        activityIds: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [tiersRes, statutsRes, activitesRes] = await Promise.all([
                tiersAPI.getAll(),
                statutsAPI.getAll(),
                activitesAPI.getAll()
            ])
            setTiers(tiersRes.data)
            setStatuts(statutsRes.data)
            setActivites(activitesRes.data)
            setError('')
        } catch (err) {
            console.error('Failed to load data:', err)
            setError('Impossible de charger les données')
        } finally {
            setLoading(false)
        }
    }

    const loadTiers = async () => {
        try {
            const response = await tiersAPI.getAll()
            setTiers(response.data)
        } catch (err) {
            console.error('Failed to reload tiers:', err)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredTiers = tiers.filter(tier => {
        const matchesSearch =
            tier.libtier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tier.NINEATiers?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tier.EmailTiers?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesActivity = !selectedActivity ||
            (tier.activity_ids && tier.activity_ids.split(',').includes(selectedActivity.toString()));

        return matchesSearch && matchesActivity;
    })

    const handleEdit = (tier) => {
        setEditingTier(tier)
        setFormData({
            libtier: tier.libtier || '',
            adresseTiers: tier.adresseTiers || '',
            TelTiers: tier.TelTiers || '',
            CelTiers: tier.CelTiers || '',
            EmailTiers: tier.EmailTiers || '',
            NINEATiers: tier.NINEATiers || '',
            SiteWeb: tier.SiteWeb || '',
            IDStatuts: tier.IDStatuts || '',
            Observations: tier.Observations || '',
            activityIds: tier.activity_ids ? tier.activity_ids.split(',').map(Number) : []
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tiers ?')) {
            try {
                await tiersAPI.delete(id)
                loadTiers()
            } catch (err) {
                alert(err.response?.data?.error || 'Erreur lors de la suppression')
            }
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingTier(null)
        setFormData({
            libtier: '',
            adresseTiers: '',
            TelTiers: '',
            CelTiers: '',
            EmailTiers: '',
            NINEATiers: '',
            SiteWeb: '',
            IDStatuts: '',
            Observations: '',
            activityIds: []
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingTier) {
                await tiersAPI.update(editingTier.IDTiers, formData)
            } else {
                await tiersAPI.create(formData)
            }
            handleCloseModal()
            loadTiers()
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleActivityToggle = (activityId) => {
        setFormData(prev => {
            const currentIds = prev.activityIds || [];
            if (currentIds.includes(activityId)) {
                return { ...prev, activityIds: currentIds.filter(id => id !== activityId) };
            } else {
                return { ...prev, activityIds: [...currentIds, activityId] };
            }
        });
    }

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
        <div className="tiers-wrapper">
            <style>{`
                .tiers-wrapper { min-height: 100vh; background: var(--bg); padding: 2.5rem; }
                .tiers-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .view-header { display: flex; justify-content: space-between; align-items: flex-end; }
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

                .search-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 1rem 1.5rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 1rem; }
                .search-box { position: relative; flex: 1; max-width: 400px; }
                .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); width: 1.125rem; height: 1.125rem; }
                .search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.875rem; outline: none; transition: all 0.2s; }
                .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }

                .tiers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
                
                .tier-card { 
                    background: white; 
                    border-radius: var(--radius-xl); 
                    border: 1px solid var(--border); 
                    padding: 1.5rem; 
                    position: relative; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .tier-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
                
                .tier-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .tier-name { font-size: 1.125rem; font-weight: 800; color: var(--slate-900); margin: 0; line-height: 1.3; }
                
                .card-actions { display: flex; gap: 0.5rem; }
                .icon-btn { padding: 0.5rem; border-radius: 0.5rem; border: none; background: var(--slate-50); color: var(--slate-400); cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { background: var(--primary-light); color: var(--primary); }
                .icon-btn.delete:hover { background: #fef2f2; color: var(--danger); }
                
                .info-row { display: flex; align-items: center; gap: 0.75rem; color: var(--slate-600); font-size: 0.875rem; }
                .info-icon { color: var(--slate-300); }
                
                .tier-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .badge { padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; }
                .badge-ninea { background: var(--slate-100); color: var(--slate-600); border: 1px solid var(--slate-200); }
                .badge-statut { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
                .badge-activity { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-light); font-size: 0.65rem; }

                .activity-selector { display: flex; flex-direction: column; gap: 0.75rem; background: var(--slate-50); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); }
                .activity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
                .activity-item { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.5rem; border-radius: 0.375rem; transition: background 0.2s; }
                .activity-item:hover { background: white; }
                .activity-checkbox { width: 1.125rem; height: 1.125rem; border-radius: 4px; border: 2px solid var(--slate-300); appearance: none; cursor: pointer; position: relative; transition: all 0.2s; }
                .activity-checkbox:checked { background: var(--primary); border-color: var(--primary); }
                .activity-checkbox:checked::after { content: '✓'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 0.75rem; font-weight: 900; }
                .activity-label { font-size: 0.8125rem; font-weight: 600; color: var(--slate-700); }

                /* Modal Professionalism */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
                .modal-container { background: white; border-radius: var(--radius-xl); width: 100%; max-width: 600px; box-shadow: var(--shadow-premium); overflow: hidden; animation: modal-in 0.3s ease-out; }
                @keyframes modal-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .modal-header { padding: 1.5rem 2rem; background: var(--surface-header); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
                .modal-title { font-size: 1.25rem; font-weight: 800; color: var(--slate-900); }
                
                .modal-body { padding: 2rem; max-height: 70vh; overflow-y: auto; }
                .modal-footer { padding: 1.5rem 2rem; background: var(--slate-50); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 1rem; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .form-col-full { grid-column: span 2; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-label { font-size: 0.75rem; font-weight: 700; color: var(--slate-600); }
                
                .premium-input, .premium-select, .premium-textarea { 
                    width: 100%; 
                    padding: 0.75rem 1rem; 
                    border: 1px solid var(--border); 
                    border-radius: var(--radius-md); 
                    font-size: 0.875rem; 
                    outline: none; 
                    transition: all 0.2s; 
                }
                .premium-input:focus, .premium-select:focus, .premium-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
            `}</style>

            <div className="tiers-container">
                <header className="view-header">
                    <div className="title-area">
                        <h1>
                            <Briefcase size={32} color="var(--primary)" />
                            Gestion des Tiers
                        </h1>
                        <p>Centralisez les informations de vos partenaires commerciaux.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="action-btn">
                        <Plus size={20} />
                        Nouveau Tiers
                    </button>
                </header>

                <div className="search-card">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Rechercher par nom, NINEA, email..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Tag size={16} color="var(--slate-400)" />
                        <select
                            className="premium-select"
                            style={{ padding: '0.5rem 1rem', width: 'auto', minWidth: '180px' }}
                            value={selectedActivity}
                            onChange={(e) => setSelectedActivity(e.target.value)}
                        >
                            <option value="">Toutes les activités</option>
                            {activites.map(act => (
                                <option key={act.id_activite} value={act.id_activite}>{act.libelle}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-400)' }}>
                        {filteredTiers.length} TIERS ENREGISTRÉS
                    </div>
                </div>

                {error && <div className="premium-card" style={{ padding: '1rem 2rem', color: 'var(--danger)', fontWeight: 600 }}>{error}</div>}

                <div className="tiers-grid">
                    {filteredTiers.map(tier => (
                        <div key={tier.IDTiers} className="tier-card">
                            <div className="tier-header">
                                <h3 className="tier-name">{tier.libtier}</h3>
                                <div className="card-actions">
                                    <button onClick={() => handleEdit(tier)} className="icon-btn" title="Modifier">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(tier.IDTiers)} className="icon-btn delete" title="Supprimer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="tier-badges">
                                {tier.NINEATiers && <span className="badge badge-ninea">NINEA: {tier.NINEATiers}</span>}
                                {tier.statut_label && <span className="badge badge-statut">{tier.statut_label}</span>}
                                {tier.activity_labels && tier.activity_labels.split(',').map((label, idx) => (
                                    <span key={idx} className="badge badge-activity">{label}</span>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
                                {tier.adresseTiers && (
                                    <div className="info-row">
                                        <MapPin size={16} className="info-icon" />
                                        <span>{tier.adresseTiers}</span>
                                    </div>
                                )}
                                {tier.EmailTiers && (
                                    <div className="info-row">
                                        <Mail size={16} className="info-icon" />
                                        <a href={`mailto:${tier.EmailTiers}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{tier.EmailTiers}</a>
                                    </div>
                                )}
                                {(tier.TelTiers || tier.CelTiers) && (
                                    <div className="info-row">
                                        <Phone size={16} className="info-icon" />
                                        <span style={{ fontWeight: 600 }}>{tier.TelTiers} {tier.CelTiers ? ` / ${tier.CelTiers}` : ''}</span>
                                    </div>
                                )}
                                {tier.SiteWeb && (
                                    <div className="info-row">
                                        <Globe size={16} className="info-icon" />
                                        <a href={tier.SiteWeb} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--slate-500)' }}>{tier.SiteWeb}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTiers.length === 0 && (
                    <div className="empty-view" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                        <Info size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--slate-400)' }}>Aucun tiers ne correspond à votre recherche</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingTier ? 'Modifier le Tiers' : 'Créer un Nouveau Tiers'}</h2>
                            <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Libellé / Nom de l'entreprise *</label>
                                        <input
                                            name="libtier"
                                            className="premium-input"
                                            value={formData.libtier}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">NINEA</label>
                                        <input
                                            name="NINEATiers"
                                            className="premium-input"
                                            value={formData.NINEATiers}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Statut</label>
                                        <select
                                            name="IDStatuts"
                                            className="premium-select"
                                            value={formData.IDStatuts}
                                            onChange={handleChange}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {statuts.map(s => (
                                                <option key={s.IDStatuts} value={s.IDStatuts}>{s.libelle}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Téléphone</label>
                                        <input
                                            name="TelTiers"
                                            className="premium-input"
                                            value={formData.TelTiers}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Mobile</label>
                                        <input
                                            name="CelTiers"
                                            className="premium-input"
                                            value={formData.CelTiers}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Email Professionnel</label>
                                        <input
                                            type="email"
                                            name="EmailTiers"
                                            className="premium-input"
                                            value={formData.EmailTiers}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Adresse Physique</label>
                                        <input
                                            name="adresseTiers"
                                            className="premium-input"
                                            value={formData.adresseTiers}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Site Web</label>
                                        <input
                                            name="SiteWeb"
                                            className="premium-input"
                                            value={formData.SiteWeb}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Observations</label>
                                        <textarea
                                            name="Observations"
                                            className="premium-textarea"
                                            value={formData.Observations}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="input-group form-col-full">
                                        <label className="input-label">Activités</label>
                                        <div className="activity-selector">
                                            <div className="activity-grid">
                                                {activites.map(act => (
                                                    <label key={act.id_activite} className="activity-item">
                                                        <input
                                                            type="checkbox"
                                                            className="activity-checkbox"
                                                            checked={formData.activityIds?.includes(act.id_activite)}
                                                            onChange={() => handleActivityToggle(act.id_activite)}
                                                        />
                                                        <span className="activity-label">{act.libelle}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                                <button type="submit" className="action-btn">
                                    <Save size={18} />
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
