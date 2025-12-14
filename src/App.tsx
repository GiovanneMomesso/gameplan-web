import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Join from './pages/Join/Join';
import Dashboard from './pages/Dashboard/Dashboard';
import GroupDetail from './pages/GroupDetail/GroupDetail';
import AcceptInvite from './pages/AcceptInvite/AcceptInvite';

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/join" element={<Join />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/groups/:id"
                            element={
                                <ProtectedRoute>
                                    <GroupDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/invites/accept"
                            element={
                                <ProtectedRoute>
                                    <AcceptInvite />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
