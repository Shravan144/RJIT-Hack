import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LanguageToggle from './components/LanguageToggle';
import Home from './pages/Home';
import DealerSearch from './pages/DealerSearch';
import DealerProfile from './pages/DealerProfile';
import ProductSearch from './pages/ProductSearch';
import ReportFiling from './pages/ReportFiling';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Navbar />
      <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
        <LanguageToggle />
      </div>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/dealers" element={<DealerSearch />} />
        <Route path="/dealers/:id" element={<DealerProfile />} />
        <Route path="/products" element={<ProductSearch />} />
        <Route path="/report"  element={<ReportFiling />} />
        <Route path="/admin"   element={<AdminDashboard />} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
    </>
  );
}
