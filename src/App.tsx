import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/stocks/Wallet';
import Stocks from './pages/stocks/Stocks';
import Transactions from './pages/stocks/Transactions';
import StockReports from './pages/stocks/Reports';
import Settings from './pages/Settings';
import MutualFundsList from './pages/mutualFunds/FundsList';
import MutualFundTransactions from './pages/mutualFunds/Transactions';
import MutualFundReports from './pages/mutualFunds/Reports';
import CryptoList from './pages/crypto/CryptoList';
import CryptoTransactions from './pages/crypto/Transactions';
import Notes from './pages/Notes/Notes';

function App() {
  const { theme } = useTheme();
  return (
    <>
      <Toaster position="top-right" richColors theme={theme} />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Stocks Routes */}
        <Route path="stocks" element={<Stocks />} />
        <Route path="stocks/wallet" element={<Wallet />} />
        <Route path="stocks/transactions" element={<Transactions />} />
        <Route path="stocks/reports" element={<StockReports />} />
        
        {/* Mutual Funds Routes */}
        <Route path="mutual-funds" element={<MutualFundsList />} />
        <Route path="mutual-funds/transactions" element={<MutualFundTransactions />} />
        <Route path="mutual-funds/reports" element={<MutualFundReports />} />
        
        {/* Crypto Routes */}
        <Route path="crypto" element={<CryptoList />} />
        <Route path="crypto/transactions" element={<CryptoTransactions />} />

        {/* Notes Route */}
        <Route path="notes" element={<Notes />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
