import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionsAPI, structureAPI } from '../services/api'

export default function CreditPurchase() {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [creditBalance, setCreditBalance] = useState(0)

    // Pre-defined packages
    const packages = [
        { credits: 100, amount: 10000, label: 'Pack Découverte' },
        { credits: 500, amount: 45000, label: 'Pack Standard' },
        { credits: 1000, amount: 80000, label: 'Pack Premium' },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [transRes, structRes] = await Promise.all([
                transactionsAPI.getAll(),
                structureAPI.getMe()
            ])
            setTransactions(transRes.data)
            setCreditBalance(structRes.data.credit_balance)
        } catch (err) {
            setError('Impossible de charger les données')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async (pkg) => {
        if (!window.confirm(`Voulez-vous acheter ${pkg.credits} crédits pour ${pkg.amount.toLocaleString()} FCFA ?`)) return

        try {
            setLoading(true)
            // 1. Initiate Purchase
            const initRes = await transactionsAPI.purchase({
                amount: pkg.amount,
                credits: pkg.credits,
                paymentMethod: 'MOCK_CARD'
            })

            // 2. Mock Payment Confirmation (In real app, redirect to payment gateway)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

            // 3. Confirm Purchase
            await transactionsAPI.confirm({
                transactionId: initRes.data.id
            })

            setSuccess(`Achat de ${pkg.credits} crédits effectué avec succès !`)
            loadData() // Refresh data
        } catch (err) {
            setError('Erreur lors de l\'achat')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="loading">Chargement...</div>

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Achat de Crédits</h1>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                    Retour
                </button>
            </div>

            <div className="dashboard-content">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Current Balance */}
                <div className="dashboard-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2>Solde Actuel</h2>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {parseFloat(creditBalance).toLocaleString()} Crédits
                    </div>
                </div>

                {/* Packages */}
                <h2 className="dashboard-title">Choisir un pack</h2>
                <div className="stats-grid">
                    {packages.map((pkg, index) => (
                        <div key={index} className="stat-card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>{pkg.label}</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                {pkg.credits} Crédits
                            </div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                                {pkg.amount.toLocaleString()} FCFA
                            </div>
                            <button
                                onClick={() => handlePurchase(pkg)}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                Acheter
                            </button>
                        </div>
                    ))}
                </div>

                {/* Transaction History */}
                <h2 className="dashboard-title" style={{ marginTop: '2rem' }}>Historique des achats</h2>
                <div className="dashboard-card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Crédits</th>
                                <th style={{ padding: '1rem' }}>Montant</th>
                                <th style={{ padding: '1rem' }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}</td>
                                    <td style={{ padding: '1rem' }}>{t.type}</td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.credits}</td>
                                    <td style={{ padding: '1rem' }}>{parseFloat(t.amount).toLocaleString()} FCFA</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            backgroundColor: t.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
                                            color: t.status === 'COMPLETED' ? '#065f46' : '#991b1b'
                                        }}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                                        Aucune transaction
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
