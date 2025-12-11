import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reception from './pages/Reception';
import DoctorView from './pages/DoctorView';
import KioskDisplay from './pages/KioskDisplay';
import PatientHistory from './pages/PatientHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Reception />} />
          <Route path="doctor" element={<DoctorView />} />
          <Route path="kiosk" element={<KioskDisplay />} />
          <Route path="patients" element={<PatientHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;