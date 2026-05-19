// @title RoLab LMS API
// @version 1.0
// @description API for RoLab Learning Management System
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/config"
	"github.com/rolab/lms/internal/database"
	"github.com/rolab/lms/internal/handlers"
	"github.com/rolab/lms/internal/middleware"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "github.com/rolab/lms/docs"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL)
	database.Migrate(db)

	r := gin.Default()
	r.Use(middleware.CORS())

	// Serve uploaded files
	r.Static("/uploads", cfg.UploadDir)

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Init handlers
	authH := handlers.NewAuthHandler(db, cfg.JWTSecret)
	companyH := handlers.NewCompanyHandler(db)
	teacherH := handlers.NewTeacherHandler(db)
	categoryH := handlers.NewCategoryHandler(db)
	courseH := handlers.NewCourseHandler(db)
	programH := handlers.NewProgramHandler(db)
	lessonH := handlers.NewLessonHandler(db)
	reviewH := handlers.NewReviewHandler(db)
	uploadH := handlers.NewUploadHandler(cfg.UploadDir, fmt.Sprintf("http://localhost:%s", cfg.Port))

	v1 := r.Group("/api/v1")

	// Auth
	v1.POST("/auth/login", authH.Login)

	// Public routes
	v1.GET("/company", companyH.Get)
	v1.GET("/teachers", teacherH.List)
	v1.GET("/teachers/:id", teacherH.Get)
	v1.GET("/categories", categoryH.List)
	v1.GET("/courses", courseH.List)
	v1.GET("/courses/:id", courseH.Get)
	v1.GET("/courses/:id/reviews", reviewH.ListForCourse)
	v1.POST("/programs/:id/reviews", reviewH.Submit)
	v1.GET("/programs/:id", programH.Get)
	v1.GET("/lessons/:id", lessonH.Get)

	// Admin routes (JWT required)
	auth := middleware.AuthMiddleware(cfg.JWTSecret)
	admin := v1.Group("/admin")
	admin.Use(auth, middleware.AdminOnly())

	admin.POST("/auth/register", authH.Register)

	admin.GET("/company", companyH.Get)
	admin.PUT("/company", companyH.Update)

	admin.GET("/teachers", teacherH.List)
	admin.POST("/teachers", teacherH.Create)
	admin.PUT("/teachers/:id", teacherH.Update)
	admin.DELETE("/teachers/:id", teacherH.Delete)

	admin.GET("/categories", categoryH.List)
	admin.POST("/categories", categoryH.Create)
	admin.PUT("/categories/:id", categoryH.Update)
	admin.DELETE("/categories/:id", categoryH.Delete)

	admin.GET("/courses", courseH.AdminList)
	admin.POST("/courses", courseH.Create)
	admin.PUT("/courses/:id", courseH.Update)
	admin.DELETE("/courses/:id", courseH.Delete)

	admin.GET("/programs", programH.AdminList)
	admin.POST("/programs", programH.Create)
	admin.PUT("/programs/:id", programH.Update)
	admin.DELETE("/programs/:id", programH.Delete)

	admin.GET("/lessons", lessonH.AdminList)
	admin.POST("/lessons", lessonH.Create)
	admin.PUT("/lessons/:id", lessonH.Update)
	admin.DELETE("/lessons/:id", lessonH.Delete)

	admin.GET("/reviews", reviewH.AdminList)
	admin.PUT("/reviews/:id/approve", reviewH.Approve)
	admin.DELETE("/reviews/:id", reviewH.Delete)

	admin.POST("/upload", uploadH.Upload)

	log.Printf("Server running on :%s", cfg.Port)
	log.Printf("Swagger UI: http://localhost:%s/swagger/index.html", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
