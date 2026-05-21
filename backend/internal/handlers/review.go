package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type ReviewHandler struct {
	db *gorm.DB
}

func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{db: db}
}

func (h *ReviewHandler) ListForCourse(c *gin.Context) {
	var reviews []models.Review
	h.db.Where("course_id = ? AND is_approved = true", c.Param("id")).
		Order("created_at desc").
		Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

type ReviewInput struct {
	AuthorName  string `json:"author_name" binding:"required"`
	AuthorEmail string `json:"author_email"`
	Rating      int    `json:"rating" binding:"required,min=1,max=5"`
	Comment     string `json:"comment" binding:"required"`
}

func (h *ReviewHandler) Submit(c *gin.Context) {
	var input ReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID := c.Param("id")
	var course models.Course
	if err := h.db.First(&course, "id = ?", courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	review := models.Review{
		CourseID:    courseID,
		AuthorName:  input.AuthorName,
		AuthorEmail: input.AuthorEmail,
		Rating:      input.Rating,
		Comment:     input.Comment,
		IsApproved:  true,
	}

	if err := h.db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.recalculateCourseRating(courseID)
	c.JSON(http.StatusCreated, gin.H{"data": review})
}

func (h *ReviewHandler) AdminList(c *gin.Context) {
	var reviews []models.Review
	h.db.Order("created_at desc").Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

func (h *ReviewHandler) Approve(c *gin.Context) {
	var review models.Review
	if err := h.db.First(&review, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	h.db.Model(&review).Update("is_approved", true)
	h.recalculateCourseRating(review.CourseID)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

func (h *ReviewHandler) Delete(c *gin.Context) {
	var review models.Review
	if err := h.db.First(&review, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	courseID := review.CourseID
	h.db.Delete(&review)
	h.recalculateCourseRating(courseID)
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}

func (h *ReviewHandler) recalculateCourseRating(courseID string) {
	if courseID == "" {
		return
	}
	type Result struct {
		Avg   float64
		Count int64
	}
	var result Result
	h.db.Model(&models.Review{}).
		Select("AVG(rating) as avg, COUNT(*) as count").
		Where("course_id = ? AND is_approved = true", courseID).
		Scan(&result)

	h.db.Model(&models.Course{}).Where("id = ?", courseID).Updates(map[string]interface{}{
		"average_rating": result.Avg,
		"reviews_count":  result.Count,
	})
}
