import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersAPI, groupesAPI } from '../services/api'
import PermissionMatrix from '../components/PermissionMatrix'
import {
    Save,
    X,
    User,
    Mail,
    Phone,
    Smartphone,
    MapPin,
    Briefcase,
    Key,
    Shield,
    Layers,
    Lock,
    Info,
    CheckCircle,
    ChevronLeft,
    UserCircle
} from 'lucide-react'

export default function UserForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = Boolean(id)

    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [groupes, setGroupes] = useState([])
    const [permissions, setPermissions] = useState([])
    const [allPermissions, setAllPermissions] = useState([])

    const [formData, setFormData] = useState({
        NomAgent: '',
        Email: '',
        Login: '',
        password: '',
        role: 'USER',
        FonctionAgent: '',
        Tel: '',
        Cel: '',
        adresse: '',
        IDGroupes: ''
    })

    useEffect(() => {
        loadGroupes()
        loadAllPermissions()
        if (isEdit) {
            loadUser()
        }
    }, [id])

    const loadGroupes = async () => {
        try {
            const response = await groupesAPI.getAll()
            setGroupes(response.data)
        } catch (err) {
            console.error('Failed to load groups:', err)
        }
    }

    const loadAllPermissions = async () => {
        try {
            const response = await usersAPI.getPermissionsList()
            setAllPermissions(response.data)
        } catch (err) {
            console.error('Failed to load permissions list:', err)
        }
    }

    const loadUser = async () => {
        try {
            const response = await usersAPI.getOne(id)
            const user = response.data
            setFormData({
                NomAgent: user.name || '',
                Email: user.email || '',
                Login: user.login || '',
                password: '', // Don't load password
                role: user.role || 'USER',
                FonctionAgent: user.function || '',
                Tel: user.phone || '',
                Cel: user.mobile || '',
                adresse: user.address || '',
                IDGroupes: user.IDGroupes || ''
            })

            // Load permissions
            try {
                const permResponse = await usersAPI.getPermissions(id)
                setPermissions(permResponse.data)
            } catch (permErr) {
                console.error('Failed to load permissions:', permErr)
            }

        } catch (err) {
            setError('Impossible de charger l\'utilisateur')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        try {
            let userId = id

            if (isEdit) {
                await usersAPI.update(id, formData)
                setSuccess('Utilisateur modifié avec succès')
            } else {
                const response = await usersAPI.create(formData)
                userId = response.data.id
                setSuccess('Utilisateur créé avec succès')
            }

            // Save permissions
            if (permissions.length > 0) {
                const permissionsToSave = permissions.map(p => {
                    if (p.permission_id) return p
                    const def = allPermissions.find(ap => ap.code === p.code)
                    return {
                        ...p,
                        permission_id: def ? def.id : null
                    }
                }).filter(p => p.permission_id)

                await usersAPI.updatePermissions(userId, permissionsToSave)
            }

            setTimeout(() => navigate('/users'), 1500)
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
            console.error(err)
        } finally {
            setSaving(false)
        }
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
        <div className="user-form-wrapper">
            <style>{`
                .user-form-wrapper { min-height: 100vh; background: var(--bg); padding: 2.5rem; }
                .user-form-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .header-nav { display: flex; justify-content: space-between; align-items: flex-end; }
                .back-btn { display: flex; align-items: center; gap: 0.5rem; color: var(--slate-500); text-decoration: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; background: none; }
                .back-btn:hover { color: var(--primary); }
                
                .title-box h1 { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); margin: 0.5rem 0 0 0; }
                
                .form-main { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
                .form-strip { padding: 1rem 2.5rem; background: var(--slate-50); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
                .form-strip h2 { font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
                
                .form-body { padding: 2.5rem; }
                .form-section { margin-bottom: 3.5rem; }
                .form-section:last-child { margin-bottom: 0; }
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--slate-100); }
                .section-title { font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; }
                
                .grid-form { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
                .col-4 { grid-column: span 4; }
                .col-6 { grid-column: span 6; }
                .col-8 { grid-column: span 8; }
                .col-12 { grid-column: span 12; }
                @media (max-width: 768px) { .col-4, .col-6, .col-8 { grid-column: span 12; } }
                
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
                .premium-input:focus, .premium-select:focus, .premium-textarea:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-light); }
                
                .alert { padding: 1rem 1.5rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
                .alert-error { background: #fef2f2; color: var(--danger); border: 1px solid #fee2e2; }
                .alert-success { background: #ecfdf5; color: var(--success); border: 1px solid #d1fae5; }
                .alert-info { background: var(--primary-light); color: var(--primary); border: 1px solid color-mix(in srgb, var(--primary), transparent 80%); }

                .form-footer { padding: 1.5rem 2.5rem; background: var(--surface-header); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 1rem; }
                .btn { padding: 0.75rem 2rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-secondary { background: white; color: var(--slate-600); border: 1px solid var(--border); }
                .btn-secondary:hover { background: var(--slate-50); border-color: var(--slate-300); }
                .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
                .btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.3); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            `}</style>

            <div className="user-form-container">
                <nav className="header-nav">
                    <div className="title-box">
                        <button className="back-btn" onClick={() => navigate('/users')}>
                            <ChevronLeft size={16} />
                            Liste des agents
                        </button>
                        <h1>{isEdit ? 'Profil de l\'Agent' : 'Recrutement Nouvel Agent'}</h1>
                    </div>
                </nav>

                {error && <div className="alert alert-error"><Info size={16} />{error}</div>}
                {success && <div className="alert alert-success"><CheckCircle size={16} />{success}</div>}

                <form className="form-main" onSubmit={handleSubmit}>
                    <div className="form-strip">
                        <h2>Fiche d'immatriculation agent</h2>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.5 }}></div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.2 }}></div>
                        </div>
                    </div>

                    <div className="form-body">
                        {/* Identité Personnelle */}
                        <div className="form-section">
                            <div className="section-header">
                                <UserCircle size={14} />
                                <span className="section-title">Identité Personnelle</span>
                            </div>
                            <div className="grid-form">
                                <div className="input-group col-8">
                                    <label className="input-label">Prénom & Nom *</label>
                                    <input name="NomAgent" className="premium-input" value={formData.NomAgent} onChange={handleChange} required placeholder="Nom complet de l'agent" />
                                </div>
                                <div className="input-group col-4">
                                    <label className="input-label">Fonction / Poste</label>
                                    <input name="FonctionAgent" className="premium-input" value={formData.FonctionAgent} onChange={handleChange} placeholder="Ex: Déclarant Sénior" />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Adresse Email *</label>
                                    <input type="email" name="Email" className="premium-input" value={formData.Email} onChange={handleChange} required placeholder="email@votre-domaine.com" />
                                </div>
                                <div className="input-group col-3">
                                    <label className="input-label">Téléphone Fixe</label>
                                    <input name="Tel" className="premium-input" value={formData.Tel} onChange={handleChange} />
                                </div>
                                <div className="input-group col-3">
                                    <label className="input-label">Mobile Direct</label>
                                    <input name="Cel" className="premium-input" value={formData.Cel} onChange={handleChange} />
                                </div>
                                <div className="input-group col-12">
                                    <label className="input-label">Adresse Domicile</label>
                                    <input name="adresse" className="premium-input" value={formData.adresse} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Informations de Connexion */}
                        <div className="form-section">
                            <div className="section-header">
                                <Lock size={14} />
                                <span className="section-title">Compte & Accès Système</span>
                            </div>
                            <div className="grid-form">
                                <div className="input-group col-4">
                                    <label className="input-label">Nom d'utilisateur (Login) *</label>
                                    <input name="Login" className="premium-input" value={formData.Login} onChange={handleChange} required placeholder="Identifiant unique" />
                                </div>
                                <div className="input-group col-4">
                                    <label className="input-label">Mot de Passe {isEdit ? '(Laisser vide pour garder l\'actuel)' : '*'}</label>
                                    <input type="password" name="password" className="premium-input" value={formData.password} onChange={handleChange} required={!isEdit} autoComplete="new-password" />
                                </div>
                                <div className="input-group col-4">
                                    <label className="input-label">Rôle d'Accès Global *</label>
                                    <select name="role" className="premium-select" value={formData.role} onChange={handleChange} required>
                                        <option value="USER">Collaborateur (Droits restreints)</option>
                                        <option value="ADMIN">Administrateur (Contrôle total)</option>
                                    </select>
                                </div>
                                <div className="input-group col-12">
                                    <label className="input-label">Service / Groupe de Travail</label>
                                    <select name="IDGroupes" className="premium-select" value={formData.IDGroupes} onChange={handleChange}>
                                        <option value="">Affectation par défaut</option>
                                        {groupes.map(g => <option key={g.IDGroupes} value={g.IDGroupes}>{g.LibelleGroupe}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Détaillées */}
                        <div className="form-section">
                            <div className="section-header">
                                <Shield size={14} />
                                <span className="section-title">Matrice des Permissions</span>
                            </div>
                            <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
                                <Info size={16} />
                                <div>
                                    {formData.role === 'ADMIN'
                                        ? "Les administrateurs héritent de tous les privilèges. Vous pouvez néanmoins affiner ces droits ci-dessous."
                                        : "Définissez précisément les modules auxquels cet agent peut accéder."}
                                </div>
                            </div>

                            <div className="permission-area" style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                                <PermissionMatrix permissions={permissions} onChange={setPermissions} />
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="button" onClick={() => navigate('/users')} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={18} />
                            {saving ? 'Enregistrement...' : isEdit ? 'Sauvegarder les modifications' : 'Créer l\'agent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
