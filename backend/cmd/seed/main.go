package main

import (
	"fmt"

	"github.com/joho/godotenv"
	"github.com/rolab/lms/internal/config"
	"github.com/rolab/lms/internal/database"
	"github.com/rolab/lms/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../../.env")
	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	database.Migrate(db)

	// Admin user
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 12)
	admin := models.User{Email: "admin@rolab.kz", Password: string(hash), Role: "admin"}
	db.FirstOrCreate(&admin, models.User{Email: "admin@rolab.kz"})
	fmt.Println("Admin:", admin.Email, "/ password: admin123")

	// Company
	company := models.Company{
		Name:          "RoLab Education",
		Description:   "Современная образовательная платформа для педагогов и учащихся в сфере ИКТ и робототехники.",
		Mission:       "Сделать обучение робототехнике и ИКТ доступным и понятным для школ Казахстана.",
		PhoneNumber:   "+7 776 309 9306",
		Email:         "rolabacademy@gmail.com",
		Address:       "Казахстан",
		FoundedYear:   2020,
		StudentsCount: 8000,
		CoursesCount:  3,
		TeachersCount: 4,
	}
	db.FirstOrCreate(&company, models.Company{})

	// Categories (kept for DB compatibility)
	cat := models.Category{Name: "Курсы", Slug: "courses", OrderIndex: 1}
	db.FirstOrCreate(&cat, models.Category{Slug: "courses"})

	fmt.Println("Seed complete")
}
