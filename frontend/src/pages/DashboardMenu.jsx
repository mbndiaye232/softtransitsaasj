import React from 'react'
import { Link } from 'react-router-dom'
import {
    Building2,
    Users,
    UserSquare2,
    Briefcase,
    ClipboardList,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    Database,
    CreditCard,
    Key,
    Save,
    Package,
    Layers,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react'

const menuItems = [
    { id: 'societe', label: 'Société', icon: Building2, path: '/settings', color: '#6366f1' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/users', color: '#4f46e5' },
    { id: 'clients', label: 'Clients', icon: UserSquare2, path: '/clients/new', color: '#8b5cf6' },
    { id: 'tiers', label: 'Tiers', icon: Users, path: '/tiers', color: '#ec4899' },
    { id: 'dossiers', label: 'Dossiers', icon: Briefcase, path: '/dossiers', color: '#ef4444' },
    { id: 'suivi', label: 'Suivi dossiers', icon: ClipboardList, path: '#', color: '#f59e0b' },
    { id: 'cotation', label: 'Cotation', icon: Layers, path: '/cotations', color: '#10b981' },
    { id: 'documents', label: 'Gestion documents', icon: FileText, path: '#', color: '#06b6d4' },
    { id: 'notes', label: 'Note de détail', icon: FileText, path: '/notes', color: '#3b82f6' },
    { id: 'finances', label: 'Etats financiers', icon: BarChart3, path: '#', color: '#6366f1' },
    { id: 'traitements', label: 'Suivi traitements', icon: Layers, path: '#', color: '#8b5cf6' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: '#ec4899' },
    { id: 'parametres', label: 'Paramètres', icon: Settings, path: '/company-settings', color: '#f59e0b' },
    { id: 'licence', label: 'Licence', icon: Key, path: '#', color: '#10b981' },
    { id: 'sauvegarder', label: 'Sauvegarder', icon: Save, path: '#', color: '#06b6d4' },
    { id: 'quitter', label: 'Quitter', icon: LogOut, path: '/logout', color: '#64748b' }
]

export default function DashboardMenu() {
    return (
        <div className="premium-menu-grid">
            <style>{`
                .premium-menu-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                    gap: 1.25rem; 
                }
                
                .premium-menu-card { 
                    background: white; 
                    border-radius: 1.25rem; 
                    padding: 1.25rem; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 1rem; 
                    text-decoration: none; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    border: 1px solid var(--border); 
                    position: relative; 
                    overflow: hidden; 
                    box-shadow: var(--shadow-sm); 
                }
                
                .premium-menu-card:hover { 
                    transform: translateY(-5px); 
                    box-shadow: var(--shadow-lg); 
                    border-color: var(--item-color); 
                }
                
                .icon-container { 
                    width: 48px; 
                    height: 48px; 
                    border-radius: 0.75rem; 
                    background: color-mix(in srgb, var(--item-color), transparent 92%); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: var(--item-color); 
                    transition: all 0.3s; 
                }
                
                .premium-menu-card:hover .icon-container { 
                    background: var(--item-color); 
                    color: white; 
                    transform: scale(1.1) rotate(-5deg); 
                }
                
                .menu-label-box { display: flex; align-items: center; justify-content: space-between; }
                .menu-label { font-weight: 700; font-size: 0.875rem; color: var(--slate-700); transition: color 0.2s; }
                .premium-menu-card:hover .menu-label { color: var(--slate-900); }
                
                .arrow-icon { color: var(--slate-300); opacity: 0; transform: translateX(-10px); transition: all 0.2s; }
                .premium-menu-card:hover .arrow-icon { opacity: 1; transform: translateX(0); }
                
                .card-decoration { 
                    position: absolute; 
                    top: -10px; 
                    right: -10px; 
                    width: 40px; 
                    height: 40px; 
                    background: color-mix(in srgb, var(--item-color), transparent 95%); 
                    border-radius: 50%; 
                    transition: all 0.3s; 
                }
                .premium-menu-card:hover .card-decoration { transform: scale(3); }
            `}</style>

            {menuItems.map((item) => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.id}
                        to={item.path}
                        className="premium-menu-card"
                        style={{ '--item-color': item.color }}
                    >
                        <div className="card-decoration"></div>
                        <div className="icon-container">
                            <Icon size={24} />
                        </div>
                        <div className="menu-label-box">
                            <span className="menu-label">{item.label}</span>
                            <ChevronRight className="arrow-icon" size={16} />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
