import React, { useState, useEffect } from 'react'
import { Plus, Save, X, Trash2, Globe, FileText, Settings } from 'lucide-react'
import { incotermsAPI, regimesOTAPI, typesDocumentsOTAPI } from '../services/api'

export default function ReferenceDataOTPage() {
    const [incoterms, setIncoterms] = useState([])
    const [regimes, setRegimes] = useState([])
    const [typesDocs, setTypesDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('incoterms')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [incRes, regRes, typRes] = await Promise.all([
                incotermsAPI.getAll(),
                regimesOTAPI.getAll(),
                typesDocumentsOTAPI.getAll()
            ])
            setIncoterms(incRes.data)
            setRegimes(regRes.data)
            setTypesDocs(typRes.data)
        } catch (err) {
            console.error('Failed to load ref data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddIncoterm = async (e) => {
        e.preventDefault()
        const code = e.target.CodeIncoterm.value
        const obs = e.target.Observations.value
        try {
            await incotermsAPI.create({ CodeIncoterm: code, Observations: obs })
            loadData()
            e.target.reset()
        } catch (err) { console.error(err) }
    }

    const handleAddRegime = async (e) => {
        e.preventDefault()
        const code = e.target.CodeRegimeOT.value
        const libelle = e.target.LibelleRegimeOT.value
        const obs = e.target.Observations.value
        try {
            await regimesOTAPI.create({ CodeRegimeOT: code, LibelleRegimeOT: libelle, Observations: obs })
            loadData()
            e.target.reset()
        } catch (err) { console.error(err) }
    }

    const handleAddTypeDoc = async (e) => {
        e.preventDefault()
        const libelle = e.target.LibelleTypeDocumentsOT.value
        const obs = e.target.Observations.value
        try {
            await typesDocumentsOTAPI.create({ LibelleTypeDocumentsOT: libelle, Observations: obs })
            loadData()
            e.target.reset()
        } catch (err) { console.error(err) }
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div style={{ padding: '2rem', background: 'var(--bg)', minHeight: '100vh' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Configuration Transit</h1>
                <p style={{ color: 'var(--slate-500)' }}>Gérez les référentiels pour les ordres de transit.</p>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('incoterms')}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: activeTab === 'incoterms' ? 'var(--primary)' : 'white', color: activeTab === 'incoterms' ? 'white' : 'var(--slate-600)', fontWeight: 700, cursor: 'pointer', border: activeTab === 'incoterms' ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                >Incoterms</button>
                <button
                    onClick={() => setActiveTab('regimes')}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: activeTab === 'regimes' ? 'var(--primary)' : 'white', color: activeTab === 'regimes' ? 'white' : 'var(--slate-600)', fontWeight: 700, cursor: 'pointer', border: activeTab === 'regimes' ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                >Régimes OT</button>
                <button
                    onClick={() => setActiveTab('typesDocs')}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: activeTab === 'typesDocs' ? 'var(--primary)' : 'white', color: activeTab === 'typesDocs' ? 'white' : 'var(--slate-600)', fontWeight: 700, cursor: 'pointer', border: activeTab === 'typesDocs' ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                >Types de Documents</button>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                {activeTab === 'incoterms' && (
                    <section>
                        <h2 style={{ marginBottom: '1.5rem' }}>Incoterms</h2>
                        <form onSubmit={handleAddIncoterm} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Code</label>
                                <input name="CodeIncoterm" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} required placeholder="ex: CIF" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Observations</label>
                                <input name="Observations" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} placeholder="Description..." />
                            </div>
                            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Plus size={18} /></button>
                        </form>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem' }}>Code</th>
                                    <th style={{ padding: '0.75rem' }}>Observations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incoterms.map(i => (
                                    <tr key={i.IDIncoterm} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{i.CodeIncoterm}</td>
                                        <td style={{ padding: '0.75rem' }}>{i.Observations}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {activeTab === 'regimes' && (
                    <section>
                        <h2 style={{ marginBottom: '1.5rem' }}>Régimes OT</h2>
                        <form onSubmit={handleAddRegime} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Code</label>
                                <input name="CodeRegimeOT" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Libellé</label>
                                <input name="LibelleRegimeOT" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Observations</label>
                                <input name="Observations" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} />
                            </div>
                            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Plus size={18} /></button>
                        </form>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem' }}>Code</th>
                                    <th style={{ padding: '0.75rem' }}>Libellé</th>
                                    <th style={{ padding: '0.75rem' }}>Observations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regimes.map(r => (
                                    <tr key={r.IDRegimeOT} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{r.CodeRegimeOT}</td>
                                        <td style={{ padding: '0.75rem' }}>{r.LibelleRegimeOT}</td>
                                        <td style={{ padding: '0.75rem' }}>{r.Observations}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {activeTab === 'typesDocs' && (
                    <section>
                        <h2 style={{ marginBottom: '1.5rem' }}>Types de Documents OT</h2>
                        <form onSubmit={handleAddTypeDoc} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Libellé</label>
                                <input name="LibelleTypeDocumentsOT" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Observations</label>
                                <input name="Observations" style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} />
                            </div>
                            <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}><Plus size={18} /></button>
                        </form>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem' }}>Libellé</th>
                                    <th style={{ padding: '0.75rem' }}>Observations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {typesDocs.map(t => (
                                    <tr key={t.IDTypesDocumentsOT} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{t.LibelleTypeDocumentsOT}</td>
                                        <td style={{ padding: '0.75rem' }}>{t.Observations}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>

            <style>{`
                :root {
                    --bg: #f8fafc;
                    --primary: #4f46e5;
                    --slate-50: #f8fafc;
                    --slate-500: #64748b;
                    --slate-600: #475569;
                    --border: #e2e8f0;
                }
            `}</style>
        </div>
    )
}
