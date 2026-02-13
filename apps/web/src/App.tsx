import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Blog from './pages/Blog'
import Dashboard from './pages/Dashboard'
import Catalogue from './pages/Catalogue'
import MyTasks from './pages/MyTasks'
import TaskDetail from './pages/TaskDetail'
import Profile from './pages/Profile'
import TaskPage from './pages/TaskPage'
import Admin from './pages/Admin'
import AdminExecutions from './pages/AdminExecutions'
import AdminExecutionDetail from './pages/AdminExecutionDetail'
import AdminCatalogue from './pages/AdminCatalogue'
import AdminProofs from './pages/AdminProofs'
import AdminValidation from './pages/AdminValidation'
import AdminAudit from './pages/AdminAudit'
import AdminComplianceFinance from './pages/AdminComplianceFinance'
import AdminDisputes from './pages/AdminDisputes'
import AdminPricing from './pages/AdminPricing'
import DisputeOpen from './pages/DisputeOpen'
import TaskProofUpload from './pages/TaskProofUpload'
import AirbnbInstructions from './pages/AirbnbInstructions'
import AirbnbPhotoCapture from './pages/AirbnbPhotoCapture'
import AirbnbResult from './pages/AirbnbResult'
import PlaygroundCvInstant from './pages/PlaygroundCvInstant'
import CvPage from './pages/cv'
import CvProcessingPage from './pages/cv-processing'
import CvResultPage from './pages/cv-result'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/app" element={<Navigate to="/catalogue" replace />} />

          {/* Pages protégées - User */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalogue"
            element={
              <ProtectedRoute>
                <Catalogue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <TaskDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes/open/:id"
            element={
              <ProtectedRoute>
                <DisputeOpen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/proof/upload"
            element={
              <ProtectedRoute>
                <TaskProofUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/airbnb/instructions/:taskId"
            element={
              <ProtectedRoute>
                <AirbnbInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/airbnb/capture/:taskId"
            element={
              <ProtectedRoute>
                <AirbnbPhotoCapture />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/airbnb/result/:executionId"
            element={
              <ProtectedRoute>
                <AirbnbResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/*"
            element={
              <ProtectedRoute>
                <TaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv"
            element={
              <ProtectedRoute>
                <CvPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv/processing"
            element={
              <ProtectedRoute>
                <CvProcessingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv/result"
            element={
              <ProtectedRoute>
                <CvResultPage />
              </ProtectedRoute>
            }
          />

          {/* Pages protégées - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/executions"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminExecutions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/executions/:id"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminExecutionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/catalogue"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminCatalogue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/proofs"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminProofs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/validation"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminValidation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit/:executionId"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/compliance-finance"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminComplianceFinance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute requireRole={['admin', 'reviewer']}>
                <AdminDisputes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pricing"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminPricing />
              </ProtectedRoute>
            }
          />

          {/* Playground (dev) */}
          <Route path="/playground" element={<PlaygroundCvInstant />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
