import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LanguageToggle from './components/LanguageToggle';
import Home from './pages/Home';
import DealerSearch from './pages/DealerSearch';
import DealerProfile from './pages/DealerProfile';
import ProductSearch from './pages/ProductSearch';
import ReportFiling from './pages/ReportFiling';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

// Layout & Config
import DashboardLayout from './components/DashboardLayout';

// Admin Pages
import DataAnalyticsDashboard from './AdminSection/DataAnalyticsDashboard';
import HandleDealer from './AdminSection/HandleDealer';
import HandleComplaints from './AdminSection/HandleComplaints';
import AdminOrders from './AdminSection/AdminOrders';
import AdminProfile from './AdminSection/Profile';

// Dealer Pages
import ComplaintManagement from './DealerSection/ComplaintManagement';
import DealerProducts from './DealerSection/Products';
import PrivateDealerProfile from './DealerSection/Profile';
import DealerOrders from './DealerSection/Orders';

// Farmer Pages
import FarmerComplaintAndFraud from './FarmerSection/ComplaintAndFraud';
import FarmerDealerSearch from './FarmerSection/DealerSearch';
import FarmerProfile from './FarmerSection/Profile';
import FarmerOrders from './FarmerSection/Orders';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999, top: 70 }} toastOptions={{ duration: 2000 }} />
      <Routes>
        {/* Public Routes - Keep original Navbar layout here if desired, or let them manage their own */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role}`} replace /> : (
            <>
              <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
              <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
                <LanguageToggle />
              </div>
              <Home />
            </>
          )
        } />
        
        <Route path="/dealers" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <DealerSearch />
          </>
        } />

        <Route path="/dealers/:id" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <DealerProfile />
          </>
        } />

        <Route path="/products" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <ProductSearch />
          </>
        } />

        <Route path="/report" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <ReportFiling />
          </>
        } />
        {/* Protected Dashboard Routes - Uses the dynamic layout */}
        {/* Note: Adjust 'admin', 'dealer', 'farmer' values to whatever your auth context uses for user.role */}
        <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="analytics" element={<DataAnalyticsDashboard />} />
          <Route path="dealers" element={<HandleDealer />} />
          <Route path="complaints" element={<HandleComplaints />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/dealer" element={<DashboardLayout allowedRoles={['dealer']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="products" element={<DealerProducts />} />
          <Route path="orders" element={<DealerOrders />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="profile" element={<PrivateDealerProfile />} />
        </Route>

        <Route path="/farmer" element={<DashboardLayout allowedRoles={['farmer', 'user']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dealers" element={<FarmerDealerSearch />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="complaint" element={<FarmerComplaintAndFraud />} />
          <Route path="profile" element={<FarmerProfile />} />
        </Route>

        <Route path="*" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <NotFound />
          </>
        } />
      </Routes>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
