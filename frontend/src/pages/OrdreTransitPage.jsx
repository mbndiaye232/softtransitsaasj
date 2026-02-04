import React, { useState, useEffect } from 'react'
import {
    Plus, Search, Edit, Trash2, FileText, ChevronRight,
    Save, X, Info, CheckCircle, ListTodo, Globe, Package
} from 'lucide-react'
import {
    ordresTransitAPI, dossiersAPI, incotermsAPI,
    regimesOTAPI, typesDocumentsOTAPI
} from '../services/api'

export default function OrdreTransitPage() {
    const [ordres, setOrdres] = useState([])
    const [dossiers, setDossiers] = useState([])
    const [incoterms, setIncoterms] = useState([])
    const [regimes, setRegimes] = useState([])
    const [typesDocs, setTypesDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        NumeroOT: '',
        DateOT: new Date().toISOString().split('T')[0],
        DateReceptionOT: '',
        IDDossiers: '',
        NumeroSerie: '',
        Idincoterms: '',
        BSCExiste: false,
        AssuranceExiste: false,
        Observations: '',
        DateExpedition: '',
        AdresseDeLivraison: '',
        PROVENANCE: '',
        NatureProduits: '',
        Nbredecolis: '',
        PoidsNet: '',
        ValeurMarchandise: '',
        regimeIds: [],
        documents: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [otRes, dosRes, incRes, regRes, typRes] = await Promise.all([
                ordresTransitAPI.getAll(),
                dossiersAPI.getAll(),
                incotermsAPI.getAll(),
                regimesOTAPI.getAll(),
                typesDocumentsOTAPI.getAll()
            ])
            setOrdres(otRes.data)
            setDossiers(dosRes.data)
            setIncoterms(incRes.data)
            setRegimes(regRes.data)
            setTypesDocs(typRes.data)

            // Initialize documents from types to be remitted
            setFormData(prev => ({
                ...prev,
                documents: typRes.data.map(t => ({
                    idtypesDocumentot: t.IDTypesDocumentsOT,
                    LibelleTypeDocumentsOT: t.LibelleTypeDocumentsOT,
                    Observations: '',
                    Recu: 0,
                    Aremettre: 1
                }))
            }))

        } catch (err) {
            console.error('Failed to load data:', err)
            setError('Impossible de charger les données')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await ordresTransitAPI.create(formData)
            setShowModal(false)
            loadData()
        } catch (err) {
            console.error('Submit error:', err)
            setError('Erreur lors de l\'enregistrement')
        }
    }

    const handleRegimeToggle = (id) => {
        setFormData(prev => {
            const current = prev.regimeIds || []
            if (current.includes(id)) {
                return { ...prev, regimeIds: current.filter(rid => rid !== id) }
            } else {
                return { ...prev, regimeIds: [...current, id] }
            }
        })
    }

    const handleDocToggle = (index, field) => {
        setFormData(prev => {
            const docs = [...prev.documents]
            docs[index] = { ...docs[index], [field]: docs[index][field] ? 0 : 1 }
            if (field === 'Recu' && docs[index].Recu) {
                docs[index].DateReceptionDocument = new Date().toISOString()
            }
            return { ...prev, documents: docs }
        })
    }

    const filteredOrdres = ordres.filter(o =>
        o.NumeroOT?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.dossier_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="view-loading">
            <div className="spinner"></div>
            <style>{`
                .view-loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--bg); }
                .spinner { width: 40px; height: 40px; border: 3px solid var(--slate-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )

    return (
        <div className="ot-wrapper" style={{ padding: '2rem', background: 'var(--bg)', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>Ordres de Transit</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Gérez les ordres de transit et le suivi des documents.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Nouveau OT
                </button>
            </header>

            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', width: '1rem' }} />
                        <input
                            type="text"
                            placeholder="Rechercher OT, Dossier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Numéro OT</th>
                                <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Dossier</th>
                                <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Provenance</th>
                                <th style={{ textAlign: 'left', padding: '1rem 2rem', fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Incoterm</th>
                                <th style={{ textAlign: 'right', padding: '1rem 2rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrdres.map(o => (
                                <tr key={o.IDOrdresTransit} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                    <td style={{ padding: '1rem 2rem', fontWeight: 700 }}>{o.NumeroOT}</td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{o.dossier_code}</span>
                                    </td>
                                    <td style={{ padding: '1rem 2rem' }}>{new Date(o.DateOT).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 2rem' }}>{o.PROVENANCE}</td>
                                    <td style={{ padding: '1rem 2rem' }}>{o.CodeIncoterm}</td>
                                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                                        <ChevronRight size={18} color="var(--slate-300)" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Nouvel Ordre de Transit</h2>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>Numéro OT</label>
                                    <input value={formData.NumeroOT} onChange={e => setFormData({ ...formData, NumeroOT: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }} required />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>Dossier</label>
                                    <select value={formData.IDDossiers} onChange={e => setFormData({ ...formData, IDDossiers: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }} required>
                                        <option value="">Sélectionner un dossier</option>
                                        {dossiers.map(d => <option key={d.id} value={d.id}>{d.code} - {d.label}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>Provenance</label>
                                    <input value={formData.PROVENANCE} onChange={e => setFormData({ ...formData, PROVENANCE: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)' }}>Incoterm</label>
                                    <select value={formData.Idincoterms} onChange={e => setFormData({ ...formData, Idincoterms: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                        <option value="">Sélectionner incoterm</option>
                                        {incoterms.map(i => <option key={i.IDIncoterm} value={i.IDIncoterm}>{i.CodeIncoterm}</option>)}
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', display: 'block', marginBottom: '1rem' }}>Régimes OT</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        {regimes.map(r => (
                                            <label key={r.IDRegimeOT} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <input type="checkbox" checked={formData.regimeIds.includes(r.IDRegimeOT)} onChange={() => handleRegimeToggle(r.IDRegimeOT)} />
                                                {r.CodeRegimeOT} - {r.LibelleRegimeOT}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', display: 'block', marginBottom: '1rem' }}>Documents à remettre</label>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '0.5rem 0', fontSize: '0.75rem' }}>Document</th>
                                                <th style={{ padding: '0.5rem 0', fontSize: '0.75rem' }}>Recu</th>
                                                <th style={{ padding: '0.5rem 0', fontSize: '0.75rem' }}>A remettre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.documents.map((doc, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                                                    <td style={{ padding: '0.5rem 0', fontSize: '0.875rem' }}>{doc.LibelleTypeDocumentsOT}</td>
                                                    <td><input type="checkbox" checked={doc.Recu === 1} onChange={() => handleDocToggle(idx, 'Recu')} /></td>
                                                    <td><input type="checkbox" checked={doc.Aremettre === 1} onChange={() => handleDocToggle(idx, 'Aremettre')} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', fontWeight: 700 }}>Annuler</button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700 }}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                :root {
                    --bg: #f8fafc;
                    --primary: #4f46e5;
                    --primary-hover: #4338ca;
                    --primary-light: #e0e7ff;
                    --slate-50: #f8fafc;
                    --slate-100: #f1f5f9;
                    --slate-200: #e2e8f0;
                    --slate-300: #cbd5e1;
                    --slate-400: #94a3b8;
                    --slate-500: #64748b;
                    --slate-600: #475569;
                    --slate-700: #334111;
                    --slate-800: #1e293b;
                    --slate-900: #0f172a;
                    --border: #e2e8f0;
                    --border-light: #f1f5f9;
                    --radius-md: 0.5rem;
                    --radius-xl: 0.75rem;
                }
            `}</style>
        </div>
    )
}
