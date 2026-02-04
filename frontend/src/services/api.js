import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
}

export const structureAPI = {
    getMe: () => api.get('/structures/me'),
    updateMe: (formData) => api.put('/structures/me', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    getCountries: () => api.get('/pays')
}

export const clientsAPI = {
    getAll: () => api.get('/clients'),
    getOne: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/clients/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const statutsAPI = {
    getAll: () => api.get('/statuts'),
    create: (data) => api.post('/statuts', data),
    update: (id, data) => api.put(`/statuts/${id}`, data),
    delete: (id) => api.delete(`/statuts/${id}`)
}

export const transactionsAPI = {
    getAll: () => api.get('/transactions'),
    purchase: (data) => api.post('/transactions/purchase', data),
    confirm: (data) => api.post('/transactions/confirm', data)
}

export const groupesAPI = {
    getAll: () => api.get('/groupes'),
    getOne: (id) => api.get(`/groupes/${id}`),
    create: (data) => api.post('/groupes', data),
    update: (id, data) => api.put(`/groupes/${id}`, data),
    delete: (id) => api.delete(`/groupes/${id}`)
}

export const usersAPI = {
    getAll: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    reactivate: (id) => api.patch(`/users/${id}/reactivate`),
    getPermissions: (id) => api.get(`/users/${id}/permissions`),
    getPermissionsList: () => api.get('/users/permissions/list'),
    updatePermissions: (id, permissions) => api.put(`/users/${id}/permissions`, { permissions })
}

export const dossiersAPI = {
    getAll: () => api.get('/dossiers'),
    getOne: (id) => api.get(`/dossiers/${id}`),
    create: (data) => api.post('/dossiers', data),
    update: (id, data) => api.put(`/dossiers/${id}`, data),
    delete: (id) => api.delete(`/dossiers/${id}`)
};

export const notesAPI = {
    getAll: (dossierId) => api.get(`/notes${dossierId ? `?dossier_id=${dossierId}` : ''}`),
    getOne: (id) => api.get(`/notes/${id}`),
    create: (data) => api.post('/notes', data),
    update: (id, data) => api.put(`/notes/${id}`, data),
    delete: (id) => api.delete(`/notes/${id}`),
    getArticles: (noteId) => api.get(`/notes/${noteId}/articles`),
    addArticle: (noteId, data) => api.post(`/notes/${noteId}/articles`, data),
    updateArticle: (articleId, data) => api.put(`/notes/articles/${articleId}`, data),
    deleteArticle: (articleId) => api.delete(`/notes/articles/${articleId}`),
    distribute: (noteId, data) => api.post(`/notes/${noteId}/distribute`, data),
    convertToFCFA: (noteId) => api.post(`/notes/${noteId}/convert-to-fcfa`),
    calculateTaxes: (articleId, data) => api.post(`/notes/articles/${articleId}/calculate-taxes`, data),
    clearLiquidations: (articleId) => api.delete(`/notes/articles/${articleId}/liquidations`),
    // PDF Generation
    generatePDF: (noteId) => api.get(`/notes/${noteId}/generate-pdf`, { responseType: 'blob' }),
    validate: (noteId) => api.post(`/notes/${noteId}/validate`),
    getPdfStatus: (noteId) => api.get(`/notes/${noteId}/pdf-status`)
};

export const produitsAPI = {
    getAll: (params) => api.get('/produits', { params }),
    search: (query) => api.get(`/produits/search?q=${query}`),
    getByNTS: (nts) => api.get(`/produits/${nts}`)
};

export const regimesAPI = {
    getAll: () => api.get('/regimes')
};

export const devisesAPI = {
    getAll: () => api.get('/devises')
};

export const paysAPI = {
    getAll: () => api.get('/pays')
};

export const tiersAPI = {
    getAll: () => api.get('/tiers'),
    getOne: (id) => api.get(`/tiers/${id}`),
    create: (data) => api.post('/tiers', data),
    update: (id, data) => api.put(`/tiers/${id}`, data),
    delete: (id) => api.delete(`/tiers/${id}`)
};

export const activitesAPI = {
    getAll: () => api.get('/activites')
};


export const taxesAPI = {
    getAll: (nts) => api.get(`/taxes${nts ? `?nts=${nts}` : ''}`)
};

export const ordresTransitAPI = {
    getAll: () => api.get('/ordres-transit'),
    getOne: (id) => api.get(`/ordres-transit/${id}`),
    getByDossier: (dossierId) => api.get(`/ordres-transit/dossier/${dossierId}`),
    create: (data) => api.post('/ordres-transit', data),
    update: (id, data) => api.put(`/ordres-transit/${id}`, data),
    delete: (id) => api.delete(`/ordres-transit/${id}`)
};

export const incotermsAPI = {
    getAll: () => api.get('/incoterms'),
    create: (data) => api.post('/incoterms', data)
};

export const regimesOTAPI = {
    getAll: () => api.get('/regimes-ot'),
    create: (data) => api.post('/regimes-ot', data)
};

export const typesDocumentsOTAPI = {
    getAll: () => api.get('/types-documents-ot'),
    create: (data) => api.post('/types-documents-ot', data)
};

export const statisticsAPI = {
    getDashboard: () => api.get('/statistics/dashboard')
};

export const cotationsAPI = {
    getByDossier: (dossierId) => api.get(`/cotations/dossier/${dossierId}`),
    getDashboard: () => api.get('/cotations/dashboard'),
    create: (data) => api.post('/cotations', data)
};

export default api
