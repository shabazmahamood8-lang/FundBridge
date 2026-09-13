import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './components/common/Toast.js';

import Navbar from './components/common/Navbar.js';
import Footer from './components/common/Footer.js';
import ProtectedRoute from './components/common/ProtectedRoute.js';

import Home from './pages/Home.js';
import ExploreCampaigns from './pages/ExploreCampaigns.js';
import CampaignDetails from './pages/CampaignDetails.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import NotFound from './pages/NotFound.js';

import DashboardLayout from './pages/dashboard/DashboardLayout.js';
import DashboardHome from './pages/dashboard/DashboardHome.js';
import AddCampaign from './pages/dashboard/creator/AddCampaign.js';
import MyCampaigns from './pages/dashboard/creator/MyCampaigns.js';
import Withdrawals from './pages/dashboard/creator/Withdrawals.js';
import MyContributions from './pages/dashboard/supporter/MyContributions.js';
import PurchaseCredits from './pages/dashboard/supporter/PurchaseCredits.js';
import PaymentHistory from './pages/dashboard/supporter/PaymentHistory.js';
import ManageUsers from './pages/dashboard/admin/ManageUsers.js';
import ManageCampaigns from './pages/dashboard/admin/ManageCampaigns.js';
import WithdrawalRequests from './pages/dashboard/admin/WithdrawalRequests.js';
import Reports from './pages/dashboard/admin/Reports.js';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white">
            <Navbar />

            <div className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/campaigns" element={<ExploreCampaigns />} />
                <Route path="/campaigns/:id" element={<CampaignDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="explore" element={<ExploreCampaigns />} />

                  {/* Creator Routes */}
                  <Route
                    path="add-campaign"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <AddCampaign />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="my-campaigns"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <MyCampaigns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="withdrawals"
                    element={
                      <ProtectedRoute allowedRoles={['creator', 'admin']}>
                        <Withdrawals />
                      </ProtectedRoute>
                    }
                  />

                  {/* Supporter Routes */}
                  <Route
                    path="my-contributions"
                    element={
                      <ProtectedRoute allowedRoles={['supporter', 'admin']}>
                        <MyContributions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="purchase-credit"
                    element={
                      <ProtectedRoute allowedRoles={['supporter', 'admin']}>
                        <PurchaseCredits />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="payment-history" element={<PaymentHistory />} />

                  {/* Admin Routes */}
                  <Route
                    path="manage-users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="manage-campaigns"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageCampaigns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="withdrawal-requests"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <WithdrawalRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
