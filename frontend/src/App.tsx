import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import CoursesPage from './pages/Courses/CoursesPage';
import CourseDetailPage from './pages/CourseDetail/CourseDetailPage';
import ProgramDetailPage from './pages/ProgramDetail/ProgramDetailPage';
import LessonPage from './pages/Lesson/LessonPage';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import CoursesAdmin from './pages/Admin/CoursesAdmin';
import ProgramsAdmin from './pages/Admin/ProgramsAdmin';
import LessonsAdmin from './pages/Admin/LessonsAdmin';
import TeachersAdmin from './pages/Admin/TeachersAdmin';
import ReviewsAdmin from './pages/Admin/ReviewsAdmin';
import CompanyAdmin from './pages/Admin/CompanyAdmin';
import CategoriesAdmin from './pages/Admin/CategoriesAdmin';
import AdminLogin from './pages/Admin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/lessons/:id" element={<LessonPage />} />

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="company" element={<CompanyAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="courses" element={<CoursesAdmin />} />
        <Route path="programs" element={<ProgramsAdmin />} />
        <Route path="lessons" element={<LessonsAdmin />} />
        <Route path="teachers" element={<TeachersAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
