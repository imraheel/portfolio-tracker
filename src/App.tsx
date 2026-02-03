import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Stocks from './pages/Stocks';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MutualFundsList from './pages/mutualFunds/FundsList';
import MutualFundPurchases from './pages/mutualFunds/Purchases';
import MutualFundWithdrawals from './pages/mutualFunds/Withdrawals';
import CryptoList from './pages/crypto/CryptoList';
import CryptoPurchases from './pages/crypto/Purchases';
import CryptoWithdrawals from './pages/crypto/Withdrawals';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Mutual Funds Routes */}
        <Route path="mutual-funds" element={<MutualFundsList />} />
        <Route path="mutual-funds/purchases" element={<MutualFundPurchases />} />
        <Route path="mutual-funds/withdrawals" element={<MutualFundWithdrawals />} />
        
        {/* Crypto Routes */}
        <Route path="crypto" element={<CryptoList />} />
        <Route path="crypto/purchases" element={<CryptoPurchases />} />
        <Route path="crypto/withdrawals" element={<CryptoWithdrawals />} />
      </Route>
    </Routes>
  );
}

export default App;
