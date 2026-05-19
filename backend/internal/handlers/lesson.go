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

// GetLesson godoc
// @Summary Get lesson content
// @Tags lessons
// @Produce json
// @Param id path string true "Lesson ID"
// @Success 200 {object} models.Lesson
// @Router /lessons/{id} [get]
func (h *LessonHandler) Get(c *gin.Context) {
	var lesson models.Lesson
	if err := h.db.First(&lesson, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": lesson})
}

// ListAdminLessons godoc
// @Summary List all lessons (admin)
// @Tags lessons
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Lesson
// @Router /admin/lessons [get]
func (h *LessonHandler) AdminList(c *gin.Context) {
	var lessons []models.Lesson
	h.db.Order("program_id, order_index asc").Find(&lessons)
	c.JSON(http.StatusOK, gin.H{"data": lessons})
}

type LessonInput struct {
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content"`
	ProgramID  string `json:"program_id" binding:"required"`
	OrderIndex int    `json:"order_index"`
}

// CreateLesson godoc
// @Summary Create lesson
// @Tags lessons
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body LessonInput true "Lesson data"
// @Success 201 {object} models.Lesson
// @Router /admin/lessons [post]
func (h *LessonHandler) Create(c *gin.Context) {
	var input LessonInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lesson := models.Lesson{
		Title:      input.Title,
		Content:    input.Content,
		ProgramID:  input.ProgramID,
		OrderIndex: input.OrderIndex,
	}

	if err := h.db.Create(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.updateProgramLessonsCount(input.ProgramID)
	c.JSON(http.StatusCreated, gin.H{"data": lesson})
}

// UpdateLesson godoc
// @Summary Update lesson
// @Tags lessons
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Lesson ID"
// @Param body body LessonInput true "Lesson data"
// @Success 200 {object} models.Lesson
// @Router /admin/lessons/{id} [put]
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
		"program_id":  input.ProgramID,
		"order_index": input.OrderIndex,
	})

	c.JSON(http.StatusOK, gin.H{"data": lesson})
}

// DeleteLesson godoc
// @Summary Delete lesson
// @Tags lessons
// @Security BearerAuth
// @Param id path string true "Lesson ID"
// @Success 200 {object} map[string]string
// @Router /admin/lessons/{id} [delete]
func (h *LessonHandler) Delete(c *gin.Context) {
	var lesson models.Lesson
	if err := h.db.First(&lesson, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	programID := lesson.ProgramID
	h.db.Delete(&lesson)
	h.updateProgramLessonsCount(programID)
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}

func (h *LessonHandler) updateProgramLessonsCount(programID string) {
	var count int64
	h.db.Model(&models.Lesson{}).Where("program_id = ?", programID).Count(&count)
	h.db.Model(&models.Program{}).Where("id = ?", programID).Update("lessons_count", count)
}
