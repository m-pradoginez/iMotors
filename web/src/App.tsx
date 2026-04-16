import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ConsultantForm } from './pages/ConsultantForm';
import { TCOReport } from './pages/TCOReport';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <Routes>
          <Route path="/" element={<ConsultantForm />} />
          <Route path="/report" element={<TCOReport />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
