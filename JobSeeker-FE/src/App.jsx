import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailPage from './pages/JobDetailPage';
import SeekerProfilePage from './pages/SeekerProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import PostJobPage from './pages/PostJobPage';
import RecruitmentPage from './pages/RecruitmentPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'seeker': return <Navigate to="/jobs" replace />;
    case 'recruiter': return <Navigate to="/recruiter/my-jobs" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function AppLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seeker routes */}
        <Route path="/jobs" element={
          <ProtectedRoute roles={['seeker']}>
            <JobSearchPage />
          </ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={
          <ProtectedRoute roles={['seeker']}>
            <JobDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['seeker']}>
            <SeekerProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/my-applications" element={
          <ProtectedRoute roles={['seeker']}>
            <MyApplicationsPage />
          </ProtectedRoute>
        } />

        {/* Recruiter routes */}
        <Route path="/recruiter/my-jobs" element={
          <ProtectedRoute roles={['recruiter']}>
            <RecruitmentPage />
          </ProtectedRoute>
        } />
        <Route path="/recruiter/post-job" element={
          <ProtectedRoute roles={['recruiter']}>
            <PostJobPage />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
