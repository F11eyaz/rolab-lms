export interface Company {
  id: number;
  name: string;
  description: string;
  mission: string;
  logo_url: string;
  phone_number: string;
  email: string;
  address: string;
  founded_year: number;
  students_count: number;
  courses_count: number;
  teachers_count: number;
}

export interface Teacher {
  id: string;
  name: string;
  bio: string;
  specialty: string;
  photo_url: string;
  experience: number;
  courses_count: number;
  order_index: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  order_index: number;
  courses_count?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  language: string;
  category_id: number;
  category: Category;
  is_combo: boolean;
  lessons_count: number;
  programs_count: number;
  average_rating: number;
  reviews_count: number;
  duration: string;
  teachers: Teacher[];
  programs: Program[];
  created_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  course_id: string;
  lessons_count: number;
  order_index: number;
  teachers: Teacher[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  program_id: string;
  order_index: number;
}

export interface Review {
  id: string;
  program_id: string;
  program?: Program;
  author_name: string;
  author_email: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface CourseFilters {
  search?: string;
  category_id?: number;
  language?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
