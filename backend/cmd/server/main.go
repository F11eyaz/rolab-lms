package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/config"
	"github.com/rolab/lms/internal/database"
	"github.com/rolab/lms/internal/handlers"
	"github.com/rolab/lms/internal/middleware"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL)
	database.Migrate(db)

	r := gin.Default()
	r.Use(middleware.CORS())

	r.Static("/uploads", cfg.UploadDir)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	authH := handlers.NewAuthHandler(db, cfg.JWTSecret)
	companyH := handlers.NewCompanyHandler(db)
	teacherH := handlers.NewTeacherHandler(db)
	courseH := handlers.NewCourseHandler(db)
	lessonH := handlers.NewLessonHandler(db)
	reviewH := handlers.NewReviewHandler(db)
	uploadH := handlers.NewUploadHandler(cfg.UploadDir, cfg.BaseURL)

	v1 := r.Group("/api/v1")

	v1.POST("/auth/login", authH.Login)

	v1.GET("/company", companyH.Get)
	v1.GET("/teachers", teacherH.List)
	v1.GET("/teachers/:id", teacherH.Get)
	v1.GET("/courses", courseH.List)
	v1.GET("/courses/:id", courseH.Get)
	v1.GET("/courses/:id/reviews", reviewH.ListForCourse)
	v1.POST("/courses/:id/reviews", reviewH.Submit)
	v1.GET("/lessons/:id", lessonH.Get)

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

	admin.GET("/courses", courseH.AdminList)
	admin.POST("/courses", courseH.Create)
	admin.PUT("/courses/:id", courseH.Update)
	admin.DELETE("/courses/:id", courseH.Delete)

	admin.GET("/lessons", lessonH.AdminList)
	admin.POST("/lessons", lessonH.Create)
	admin.PUT("/lessons/:id", lessonH.Update)
	admin.DELETE("/lessons/:id", lessonH.Delete)

	admin.GET("/reviews", reviewH.AdminList)
	admin.PUT("/reviews/:id/approve", reviewH.Approve)
	admin.DELETE("/reviews/:id", reviewH.Delete)

	admin.POST("/upload", uploadH.Upload)

	log.Printf("Server running on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
