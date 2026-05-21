package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type LessonHandler struct {
	db *gorm.DB
}

func NewLessonHandler(db *gorm.DB) *LessonHandler {
	return &LessonHandler{db: db}
}

func (h *LessonHandler) Get(c *gin.Context) {
	var lesson models.Lesson
	if err := h.db.First(&lesson, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": lesson})
}

func (h *LessonHandler) AdminList(c *gin.Context) {
	var lessons []models.Lesson
	h.db.Order("course_id, order_index asc").Find(&lessons)
	c.JSON(http.StatusOK, gin.H{"data": lessons})
}

type LessonInput struct {
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content"`
	CourseID   string `json:"course_id" binding:"required"`
	OrderIndex int    `json:"order_index"`
}

func (h *LessonHandler) Create(c *gin.Context) {
	var input LessonInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lesson := models.Lesson{
		Title:      input.Title,
		Content:    input.Content,
		CourseID:   input.CourseID,
		OrderIndex: input.OrderIndex,
	}

	if err := h.db.Create(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.updateCourseLessonsCount(input.CourseID)
	c.JSON(http.StatusCreated, gin.H{"data": lesson})
}

func (h *LessonHandler) Update(c *gin.Context) {
	var lesson models.Lesson
	if err := h.db.First(&lesson, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var input LessonInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&lesson).Updates(map[string]interface{}{
		"title":       input.Title,
		"content":     input.Content,
		"course_id":   input.CourseID,
		"order_index": input.OrderIndex,
	})

	c.JSON(http.StatusOK, gin.H{"data": lesson})
}

func (h *LessonHandler) Delete(c *gin.Context) {
	var lesson models.Lesson
	if err := h.db.First(&lesson, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	courseID := lesson.CourseID
	h.db.Delete(&lesson)
	h.updateCourseLessonsCount(courseID)
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}

func (h *LessonHandler) updateCourseLessonsCount(courseID string) {
	var count int64
	h.db.Model(&models.Lesson{}).Where("course_id = ?", courseID).Count(&count)
	h.db.Model(&models.Course{}).Where("id = ?", courseID).Update("lessons_count", count)
}
