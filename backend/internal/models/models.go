package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func newUUID() string {
	return uuid.New().String()
}

type Base struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = newUUID()
	}
	return nil
}

// User — admin user
type User struct {
	Base
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`
	Role     string `gorm:"default:user" json:"role"` // admin | user
}

// Company — singleton company info
type Company struct {
	ID             uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string `json:"name"`
	Description    string `gorm:"type:text" json:"description"`
	Mission        string `gorm:"type:text" json:"mission"`
	LogoURL        string `json:"logo_url"`
	PhoneNumber    string `json:"phone_number"`
	Email          string `json:"email"`
	Address        string `json:"address"`
	FoundedYear    int    `json:"founded_year"`
	StudentsCount  int    `json:"students_count"`
	CoursesCount   int    `json:"courses_count"`
	TeachersCount  int    `json:"teachers_count"`
}

// Teacher
type Teacher struct {
	Base
	Name         string `json:"name"`
	Bio          string `gorm:"type:text" json:"bio"`
	Specialty    string `json:"specialty"`
	PhotoURL     string `json:"photo_url"`
	Experience   int    `json:"experience"` // years
	CoursesCount int    `json:"courses_count"`
	OrderIndex   int    `gorm:"default:0" json:"order_index"`
}

// Category
type Category struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string `json:"name"`
	Slug       string `gorm:"uniqueIndex" json:"slug"`
	OrderIndex int    `gorm:"default:0" json:"order_index"`
}

// Course
type Course struct {
	Base
	Title         string    `json:"title"`
	Description   string    `gorm:"type:text" json:"description"`
	ImageURL      string    `json:"image_url"`
	Price         float64   `json:"price"`
	Language      string    `gorm:"default:ru" json:"language"` // ru | kz
	CategoryID    uint      `json:"category_id"`
	Category      Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	IsCombo       bool      `gorm:"default:false" json:"is_combo"`
	LessonsCount  int       `json:"lessons_count"`
	ProgramsCount int       `json:"programs_count"`
	AverageRating float64   `json:"average_rating"`
	ReviewsCount  int       `json:"reviews_count"`
	Duration      string    `gorm:"default:'1 мес'" json:"duration"`
	Teachers      []Teacher `gorm:"many2many:course_teachers;" json:"teachers,omitempty"`
	Programs      []Program `gorm:"foreignKey:CourseID" json:"programs,omitempty"`
}

// Program (module inside a course)
type Program struct {
	Base
	Title        string    `json:"title"`
	Description  string    `gorm:"type:text" json:"description"`
	ImageURL     string    `json:"image_url"`
	Price        float64   `json:"price"`
	CourseID     string    `gorm:"type:varchar(36)" json:"course_id"`
	LessonsCount int       `json:"lessons_count"`
	OrderIndex   int       `gorm:"default:0" json:"order_index"`
	Teachers     []Teacher `gorm:"many2many:program_teachers;" json:"teachers,omitempty"`
	Lessons      []Lesson  `gorm:"foreignKey:ProgramID;orderBy:order_index" json:"lessons,omitempty"`
}

// Lesson
type Lesson struct {
	Base
	Title      string `json:"title"`
	Content    string `gorm:"type:text" json:"content"`
	ProgramID  string `gorm:"type:varchar(36)" json:"program_id"`
	OrderIndex int    `gorm:"default:0" json:"order_index"`
}

// Review
type Review struct {
	Base
	ProgramID   string   `gorm:"type:varchar(36)" json:"program_id"`
	Program     Program  `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	AuthorName  string   `json:"author_name"`
	AuthorEmail string   `json:"author_email"`
	Rating      int      `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment     string   `gorm:"type:text" json:"comment"`
	IsApproved  bool     `gorm:"default:true" json:"is_approved"`
	CreatedAt   time.Time `json:"created_at"`
}
