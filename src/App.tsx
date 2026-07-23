import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Placeholder } from './pages/Placeholder';
import { useScreenInit } from './useScreenInit';
import { Splash } from './pages/Splash';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { SelectRole } from './pages/SelectRole';
import { Profile } from './pages/Profile';

// Sender pages
import { SenderDashboard } from './pages/sender/SenderDashboard';
import { CreateRequest } from './pages/sender/CreateRequest';
import { SearchTravellers } from './pages/sender/SearchTravellers';
import { DeliveryTracking } from './pages/sender/DeliveryTracking';
import { SenderPayments } from './pages/sender/SenderPayments';
import { SenderHistory } from './pages/sender/SenderHistory';

// Traveller pages
import { TravellerDashboard } from './pages/traveller/TravellerDashboard';
import { AvailableDeliveries } from './pages/traveller/AvailableDeliveries';
import { TravellerDeliveries } from './pages/traveller/TravellerDeliveries';
import { TravellerTracking } from './pages/traveller/TravellerTracking';
import { EarningsDashboard } from './pages/traveller/EarningsDashboard';

import { Chat } from './pages/Chat';

export function App() {
  useScreenInit(); // Required for Magic Patterns
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" theme="dark" richColors />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/splash" element={<Splash />} />
            <Route
              path="/about"
              element={<Placeholder title="About SHIPMATE" />} />
            
            <Route
              path="/how-it-works"
              element={<Placeholder title="How it Works" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Unified dashboard (role selection screen) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SelectRole />
              </ProtectedRoute>
            }
          />

          {/* Sender Protected Routes */}
          <Route
            path="/sender"
            element={
              <ProtectedRoute>
                <DashboardLayout role="sender" />
              </ProtectedRoute>
            }>
            
            <Route index element={<SenderDashboard />} />
            <Route path="create" element={<CreateRequest />} />
            <Route path="search" element={<SearchTravellers />} />
            <Route path="tracking" element={<DeliveryTracking />} />
            <Route path="tracking/:id" element={<DeliveryTracking />} />
            <Route path="chat" element={<Chat />} />
            <Route path="payments" element={<SenderPayments />} />
            <Route path="history" element={<SenderHistory />} />
            
          </Route>

          {/* Traveller Protected Routes */}
          <Route
            path="/traveller"
            element={
              <ProtectedRoute>
                <DashboardLayout role="traveller" />
              </ProtectedRoute>
            }>
            
            <Route index element={<TravellerDashboard />} />
            <Route path="available" element={<AvailableDeliveries />} />
            <Route path="deliveries" element={<TravellerDeliveries />} />
            <Route path="tracking" element={<TravellerTracking />} />
            <Route path="tracking/:id" element={<TravellerTracking />} />
            <Route path="chat" element={<Chat />} />
            <Route path="earnings" element={<EarningsDashboard />} />
            <Route path="history" element={<TravellerDeliveries />} />
            
          </Route>

          {/* Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PublicLayout />
              </ProtectedRoute>
            }>
            
            <Route index element={<Profile />} />
          </Route>

          <Route
            path="/settings"
            element={
            <ProtectedRoute>
                <PublicLayout />
              </ProtectedRoute>
            }>
            
            <Route index element={<Placeholder title="Settings" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>);

}