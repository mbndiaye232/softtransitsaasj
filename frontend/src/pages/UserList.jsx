import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import {
    Users,
    UserPlus,
    Search,
    Edit,
    UserMinus,
    UserCheck,
    Shield,
    Mail,
    Key,
    Layers,
    MoreHorizontal,
    Info,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react'

export default function UserList() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [filter, setFilter] = useState('all') // all, active, inactive
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const response = await usersAPI.getAll()
            setUsers(response.data)
        } catch (err) {
            setError('Impossible de charger les agents')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeactivate = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir désactiver cet agent ?')) return

        try {
            await usersAPI.delete(id)
            setSuccess('Agent désactivé avec succès')
            loadUsers()
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Impossible de désactiver l\'agent')
            console.error(err)
        }
    }

    const handleReactivate = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir réactiver cet agent ?')) return

        try {
            await usersAPI.reactivate(id)
            setSuccess('Agent réactivé avec succès')
            loadUsers()
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Impossible de réactiver l\'agent')
            console.error(err)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && user.is_active === 1) ||
            (filter === 'inactive' && user.is_active === 0)

        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.login?.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

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
        <div className="users-wrapper">
            <style>{`
                .users-wrapper { min-height: 100vh; background: var(--bg); padding: 2.5rem; }
                .users-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }
                
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

                .filter-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 1rem 1.5rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
                .filter-tabs { display: flex; background: var(--slate-50); padding: 0.25rem; border-radius: 0.75rem; border: 1px solid var(--border-light); }
                .filter-tab { padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 700; color: var(--slate-500); cursor: pointer; border: none; background: transparent; transition: all 0.2s; }
                .filter-tab.active { background: white; color: var(--primary); box-shadow: var(--shadow-sm); }
                
                .search-box { position: relative; flex: 1; max-width: 320px; }
                .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); width: 1rem; height: 1rem; }
                .search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.25rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 0.8125rem; outline: none; }
                .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }

                .table-container { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
                .premium-table { width: 100%; border-collapse: collapse; }
                .premium-table th { background: var(--slate-50); padding: 1.25rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-light); }
                .premium-table td { padding: 1.25rem 1.5rem; font-size: 0.875rem; color: var(--slate-600); border-bottom: 1px solid var(--border-light); }
                .premium-table tr:last-child td { border-bottom: none; }
                .premium-table tr:hover td { background: var(--slate-50); }
                
                .user-info { display: flex; align-items: center; gap: 1rem; }
                .user-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.875rem; border: 2px solid white; box-shadow: 0 0 0 1px var(--primary); }
                .user-name { font-weight: 800; color: var(--slate-900); display: block; }
                .user-email { font-size: 0.75rem; color: var(--slate-400); }

                .role-badge { padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 0.375rem; width: fit-content; }
                .role-admin { background: #fee2e2; color: #991b1b; }
                .role-editor { background: #eef2ff; color: #3730a3; }
                .role-user { background: #f1f5f9; color: #475569; }

                .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-active { color: var(--success); }
                .status-active .status-dot { background: var(--success); box-shadow: 0 0 0 3px #d1fae5; }
                .status-inactive { color: var(--danger); }
                .status-inactive .status-dot { background: var(--danger); box-shadow: 0 0 0 3px #fee2e2; }

                .actions-cell { display: flex; justify-content: flex-end; gap: 0.5rem; }
                .action-btn-mini { padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border); background: white; color: var(--slate-400); cursor: pointer; transition: all 0.2s; }
                .action-btn-mini:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
                .action-btn-mini.danger:hover { border-color: var(--danger); color: var(--danger); background: #fef2f2; }
                .action-btn-mini.success:hover { border-color: var(--success); color: var(--success); background: #ecfdf5; }

                .alert { padding: 1rem 1.5rem; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
                .alert-error { background: #fef2f2; color: var(--danger); border: 1px solid #fee2e2; }
                .alert-success { background: #ecfdf5; color: var(--success); border: 1px solid #d1fae5; }
            `}</style>

            <div className="users-container">
                <header className="view-header">
                    <div className="title-area">
                        <button className="back-btn" onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--slate-500)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                            <ChevronLeft size={14} /> Tableau de bord
                        </button>
                        <h1>
                            <Users size={32} color="var(--primary)" />
                            Gestion des Agents
                        </h1>
                        <p>Contrôlez les accès et les rôles de votre équipe.</p>
                    </div>
                    <button onClick={() => navigate('/users/new')} className="action-btn">
                        <UserPlus size={20} />
                        Créer un Agent
                    </button>
                </header>

                {error && <div className="alert alert-error"><Info size={16} />{error}</div>}
                {success && <div className="alert alert-success"><CheckCircle2 size={16} />{success}</div>}

                <div className="filter-card">
                    <div className="filter-tabs">
                        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous ({users.length})</button>
                        <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Actifs ({users.filter(u => u.is_active === 1).length})</button>
                        <button className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>Inactifs ({users.filter(u => u.is_active === 0).length})</button>
                    </div>

                    <div className="search-box">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Rechercher par nom, CP, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Agent / Identité</th>
                                <th>Login / CP</th>
                                <th>Service / Groupe</th>
                                <th>Niveau d'accès</th>
                                <th>Statut</th>
                                <th style={{ textAlign: 'right' }}>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar" style={{ opacity: user.is_active ? 1 : 0.5 }}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="user-name" style={{ opacity: user.is_active ? 1 : 0.6 }}>{user.name}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Key size={14} color="var(--slate-300)" />
                                            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: '0.8125rem' }}>{user.login}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Layers size={14} color="var(--slate-300)" />
                                            <span>{user.group_name || 'Non affecté'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : user.role === 'EDITOR' ? 'role-editor' : 'role-user'}`}>
                                            <Shield size={10} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-indicator ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                                            <div className="status-dot"></div>
                                            {user.is_active ? 'Actif' : 'Désactivé'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="action-btn-mini" onClick={() => navigate(`/users/${user.id}`)} title="Modifier">
                                                <Edit size={16} />
                                            </button>
                                            {user.is_active ? (
                                                <button className="action-btn-mini danger" onClick={() => handleDeactivate(user.id)} title="Désactiver">
                                                    <UserMinus size={16} />
                                                </button>
                                            ) : (
                                                <button className="action-btn-mini success" onClick={() => handleReactivate(user.id)} title="Réactiver">
                                                    <UserCheck size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--slate-400)', fontWeight: 600 }}>
                                        <Info size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p>Aucun agent trouvé pour les critères sélectionnés.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
