import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ConstraintForm } from './pages/ConstraintForm';
import { TCOReport } from './pages/TCOReport';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ConstraintForm />} />
            <Route path="/report" element={<TCOReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
