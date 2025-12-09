import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Reception from './pages/Reception';
import DoctorView from './pages/DoctorView';
import KioskDisplay from './pages/KioskDisplay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Reception />} />
          <Route path="doctor" element={<DoctorView />} />
          <Route path="kiosk" element={<KioskDisplay />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;