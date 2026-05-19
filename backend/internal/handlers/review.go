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

// ListCourseReviews godoc
// @Summary List approved reviews for a course (through its programs)
// @Tags reviews
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {array} models.Review
// @Router /courses/{id}/reviews [get]
func (h *ReviewHandler) ListForCourse(c *gin.Context) {
	var reviews []models.Review
	h.db.
		Preload("Program").
		Joins("JOIN programs ON programs.id = reviews.program_id").
		Where("programs.course_id = ? AND reviews.is_approved = true", c.Param("id")).
		Order("reviews.created_at desc").
		Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

type ReviewInput struct {
	AuthorName  string `json:"author_name" binding:"required"`
	AuthorEmail string `json:"author_email"`
	Rating      int    `json:"rating" binding:"required,min=1,max=5"`
	Comment     string `json:"comment" binding:"required"`
}

// SubmitReview godoc
// @Summary Submit a review for a program
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path string true "Program ID"
// @Param body body ReviewInput true "Review data"
// @Success 201 {object} models.Review
// @Router /programs/{id}/reviews [post]
func (h *ReviewHandler) Submit(c *gin.Context) {
	var input ReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	programID := c.Param("id")
	var program models.Program
	if err := h.db.First(&program, "id = ?", programID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "program not found"})
		return
	}

	review := models.Review{
		ProgramID:   programID,
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

	h.recalculateCourseRating(program.CourseID)
	h.db.Preload("Program").First(&review, "id = ?", review.ID)
	c.JSON(http.StatusCreated, gin.H{"data": review})
}

// AdminListReviews godoc
// @Summary List all reviews (admin)
// @Tags reviews
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Review
// @Router /admin/reviews [get]
func (h *ReviewHandler) AdminList(c *gin.Context) {
	var reviews []models.Review
	h.db.Preload("Program").Order("created_at desc").Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"data": reviews})
}

// ApproveReview godoc
// @Summary Approve a review
// @Tags reviews
// @Security BearerAuth
// @Param id path string true "Review ID"
// @Success 200 {object} models.Review
// @Router /admin/reviews/{id}/approve [put]
func (h *ReviewHandler) Approve(c *gin.Context) {
	var review models.Review
	if err := h.db.Preload("Program").First(&review, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	h.db.Model(&review).Update("is_approved", true)
	h.recalculateCourseRating(review.Program.CourseID)
	c.JSON(http.StatusOK, gin.H{"data": review})
}

// DeleteReview godoc
// @Summary Delete a review
// @Tags reviews
// @Security BearerAuth
// @Param id path string true "Review ID"
// @Success 200 {object} map[string]string
// @Router /admin/reviews/{id} [delete]
func (h *ReviewHandler) Delete(c *gin.Context) {
	var review models.Review
	if err := h.db.Preload("Program").First(&review, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	courseID := review.Program.CourseID
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
		Select("AVG(reviews.rating) as avg, COUNT(*) as count").
		Joins("JOIN programs ON programs.id = reviews.program_id").
		Where("programs.course_id = ? AND reviews.is_approved = true", courseID).
		Scan(&result)

	h.db.Model(&models.Course{}).Where("id = ?", courseID).Updates(map[string]interface{}{
		"average_rating": result.Avg,
		"reviews_count":  result.Count,
	})
}
