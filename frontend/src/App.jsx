import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CompanySettings from './pages/CompanySettings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ClientForm from './pages/ClientForm'
import StatusList from './pages/StatusList'
import CreditPurchase from './pages/CreditPurchase'
import GroupList from './pages/GroupList'
import UserList from './pages/UserList'
import UserForm from './pages/UserForm'
import DossierCreate from './pages/DossierCreate'
import DossierEdit from './pages/DossierEdit'
import DossierList from './pages/DossierList'
import NoteDeDetail from './pages/NoteDeDetail'
import ProductList from './pages/ProductList'
import TiersPage from './pages/TiersPage'
import CotationPage from './pages/CotationPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Chargement...</div>
    }

    return user ? children : <Navigate to="/login" />
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <CompanySettings />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/company-settings" element={
                        <ProtectedRoute>
                            <CompanySettings />
                        </ProtectedRoute>
                    } />
                    <Route path="/statuts" element={
                        <ProtectedRoute>
                            <StatusList />
                        </ProtectedRoute>
                    } />
                    <Route path="/credits/buy" element={
                        <ProtectedRoute>
                            <CreditPurchase />
                        </ProtectedRoute>
                    } />
                    <Route path="/groupes" element={
                        <ProtectedRoute>
                            <GroupList />
                        </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                        <ProtectedRoute>
                            <UserList />
                        </ProtectedRoute>
                    } />
                    <Route path="/users/new" element={
                        <ProtectedRoute>
                            <UserForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/users/:id" element={
                        <ProtectedRoute>
                            <UserForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/clients/new" element={
                        <ProtectedRoute>
                            <ClientForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/clients/:id" element={
                        <ProtectedRoute>
                            <ClientForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/tiers" element={
                        <ProtectedRoute>
                            <TiersPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/cotations" element={
                        <ProtectedRoute>
                            <CotationPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/dossiers" element={
                        <ProtectedRoute>
                            <DossierList />
                        </ProtectedRoute>
                    } />
                    <Route path="/dossiers/new" element={
                        <ProtectedRoute>
                            <DossierCreate />
                        </ProtectedRoute>
                    } />
                    <Route path="/dossiers/:id" element={
                        <ProtectedRoute>
                            <DossierEdit />
                        </ProtectedRoute>
                    } />
                    <Route path="/notes" element={
                        <ProtectedRoute>
                            <NoteDeDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/produits" element={
                        <ProtectedRoute>
                            <ProductList />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
