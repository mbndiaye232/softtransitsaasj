import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clientsAPI, dossiersAPI, notesAPI, produitsAPI, regimesAPI, devisesAPI, paysAPI, taxesAPI } from '../services/api';
import {
    Calculator,
    FileText,
    Search,
    Users,
    Folder,
    Plus,
    Save,
    Download,
    CheckCircle2,
    Info,
    ChevronLeft,
    RotateCcw,
    Database,
    Globe,
    Activity,
    ShieldCheck,
    Tag,
    Layers,
    ArrowRightLeft,
    X,
    MessageSquare,
    Hash,
    Coins
} from 'lucide-react';

export default function NoteDeDetail() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for selections
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [dossiers, setDossiers] = useState([]);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);

    // State for articles
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Reference data
    const [regimes, setRegimes] = useState([]);
    const [devises, setDevises] = useState([]);
    const [pays, setPays] = useState([]);

    // State for Matrix Grid (11 articles)
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);
    const [matrixArticles, setMatrixArticles] = useState(Array(11).fill().map((_, i) => ({
        NumeroArticle: i + 1,
        NTS: '',
        Libelle: '',
        CodeRegimeDeclaration: '',
        Origine: '',
        Provenance: '',
        FOB: 0,
        Fret: 0,
        Assurances: 0,
        IDDEVISEFOB: 1,
        IDDEVISEFRET: 1,
        IDDEVISEASS: 1,
        DPI: '',
        TitreExo: '',
        NBCOLIS: '',
        BRUT: 0,
        NET: 0,
        QC: 0,
        QM: 0,
        CommissionFournisseur: 0
    })));

    // Global distribution state
    const [globalValues, setGlobalValues] = useState({
        globalFret: 0,
        globalAssurance: 0,
        globalWeight: 0
    });

    // Tax calculation state
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [calculatedTaxes, setCalculatedTaxes] = useState([]);
    const [selectedRegime, setSelectedRegime] = useState(null);
    const [allTaxes, setAllTaxes] = useState([]);
    const [excludedTaxes, setExcludedTaxes] = useState([]);

    // UI state
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [pdfGenerated, setPdfGenerated] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            await Promise.all([
                loadClients(),
                loadRegimes(),
                loadDevises(),
                loadPays(),
                loadTaxes()
            ]);
            setLoading(false);
        };
        fetchInitialData();
    }, []);

    const loadClients = async () => {
        try {
            const response = await clientsAPI.getAll();
            setClients(response.data);
        } catch (error) {
            showMessage('Erreur lors du chargement des clients', 'error');
        }
    };

    const loadRegimes = async () => {
        try {
            const response = await regimesAPI.getAll();
            setRegimes(response.data);
        } catch (error) {
            showMessage('Erreur lors du chargement des régimes', 'error');
        }
    };

    const loadDevises = async () => {
        try {
            const response = await devisesAPI.getAll();
            setDevises(response.data);
        } catch (error) {
            showMessage('Erreur lors du chargement des devises', 'error');
        }
    };

    const loadPays = async () => {
        try {
            const response = await paysAPI.getAll();
            setPays(response.data);
        } catch (error) {
            console.error("Erreur chargement pays", error);
        }
    };

    const loadTaxes = async () => {
        try {
            const response = await taxesAPI.getAll();
            setAllTaxes(response.data);
        } catch (error) {
            console.error("Erreur chargement taxes", error);
        }
    };

    // Load Dossiers when Client selected
    useEffect(() => {
        if (selectedClient) {
            loadDossiers(selectedClient.IDCLIENTS);
        } else {
            setDossiers([]);
            setSelectedDossier(null);
        }
    }, [selectedClient]);

    const loadDossiers = async (clientId) => {
        try {
            const response = await dossiersAPI.getAll();
            // Use standardized keys from backend: clientId and status
            const clientDossiers = response.data.filter(d =>
                (d.clientId == clientId || d.IDClient == clientId) &&
                (d.status !== 'CLOSED' && !d.Cloture)
            );
            setDossiers(clientDossiers);
        } catch (error) {
            showMessage('Erreur lors du chargement des dossiers', 'error');
        }
    };

    // Load Notes when Dossier selected
    useEffect(() => {
        if (selectedDossier) {
            loadNotes(selectedDossier.id || selectedDossier.IDDossiers);
        } else {
            setNotes([]);
            setSelectedNote(null);
        }
    }, [selectedDossier]);

    const loadNotes = async (dossierId) => {
        try {
            const response = await notesAPI.getAll(dossierId);
            setNotes(response.data);
        } catch (error) {
            showMessage('Erreur lors du chargement des notes', 'error');
        }
    };

    // Load Articles when Note selected
    useEffect(() => {
        if (selectedNote) {
            loadArticles(selectedNote.IDNotesDeDetails);
            checkValidationStatus(selectedNote.IDNotesDeDetails);
            setPdfGenerated(false);
        } else {
            // Reset matrix to empty state
            setMatrixArticles(Array(11).fill().map((_, i) => ({
                NumeroArticle: i + 1,
                NTS: '',
                Libelle: '',
                CodeRegimeDeclaration: '',
                Origine: '',
                Provenance: '',
                FOB: 0,
                Fret: 0,
                Assurances: 0,
                IDDEVISEFOB: 1,
                IDDEVISEFRET: 1,
                IDDEVISEASS: 1,
                DPI: '',
                TitreExo: '',
                NBCOLIS: '',
                BRUT: 0,
                NET: 0,
                QC: 0,
                QM: 0,
                CommissionFournisseur: 0
            })));
            setIsValidated(false);
            setPdfGenerated(false);
        }
    }, [selectedNote]);

    const loadArticles = async (noteId) => {
        try {
            const response = await notesAPI.getArticles(noteId);
            const dbArticles = response.data;

            const newMatrix = Array(11).fill().map((_, i) => {
                if (i < dbArticles.length) {
                    const db = dbArticles[i];
                    return {
                        ...db,
                        NumeroArticle: i + 1,
                        IDArticles: db.IDArticles || db.idarticles || db.IDARTICLES,
                        Fret: db.FRET || db.Fret || 0,
                        Assurances: db.ASSURANCES || db.Assurances || 0
                    };
                }
                return {
                    NumeroArticle: i + 1,
                    NTS: '',
                    Libelle: '',
                    CodeRegimeDeclaration: '',
                    Origine: '',
                    Provenance: '',
                    FOB: 0,
                    Fret: 0,
                    Assurances: 0,
                    IDDEVISEFOB: 1,
                    IDDEVISEFRET: 1,
                    IDDEVISEASS: 1,
                    DPI: '',
                    TitreExo: '',
                    NBCOLIS: '',
                    BRUT: 0,
                    NET: 0,
                    QC: 0,
                    QM: 0,
                    CommissionFournisseur: 0
                };
            });
            setMatrixArticles(newMatrix);
            setCalculatedTaxes([]);
            setSelectedArticle(null);
            setExcludedTaxes([]);
        } catch (error) {
            showMessage('Erreur lors du chargement des articles', 'error');
        }
    };

    // Product Search effect
    useEffect(() => {
        const timerId = setTimeout(() => {
            loadProducts();
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const params = {
                page: 1,
                limit: 50,
                search: searchTerm
            };

            const response = await produitsAPI.getAll(params);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product.IDProduits);

        if (activeColumnIndex !== null) {
            const updated = [...matrixArticles];
            updated[activeColumnIndex] = {
                ...updated[activeColumnIndex],
                NTS: product.NTS,
                Libelle: product.Libelle
            };
            setMatrixArticles(updated);
            showMessage(`Article ${activeColumnIndex + 1} mis à jour : ${product.NTS}`, 'success');
        } else {
            showMessage('Veuillez sélectionner une colonne d\'article d\'abord', 'warning');
        }
    };

    const handleSelectRegime = (regime) => {
        setSelectedRegime(regime.IDRegimeDeclaration);

        if (activeColumnIndex !== null) {
            const updated = [...matrixArticles];
            updated[activeColumnIndex] = {
                ...updated[activeColumnIndex],
                CodeRegimeDeclaration: regime.CodeRegimeDeclaration
            };
            setMatrixArticles(updated);
            showMessage(`Article ${activeColumnIndex + 1} régime mis à jour: ${regime.CodeRegimeDeclaration}`, 'success');
        } else {
            showMessage('Veuillez sélectionner une colonne d\'article d\'abord', 'info');
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSelectedProduct(null);
    };

    const handleCreateNote = async () => {
        if (!selectedDossier) {
            showMessage('Veuillez sélectionner un dossier', 'warning');
            return;
        }

        try {
            const noteData = {
                IDDossiers: selectedDossier.IDDossiers,
                Repertoire: '',
                NINEA: selectedClient?.NINEA || '',
                Provenance: '',
                IdAgent: user?.id || 1
            };

            await notesAPI.create(noteData);
            showMessage('Note créée avec succès', 'success');
            loadNotes(selectedDossier.IDDossiers);
        } catch (error) {
            showMessage('Erreur lors de la création de la note', 'error');
        }
    };

    const handleSaveAllArticles = async () => {
        if (!selectedNote) {
            showMessage('Veuillez sélectionner une note', 'warning');
            return;
        }

        try {
            const validArticles = matrixArticles.filter(a => a.NTS && a.NTS.trim() !== '');

            if (validArticles.length === 0) {
                showMessage('Aucun article valide à enregistrer (NTS requis)', 'warning');
                return;
            }

            let savedCount = 0;
            let updatedCount = 0;

            for (const article of validArticles) {
                if (article.IDArticles) {
                    await notesAPI.updateArticle(article.IDArticles, article);
                    updatedCount++;
                } else {
                    await notesAPI.addArticle(selectedNote.IDNotesDeDetails, {
                        ...article,
                        IdAgent: user?.id || 1
                    });
                    savedCount++;
                }
            }

            showMessage(`${savedCount} article(s) créé(s), ${updatedCount} mis à jour`, 'success');
            loadArticles(selectedNote.IDNotesDeDetails);
        } catch (error) {
            console.error(error);
            showMessage('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDistribute = () => {
        const totalFOB = matrixArticles.reduce((sum, art) => sum + parseFloat(art.FOB || 0), 0);

        if (totalFOB === 0) {
            showMessage('Total FOB est 0, impossible de répartir', 'warning');
            return;
        }

        const globalFret = parseFloat(globalValues.globalFret || 0);
        const globalAssurance = parseFloat(globalValues.globalAssurance || 0);
        const globalWeight = parseFloat(globalValues.globalWeight || 0);

        const updatedMatrix = matrixArticles.map(art => {
            const articleFOB = parseFloat(art.FOB || 0);
            if (articleFOB > 0) {
                const ratio = articleFOB / totalFOB;
                const updates = {};

                if (globalFret > 0) updates.Fret = (ratio * globalFret).toFixed(0);
                if (globalAssurance > 0) updates.Assurances = (ratio * globalAssurance).toFixed(0);
                if (globalWeight > 0) updates.BRUT = (ratio * globalWeight).toFixed(2);

                return {
                    ...art,
                    ...updates
                };
            }
            return art;
        });

        setMatrixArticles(updatedMatrix);
        showMessage('Répartition effectuée (en mémoire)', 'info');
    };

    const handleConvertToFCFA = async () => {
        if (!selectedNote) {
            showMessage('Veuillez sélectionner une note', 'warning');
            return;
        }

        try {
            await notesAPI.convertToFCFA(selectedNote.IDNotesDeDetails);
            showMessage('Conversion en FCFA effectuée', 'success');
            loadArticles(selectedNote.IDNotesDeDetails);
        } catch (error) {
            showMessage('Erreur lors de la conversion', 'error');
        }
    };

    const handleCalculateTaxes = async (articleId) => {
        try {
            const response = await notesAPI.calculateTaxes(articleId, { excludedTaxCodes: excludedTaxes });
            setCalculatedTaxes(response.data.taxes);
            setSelectedArticle(articleId);
            showMessage(`Calcul terminé : ${response.data.total} FCFA`, 'success');
        } catch (error) {
            showMessage('Erreur lors du calcul des taxes', 'error');
        }
    };

    const handleToggleTaxExclusion = (taxCode) => {
        let newExcluded;
        if (excludedTaxes.includes(taxCode)) {
            newExcluded = excludedTaxes.filter(t => t !== taxCode);
        } else {
            newExcluded = [...excludedTaxes, taxCode];
        }
        setExcludedTaxes(newExcluded);

        if (selectedArticle) {
            recalculateWithExclusion(selectedArticle, newExcluded);
        }
    };

    const recalculateWithExclusion = async (articleId, exclusionList) => {
        try {
            const response = await notesAPI.calculateTaxes(articleId, { excludedTaxCodes: exclusionList });
            setCalculatedTaxes(response.data.taxes);
            setSelectedArticle(articleId);
        } catch (error) {
            console.error(error);
            showMessage('Erreur lors du recalcul', 'error');
        }
    };

    const handleCancelLiquidation = async () => {
        const currentArticle = matrixArticles[activeColumnIndex];
        if (currentArticle && currentArticle.IDArticles) {
            try {
                await notesAPI.clearLiquidations(currentArticle.IDArticles);
                showMessage('Liquidation annulée', 'success');
            } catch (error) {
                console.error('Clear liquidation error:', error);
            }
        }
        // Reset UI state
        setCalculatedTaxes([]);
        setExcludedTaxes([]);
        setSelectedArticle(null);
    };

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGeneratePDF = async () => {
        if (!selectedNote) {
            showMessage('Veuillez sélectionner une note de détail', 'warning');
            return;
        }

        setIsGeneratingPDF(true);
        try {
            const response = await notesAPI.generatePDF(selectedNote.IDNotesDeDetails);

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `note_detail_${selectedNote.IDNotesDeDetails}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setPdfGenerated(true);
            showMessage('PDF généré avec succès', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            showMessage('Erreur lors de la génération du PDF', 'error');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleValidateNote = async () => {
        if (!selectedNote) return;

        try {
            await notesAPI.validate(selectedNote.IDNotesDeDetails);
            setIsValidated(true);
            showMessage('Note de détail validée avec succès', 'success');
        } catch (error) {
            console.error('Validation error:', error);
            showMessage('Erreur lors de la validation', 'error');
        }
    };

    const checkValidationStatus = async (noteId) => {
        try {
            const response = await notesAPI.getPdfStatus(noteId);
            setIsValidated(response.data.validated);
        } catch (error) {
            console.error('Error checking validation status:', error);
            setIsValidated(false);
        }
    };

    const calculateCAF = (article) => {
        const getRate = (deviseId) => {
            const dev = devises.find(d => d.IDDevises == deviseId);
            return dev ? parseFloat(dev.TauxChangeDeviseCFA || 1) : 1;
        };

        const fobCFA = parseFloat(article.FOB || 0) * getRate(article.IDDEVISEFOB);
        const fretCFA = parseFloat(article.Fret || 0) * getRate(article.IDDEVISEFRET);
        const assCFA = parseFloat(article.Assurances || 0) * getRate(article.IDDEVISEASS);

        return (fobCFA + fretCFA + assCFA).toFixed(0);
    };

    const saveSingleArticle = async (article, index) => {
        if (!selectedNote?.IDNotesDeDetails) return null;
        if (!article.NTS && !article.Libelle && !article.FOB) return null;

        try {
            if (article.IDArticles) {
                await notesAPI.updateArticle(article.IDArticles, article);
                return article.IDArticles;
            } else {
                const response = await notesAPI.addArticle(selectedNote.IDNotesDeDetails, article);
                const u = [...matrixArticles];
                const newId = response.data.id;
                u[index] = { ...article, IDArticles: newId, IDNotesDeDetails: selectedNote.IDNotesDeDetails };
                setMatrixArticles(u);
                return newId;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const handleColumnChange = async (newIndex) => {
        if (activeColumnIndex !== null && activeColumnIndex !== newIndex) {
            await saveSingleArticle(matrixArticles[activeColumnIndex], activeColumnIndex);
        }
        setActiveColumnIndex(newIndex);

        const nextArticle = matrixArticles[newIndex];

        if (nextArticle && nextArticle.NTS) {
            try {
                const response = await taxesAPI.getAll(nextArticle.NTS);
                const applicableTaxes = response.data.map(t => ({
                    ...t,
                    Taux: t.Taux || 0,
                    Montant: 0,
                    IsApplicable: true
                }));

                setCalculatedTaxes(applicableTaxes);
                setSelectedArticle(nextArticle.IDArticles || 'temp');

                if (nextArticle.IDArticles) {
                    await handleCalculateTaxes(nextArticle.IDArticles);
                }
            } catch (err) {
                console.error("Error fetching applicable taxes", err);
            }
        } else {
            setSelectedArticle(null);
            setCalculatedTaxes([]);
        }
    };

    const updateMatrixArticle = (index, field, value) => {
        const updated = [...matrixArticles];
        updated[index] = { ...updated[index], [field]: value };
        setMatrixArticles(updated);

        if (activeColumnIndex === index && calculatedTaxes.length > 0) {
            setCalculatedTaxes(prev => prev.map(t => ({ ...t, Montant: 0 })));
        }
    };

    if (loading && !clients.length) return (
        <div className="view-loading">
            <div className="spinner"></div>
            <style>{`
                .view-loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--bg); }
                .spinner { width: 40px; height: 40px; border: 3px solid var(--slate-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
            `}</style>
        </div>
    );

    return (
        <div className="note-page-wrapper">
            <style>{`
                .note-page-wrapper { min-height: 100vh; background: var(--bg); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                
                header.app-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 2rem; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
                .header-title h1 { font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin: 0; }
                .header-title p { font-size: 0.75rem; color: var(--slate-500); margin: 0; font-weight: 600; }
                .user-badge { display: flex; align-items: center; gap: 0.75rem; padding-left: 1.5rem; border-left: 1px solid var(--border); }
                .user-info { text-align: right; }
                .user-name { font-size: 0.875rem; font-weight: 700; color: var(--slate-900); }
                .user-role { font-size: 0.75rem; color: var(--slate-400); font-weight: 600; }

                .top-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; height: 280px; }
                .panel { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-sm); }
                .panel-head { padding: 1rem 1.25rem; background: var(--slate-50); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
                .panel-head h2 { font-size: 0.75rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.1em; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
                .panel-body { flex: 1; overflow-y: auto; padding: 0; }

                .mini-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
                .mini-table th { background: white; position: sticky; top: 0; text-align: left; padding: 0.75rem 1rem; color: var(--slate-400); font-weight: 800; border-bottom: 2px solid var(--border-light); }
                .mini-table td { padding: 0.75rem 1rem; color: var(--slate-700); border-bottom: 1px solid var(--border-light); cursor: pointer; transition: all 0.2s; }
                .mini-table tr:hover td { background: var(--slate-50); }
                .mini-table tr.selected td { background: var(--primary-light); color: var(--primary); font-weight: 700; }

                .tools-grid { display: grid; grid-template-columns: 1fr 1fr 340px; gap: 1.5rem; }
                .tool-card { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); padding: 1.25rem; box-shadow: var(--shadow-sm); }
                .tool-card h3 { font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; }
                
                .search-field { position: relative; margin-bottom: 1rem; }
                .search-field input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1.5px solid var(--border); border-radius: 999px; font-size: 0.875rem; outline: none; background: var(--slate-50); }
                .search-field .icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--slate-400); width: 16px; }

                .distribution-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .dist-group label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--slate-500); margin-bottom: 0.25rem; }
                .dist-group input { width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 700; background: var(--slate-50); }
                .dist-group input:focus { border-color: var(--primary); background: white; outline: none; }

                .matrix-section { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow); }
                .matrix-head { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
                .matrix-head h3 { font-size: 1rem; font-weight: 900; color: var(--slate-900); display: flex; align-items: center; gap: 0.75rem; margin: 0; }
                
                .matrix-scroll-wrapper { display: flex; overflow-x: auto; background: var(--slate-50); }
                .matrix-labels { width: 180px; flex-shrink: 0; background: var(--slate-800); color: white; border-right: 2px solid var(--slate-900); }
                .label-cell { height: 38px; padding: 0 1rem; display: flex; align-items: center; font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .label-cell:last-child { border-bottom: none; }
                
                .matrix-columns { display: flex; }
                .matrix-column { width: 160px; border-right: 1px solid var(--border-light); display: flex; flex-direction: column; transition: all 0.2s; cursor: pointer; }
                .matrix-column:hover { background: rgba(79, 70, 229, 0.02); }
                .matrix-column.active { background: white; box-shadow: inset 0 0 0 2px var(--primary); z-index: 10; width: 180px; }
                .cell { height: 38px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; }
                .cell input, .cell select { width: 100%; height: 100%; border: none; background: transparent; padding: 0 0.75rem; font-size: 0.8125rem; color: var(--slate-700); font-weight: 600; outline: none; }
                .matrix-column.active .cell input { color: var(--primary); font-weight: 700; }
                .cell.header-cell { background: var(--slate-100); justify-content: center; font-weight: 900; color: var(--slate-900); font-size: 0.75rem; }
                .cell.calc-cell { background: #fafdfb; color: #2e7d32; }

                .footer-grid { display: grid; grid-template-columns: 1fr 400px; gap: 1.5rem; }
                .taxes-box { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
                .taxes-head { padding: 1rem 1.5rem; background: var(--slate-900); color: white; display: flex; justify-content: space-between; align-items: center; }
                .taxes-head h4 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin: 0; }
                
                .actions-bar { display: flex; flex-direction: column; gap: 1rem; }
                .btn { padding: 0.75rem 1.5rem; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.8125rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.625rem; transition: all 0.2s; }
                .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(79, 70, 229, 0.4); }
                .btn-secondary { background: white; color: var(--slate-600); border: 1.5px solid var(--border); }
                .btn-success { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .btn-success:hover:not(:disabled) { transform: translateY(-2px); }

                .alert-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: var(--radius-lg); background: white; border-left: 4px solid var(--primary); box-shadow: var(--shadow-xl); display: flex; align-items: center; gap: 0.75rem; z-index: 1000; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <header className="app-header">
                <div className="header-title">
                    <h1>Note de Détail Dynamique</h1>
                    <p>Système de liquidation & codification douanière Matrix-v4</p>
                </div>
                <div className="user-badge">
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role} • {user?.company_name}</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.7rem' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <div className="top-grid">
                <div className="panel">
                    <div className="panel-head">
                        <h2><Users size={14} /> Portefeuille Clients</h2>
                    </div>
                    <div className="panel-body">
                        <table className="mini-table">
                            <thead><tr><th>Désignation</th><th>NINEA</th></tr></thead>
                            <tbody>
                                {clients.map(c => (
                                    <tr key={c.IDCLIENTS} className={selectedClient?.IDCLIENTS === c.IDCLIENTS ? 'selected' : ''} onClick={() => setSelectedClient(c)}>
                                        <td>{c.NomClient}</td><td>{c.NINEA}</td>
                                    </tr>
                                )) || <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Aucun client</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-head">
                        <h2><Folder size={14} /> Dossiers Actifs</h2>
                        {selectedClient && <span style={{ fontSize: '0.6rem', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '10px', color: 'var(--primary)', fontWeight: 700 }}>{selectedClient.NomClient}</span>}
                    </div>
                    <div className="panel-body">
                        <table className="mini-table">
                            <thead><tr><th>Code Dossier</th><th>Référence</th></tr></thead>
                            <tbody>
                                {dossiers.map(d => (
                                    <tr key={d.id || d.IDDossiers} className={selectedDossier?.id === d.id || selectedDossier?.IDDossiers === d.IDDossiers ? 'selected' : ''} onClick={() => setSelectedDossier(d)}>
                                        <td>{d.code || d.CodeDossier}</td><td>{d.label || d.LibelleDossier}</td>
                                    </tr>
                                )) || <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Sélectionnez un client</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-head">
                        <h2><FileText size={14} /> Notes de Détail</h2>
                        <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={handleCreateNote}>
                            <Plus size={10} /> Nouveau
                        </button>
                    </div>
                    <div className="panel-body">
                        <table className="mini-table">
                            <thead><tr><th>Répertoire N°</th><th>Agent Responsable</th></tr></thead>
                            <tbody>
                                {notes.map(n => (
                                    <tr key={n.IDNotesDeDetails} className={selectedNote?.IDNotesDeDetails === n.IDNotesDeDetails ? 'selected' : ''} onClick={() => setSelectedNote(n)}>
                                        <td style={{ fontWeight: 800 }}>{n.REPERTOIRE || 'EN ATTENTE'}</td><td>Agent ID: {n.IdAgent}</td>
                                    </tr>
                                )) || <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Sélectionnez un dossier</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="tools-grid">
                <div className="tool-card">
                    <h3><Search size={14} /> Recherche NTS & Produits</h3>
                    <div className="search-field">
                        <Search className="icon" />
                        <input placeholder="Code NTS ou Libellé commercial..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div style={{ height: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
                        <table className="mini-table">
                            <thead><tr><th>Code</th><th>Article</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.IDProduits} className={selectedProduct === p.IDProduits ? 'selected' : ''} onClick={() => handleSelectProduct(p)}>
                                        <td><strong>{p.NTS}</strong></td><td>{p.Libelle}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="tool-card">
                    <h3><Layers size={14} /> Régimes de Déclaration</h3>
                    <div style={{ height: '235px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
                        <table className="mini-table">
                            <thead><tr><th>Code</th><th>Libellé Régime</th></tr></thead>
                            <tbody>
                                {regimes.map(r => (
                                    <tr key={r.IDRegimeDeclaration} className={selectedRegime === r.IDRegimeDeclaration ? 'selected' : ''} onClick={() => handleSelectRegime(r)}>
                                        <td><strong>{r.CodeRegimeDeclaration}</strong></td><td>{r.LibelleRegimeDeclaration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="tool-card" style={{ background: '#f8fafc' }}>
                    <h3 style={{ color: '#059669' }}><Calculator size={14} /> Répartition & Devise</h3>
                    <div className="distribution-form">
                        <div className="dist-group" style={{ gridColumn: 'span 2' }}>
                            <label>TOTAL FOB CUMULÉ (VALEUR STAT.)</label>
                            <input readOnly value={matrixArticles.reduce((sum, art) => sum + parseFloat(art.FOB || 0), 0).toFixed(2)} style={{ background: '#e2e8f0', color: '#1e293b' }} />
                        </div>
                        <div className="dist-group">
                            <label>FRET GLOBAL</label>
                            <input type="number" value={globalValues.globalFret} onChange={(e) => setGlobalValues({ ...globalValues, globalFret: e.target.value })} />
                        </div>
                        <div className="dist-group">
                            <label>ASSURANCE GLOBAL</label>
                            <input type="number" value={globalValues.globalAssurance} onChange={(e) => setGlobalValues({ ...globalValues, globalAssurance: e.target.value })} />
                        </div>
                        <div className="dist-group" style={{ gridColumn: 'span 2' }}>
                            <label>POIDS BRUT TOTAL (KG)</label>
                            <input type="number" value={globalValues.globalWeight} onChange={(e) => setGlobalValues({ ...globalValues, globalWeight: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.25rem' }}>
                        <button className="btn btn-success" onClick={handleDistribute} style={{ fontSize: '0.75rem' }}>
                            <ArrowRightLeft size={14} /> Répartir
                        </button>
                        <button className="btn btn-secondary" onClick={handleConvertToFCFA} style={{ fontSize: '0.75rem' }}>
                            <Coins size={14} /> En FCFA
                        </button>
                    </div>
                </div>
            </div>

            <div className="matrix-section">
                <div className="matrix-head">
                    <h3><Database size={20} color="var(--primary)" /> Matrice de Liquidation (11 Articles)</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--slate-400)' }}>COLONNE ACTIVE :</div>
                        <div style={{ width: '28px', height: '28px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem' }}>
                            {activeColumnIndex + 1}
                        </div>
                    </div>
                </div>

                <div className="matrix-scroll-wrapper">
                    <div className="matrix-labels">
                        <div className="label-cell" style={{ height: '30px', background: 'rgba(0,0,0,0.2)' }}>INDEX</div>
                        <div className="label-cell">CODE NTS (*)</div>
                        <div className="label-cell">RÉGIME ACC.</div>
                        <div className="label-cell">DPI / B.E.</div>
                        <div className="label-cell">TITRE EXO</div>
                        <div className="label-cell">ORIGINE</div>
                        <div className="label-cell">PROVENANCE</div>
                        <div className="label-cell">VALEUR FOB</div>
                        <div className="label-cell">DEVISE FOB</div>
                        <div className="label-cell">VALEUR FRET</div>
                        <div className="label-cell">DEVISE FRET</div>
                        <div className="label-cell">VALEUR ASSUR.</div>
                        <div className="label-cell">DEVISE ASSUR.</div>
                        <div className="label-cell">NB COLIS</div>
                        <div className="label-cell">POIDS BRUT</div>
                        <div className="label-cell">POIDS NET</div>
                        <div className="label-cell">QTE COMPL.</div>
                        <div className="label-cell">QTE MERCH.</div>
                        <div className="label-cell">COMMISSION</div>
                        <div className="label-cell" style={{ height: '42px', background: 'rgba(46, 125, 50, 0.2)' }}>VALEUR CAF (XOF)</div>
                    </div>

                    <div className="matrix-columns">
                        {matrixArticles.map((article, idx) => (
                            <div
                                key={idx}
                                className={`matrix-column ${activeColumnIndex === idx ? 'active' : ''}`}
                                onClick={() => handleColumnChange(idx)}
                            >
                                <div className="cell header-cell" style={{ height: '30px' }}>{idx + 1}</div>
                                <div className="cell"><input value={article.NTS} onChange={(e) => updateMatrixArticle(idx, 'NTS', e.target.value)} placeholder="0000.00.00" /></div>
                                <div className="cell"><input value={article.CodeRegimeDeclaration} onChange={(e) => updateMatrixArticle(idx, 'CodeRegimeDeclaration', e.target.value)} placeholder="C 000" /></div>
                                <div className="cell"><input value={article.DPI || ''} onChange={(e) => updateMatrixArticle(idx, 'DPI', e.target.value)} /></div>
                                <div className="cell"><input value={article.TitreExo || ''} onChange={(e) => updateMatrixArticle(idx, 'TitreExo', e.target.value)} /></div>
                                <div className="cell"><input value={article.Origine} onChange={(e) => updateMatrixArticle(idx, 'Origine', e.target.value)} maxLength={3} /></div>
                                <div className="cell"><input value={article.Provenance} onChange={(e) => updateMatrixArticle(idx, 'Provenance', e.target.value)} maxLength={3} /></div>
                                <div className="cell"><input type="number" value={article.FOB} onChange={(e) => updateMatrixArticle(idx, 'FOB', e.target.value)} /></div>
                                <div className="cell">
                                    <select value={article.IDDEVISEFOB} onChange={(e) => updateMatrixArticle(idx, 'IDDEVISEFOB', e.target.value)}>
                                        {devises.map((d) => (<option key={d.IDDevises} value={d.IDDevises}>{d.Symbole}</option>))}
                                    </select>
                                </div>
                                <div className="cell"><input type="number" value={article.Fret || 0} onChange={(e) => updateMatrixArticle(idx, 'Fret', e.target.value)} /></div>
                                <div className="cell">
                                    <select value={article.IDDEVISEFRET} onChange={(e) => updateMatrixArticle(idx, 'IDDEVISEFRET', e.target.value)}>
                                        {devises.map((d) => (<option key={d.IDDevises} value={d.IDDevises}>{d.Symbole}</option>))}
                                    </select>
                                </div>
                                <div className="cell"><input type="number" value={article.Assurances || 0} onChange={(e) => updateMatrixArticle(idx, 'Assurances', e.target.value)} /></div>
                                <div className="cell">
                                    <select value={article.IDDEVISEASS} onChange={(e) => updateMatrixArticle(idx, 'IDDEVISEASS', e.target.value)}>
                                        {devises.map((d) => (<option key={d.IDDevises} value={d.IDDevises}>{d.Symbole}</option>))}
                                    </select>
                                </div>
                                <div className="cell"><input type="number" value={article.NBCOLIS || ''} onChange={(e) => updateMatrixArticle(idx, 'NBCOLIS', e.target.value)} /></div>
                                <div className="cell"><input type="number" value={article.BRUT || 0} onChange={(e) => updateMatrixArticle(idx, 'BRUT', e.target.value)} /></div>
                                <div className="cell"><input type="number" value={article.NET || 0} onChange={(e) => updateMatrixArticle(idx, 'NET', e.target.value)} /></div>
                                <div className="cell"><input type="number" value={article.QC || 0} onChange={(e) => updateMatrixArticle(idx, 'QC', e.target.value)} /></div>
                                <div className="cell"><input type="number" value={article.QM || 0} onChange={(e) => updateMatrixArticle(idx, 'QM', e.target.value)} /></div>
                                <div className="cell"><input type="number" value={article.CommissionFournisseur || 0} onChange={(e) => updateMatrixArticle(idx, 'CommissionFournisseur', e.target.value)} /></div>
                                <div className="cell calc-cell" style={{ height: '42px' }}><input readOnly value={calculateCAF(article)} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="footer-grid">
                <div className="taxes-box">
                    <div className="taxes-head">
                        <h4><Tag size={12} /> Liquidation des Taxes ({selectedArticle ? `Art. ${activeColumnIndex + 1}` : "Standard"})</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.7rem', background: '#374151' }} onClick={() => handleCalculateTaxes(matrixArticles[activeColumnIndex].IDArticles)}>
                                <Activity size={12} /> Lancer le Devis
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.7rem' }} onClick={handleCancelLiquidation}>
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>
                    </div>
                    <div style={{ height: '240px', overflowY: 'auto' }}>
                        <table className="mini-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>NPL</th>
                                    <th style={{ width: '80px' }}>CODE</th>
                                    <th>TAXE / DROIT DE DOUANE</th>
                                    <th style={{ textAlign: 'right' }}>TAUX</th>
                                    <th style={{ textAlign: 'right' }}>MONTANT (FCFA)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedArticle ? calculatedTaxes : allTaxes.map(t => ({ ...t, Montant: 0, IsApplicable: true }))).map((tax, i) => (
                                    <tr key={i} style={{ opacity: excludedTaxes.includes(tax.CodeTaxe) ? 0.4 : 1 }}>
                                        <td>
                                            <input type="checkbox" checked={excludedTaxes.includes(tax.CodeTaxe)} onChange={() => handleToggleTaxExclusion(tax.CodeTaxe)} />
                                        </td>
                                        <td style={{ fontWeight: 800 }}>{tax.CodeTaxe}</td>
                                        <td style={{ fontSize: '0.75rem' }}>{tax.LibelleTaxe}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--slate-400)' }}>{tax.Taux ? tax.Taux + '%' : '-'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: tax.Montant > 0 ? '#059669' : 'inherit' }}>{tax.Montant || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {calculatedTaxes.length > 0 && (
                        <div style={{ padding: '1rem 1.5rem', background: 'var(--slate-900)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6 }}>CUMUL TAXES LIQUIDÉES</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#10b981' }}>
                                {calculatedTaxes.reduce((sum, t) => sum + parseFloat(t.Montant || 0), 0).toLocaleString()} <small>XOF</small>
                            </span>
                        </div>
                    )}
                </div>

                <div className="actions-bar">
                    <div className="tool-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}><Save size={14} /> Opérations de Publication</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={handleSaveAllArticles} disabled={isValidated}>
                                <Database size={18} /> Sauvegarder la Matrice
                            </button>
                            <button className="btn btn-success" onClick={handleGeneratePDF} disabled={!selectedNote || isGeneratingPDF}>
                                <Download size={18} /> {isGeneratingPDF ? 'Impression...' : 'Générer Note de Détail (PDF)'}
                            </button>
                            {pdfGenerated && !isValidated && (
                                <button className="btn" style={{ background: '#f59e0b', color: 'white' }} onClick={handleValidateNote}>
                                    <ShieldCheck size={18} /> Valider Fermeture Note
                                </button>
                            )}
                            {isValidated && (
                                <div style={{ padding: '1rem', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontWeight: 800, position: 'relative', overflow: 'hidden' }}>
                                    <CheckCircle2 size={32} style={{ position: 'absolute', right: '-5px', bottom: '-5px', opacity: 0.1 }} />
                                    DOCUMENT SÉCURISÉ & COLLÉ
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className="alert-toast">
                    <Info size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)' }}>{message.text}</span>
                    <button onClick={() => setMessage({ text: '', type: '' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}><X size={14} /></button>
                </div>
            )}
        </div>
    );
}
