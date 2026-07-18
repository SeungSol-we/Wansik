import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SchoolMealPage from './pages/SchoolMealPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import RecognitionResultPage from './pages/RecognitionResultPage';
import ManualEntryPage from './pages/ManualEntryPage';
import MealGuidePage from './pages/MealGuidePage';
import WeeklyReportPage from './pages/WeeklyReportPage';
import HealthProfilePage from './pages/HealthProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/school-meal" element={<SchoolMealPage />} />
            <Route path="/capture" element={<PhotoCapturePage />} />
            <Route path="/recognition" element={<RecognitionResultPage />} />
            <Route path="/manual-entry" element={<ManualEntryPage />} />
            <Route path="/meals/:mealId/guide" element={<MealGuidePage />} />
            <Route path="/report" element={<WeeklyReportPage />} />
            <Route path="/profile" element={<HealthProfilePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;