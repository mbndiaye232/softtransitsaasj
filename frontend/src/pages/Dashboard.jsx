import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardMenu from './DashboardMenu'
import { statisticsAPI } from '../services/api'
import {
    CreditCard,
    Briefcase,
    Clock,
    Users,
    LogOut,
    Building2,
    Mail,
    User,
    ShieldCheck
} from 'lucide-react'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        activeDossiers: 0,
        closedDossiers: 0,
        pendingNotes: 0,
        activeTeam: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statisticsAPI.getDashboard()
                setStats(response.data)
            } catch (err) {
                console.error('Error fetching dashboard stats:', err)
            }
        }
        fetchStats()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="dashboard-container">
            <style>{`
                .dashboard-container { min-height: 100vh; background: var(--bg); color: var(--slate-800); }
                
                .premium-nav { 
                    background: var(--surface); 
                    border-bottom: 1px solid var(--border); 
                    padding: 0.75rem 2rem; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    position: sticky; 
                    top: 0; 
                    z-index: 50; 
                    box-shadow: var(--shadow-sm); 
                }
                
                .nav-brand h1 { font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin: 0; }
                .nav-brand p { font-size: 0.75rem; color: var(--slate-500); margin: 0; font-weight: 600; }
                
                .nav-user { display: flex; align-items: center; gap: 1rem; }
                .user-info { text-align: right; }
                .user-name { font-size: 0.875rem; font-weight: 700; color: var(--slate-900); }
                .user-role { font-size: 0.625rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
                
                .logout-btn { 
                    padding: 0.5rem; 
                    border-radius: 0.75rem; 
                    border: 1px solid var(--border); 
                    background: var(--slate-50); 
                    color: var(--slate-500); 
                    cursor: pointer; 
                    transition: all 0.2s; 
                }
                .logout-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

                .main-content { max-width: 1400px; margin: 0 auto; padding: 2rem; }
                
                .welcome-banner { 
                    background: var(--slate-900); 
                    border-radius: var(--radius-xl); 
                    padding: 2.5rem; 
                    margin-bottom: 2rem; 
                    position: relative; 
                    overflow: hidden; 
                    box-shadow: var(--shadow-premium); 
                }
                .welcome-banner::after { 
                    content: ''; 
                    position: absolute; 
                    right: -5%; 
                    top: -20%; 
                    width: 300px; 
                    height: 300px; 
                    background: var(--primary); 
                    filter: blur(100px); 
                    opacity: 0.15; 
                }
                .welcome-text h2 { font-size: 1.75rem; font-weight: 800; color: white; margin: 0; }
                .welcome-text p { color: var(--slate-400); font-size: 1rem; margin-top: 0.5rem; font-weight: 500; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                
                .premium-stat-card { 
                    background: white; 
                    padding: 1.5rem; 
                    border-radius: var(--radius-lg); 
                    border: 1px solid var(--border); 
                    display: flex; 
                    align-items: center; 
                    gap: 1.25rem; 
                    transition: all 0.3s; 
                    box-shadow: var(--shadow-sm); 
                }
                .premium-stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
                .icon-box { 
                    width: 48px; 
                    height: 48px; 
                    border-radius: 1rem; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                }
                .stat-info .stat-label { font-size: 0.75rem; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-info .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--slate-900); }
                
                .section-header { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
                .section-title { font-size: 1.125rem; font-weight: 800; color: var(--slate-900); margin: 0; }
                
                .profile-card { 
                    background: white; 
                    border-radius: var(--radius-lg); 
                    border: 1px solid var(--border); 
                    overflow: hidden; 
                    margin-top: 3rem; 
                    box-shadow: var(--shadow-sm); 
                }
                .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; padding: 2rem; }
                .profile-item { display: flex; flex-direction: column; gap: 0.5rem; }
                .profile-label { font-size: 0.625rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; }
                .profile-value { font-size: 0.875rem; font-weight: 700; color: var(--slate-800); display: flex; align-items: center; gap: 0.5rem; }
                
                .premium-header { padding: 1.25rem 2rem; background: var(--slate-50); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .premium-title { font-size: 0.75rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
            `}</style>

            <header className="premium-nav">
                <div className="nav-brand">
                    <h1>Soft Transit SaaS</h1>
                    <p>{user?.company_name}</p>
                </div>
                <div className="nav-user">
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'Utilisateur'}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Déconnexion">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="main-content">
                <section className="welcome-banner">
                    <div className="welcome-text">
                        <h2>Session de travail <span style={{ color: '#818cf8' }}>{user?.name?.toUpperCase()}</span></h2>
                        <p>Optimisez la gestion de vos dossiers de transit avec précision.</p>
                    </div>
                </section>

                <div className="stats-grid">
                    <div className="premium-stat-card">
                        <div className="icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                            <CreditCard size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Crédits de session</div>
                            <div className="stat-value">{user?.credit_balance || 0}</div>
                        </div>
                    </div>

                    <div className="premium-stat-card">
                        <div className="icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <Briefcase size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Dossiers actifs</div>
                            <div className="stat-value">{stats.activeDossiers}</div>
                        </div>
                    </div>

                    <div className="premium-stat-card">
                        <div className="icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                            <Clock size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Notes en attente</div>
                            <div className="stat-value">{stats.pendingNotes}</div>
                        </div>
                    </div>

                    <div className="premium-stat-card">
                        <div className="icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-label">Équipe active</div>
                            <div className="stat-value">{stats.activeTeam}</div>
                        </div>
                    </div>
                </div>

                <section>
                    <div className="section-header">
                        <div style={{ background: 'var(--primary)', width: '4px', height: '1.5rem', borderRadius: '4px' }}></div>
                        <h3 className="section-title">Menu Principal</h3>
                    </div>
                    <DashboardMenu />
                </section>

                <section className="profile-card">
                    <div className="premium-header">
                        <h3 className="premium-title">Informations Professionnelles</h3>
                        <ShieldCheck size={20} color="var(--slate-400)" />
                    </div>
                    <div className="profile-grid">
                        <div className="profile-item">
                            <span className="profile-label">Raison Sociale</span>
                            <span className="profile-value">
                                <Building2 size={16} color="var(--primary)" />
                                {user?.company_name}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Identifiant de connexion</span>
                            <span className="profile-value">
                                <User size={16} color="var(--primary)" />
                                {user?.login}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Adresse Email</span>
                            <span className="profile-value">
                                <Mail size={16} color="var(--primary)" />
                                {user?.email}
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
