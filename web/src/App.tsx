import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import LandingPage from './pages/LandingPage';
import { ConsultantForm } from './pages/ConsultantForm';
import { TCOReport } from './pages/TCOReport';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/consultancy" element={<ConsultantForm />} />
        <Route path="/report" element={<TCOReport />} />
      </Routes>
    </Layout>
  );
}

export default App;
