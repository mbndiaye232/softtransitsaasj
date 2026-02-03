import { useState, useEffect } from 'react'

const MODULES = [
    { code: 'DOSSIERS', label: 'Gestion des Dossiers' },
    { code: 'CLIENTS', label: 'Gestion des Clients' },
    { code: 'FACTURES', label: 'Gestion des Factures' },
    { code: 'COTATIONS', label: 'Gestion des Cotations' },
    { code: 'NOTES', label: 'Notes de Détails' },
    { code: 'STRUCTURES', label: 'Configuration Sociétés' },
    { code: 'AGENTS', label: 'Gestion des Agents' },
    { code: 'PAYS', label: 'Référentiel Pays' },
    { code: 'TAXES', label: 'Référentiel Taxes' },
    { code: 'DEVISES', label: 'Référentiel Devises' },
    { code: 'PRODUITS', label: 'Référentiel Produits' },
    { code: 'REGIMES', label: 'Référentiel Régimes' },
    { code: 'STATUTS', label: 'Référentiel Statuts' },
    { code: 'GROUPES', label: 'Gestion des Groupes' }
]

export default function PermissionMatrix({ permissions = [], onChange, readOnly = false }) {
    // permissions is an array of { code, can_view, can_create, can_edit, can_delete }

    const handleCheck = (moduleCode, action, checked) => {
        if (readOnly) return

        const newPermissions = [...permissions]
        const existingIndex = newPermissions.findIndex(p => p.code === moduleCode)

        if (existingIndex >= 0) {
            newPermissions[existingIndex] = {
                ...newPermissions[existingIndex],
                [action]: checked ? 1 : 0
            }
        } else {
            newPermissions.push({
                code: moduleCode,
                can_view: 0,
                can_create: 0,
                can_edit: 0,
                can_delete: 0,
                [action]: checked ? 1 : 0
            })
        }

        onChange(newPermissions)
    }

    const getPerm = (code) => {
        return permissions.find(p => p.code === code) || { can_view: 0, can_create: 0, can_edit: 0, can_delete: 0 }
    }

    return (
        <div className="permission-matrix" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Module</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Voir</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Créer</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Modifier</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>Supprimer</th>
                    </tr>
                </thead>
                <tbody>
                    {MODULES.map(module => {
                        const perm = getPerm(module.code)
                        return (
                            <tr key={module.code} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem' }}>{module.label}</td>
                                {[
                                    { key: 'can_view', color: '#3b82f6' },
                                    { key: 'can_create', color: '#10b981' },
                                    { key: 'can_edit', color: '#f59e0b' },
                                    { key: 'can_delete', color: '#ef4444' }
                                ].map(action => (
                                    <td key={action.key} style={{ textAlign: 'center', padding: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={perm[action.key] === 1}
                                            onChange={(e) => handleCheck(module.code, action.key, e.target.checked)}
                                            disabled={readOnly}
                                            style={{
                                                accentColor: action.color,
                                                transform: 'scale(1.2)',
                                                cursor: readOnly ? 'not-allowed' : 'pointer'
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
