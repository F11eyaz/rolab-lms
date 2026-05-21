import { Routes, Route, Navigate } from 'react-router-dom';
import AboutPage from './pages/About/AboutPage';
import LandingPage from './pages/Landing/LandingPage';
import CoursesPage from './pages/Courses/CoursesPage';
import CourseDetailPage from './pages/CourseDetail/CourseDetailPage';
import LessonPage from './pages/Lesson/LessonPage';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import CoursesAdmin from './pages/Admin/CoursesAdmin';
import LessonsAdmin from './pages/Admin/LessonsAdmin';
import TeachersAdmin from './pages/Admin/TeachersAdmin';
import ReviewsAdmin from './pages/Admin/ReviewsAdmin';
import CompanyAdmin from './pages/Admin/CompanyAdmin';
import AdminLogin from './pages/Admin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AboutPage />} />
      <Route path="/platform" element={<LandingPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/lessons/:id" element={<LessonPage />} />

      <Route path="/admin/login" element={<AdminLogin />} />

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
        <Route path="courses" element={<CoursesAdmin />} />
        <Route path="lessons" element={<LessonsAdmin />} />
        <Route path="teachers" element={<TeachersAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
