package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type ProgramHandler struct {
	db *gorm.DB
}

func NewProgramHandler(db *gorm.DB) *ProgramHandler {
	return &ProgramHandler{db: db}
}

// GetProgram godoc
// @Summary Get program detail with lessons
// @Tags programs
// @Produce json
// @Param id path string true "Program ID"
// @Success 200 {object} models.Program
// @Router /programs/{id} [get]
func (h *ProgramHandler) Get(c *gin.Context) {
	var program models.Program
	err := h.db.
		Preload("Teachers").
		Preload("Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		First(&program, "id = ?", c.Param("id")).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": program})
}

// ListAdminPrograms godoc
// @Summary List all programs (admin)
// @Tags programs
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Program
// @Router /admin/programs [get]
func (h *ProgramHandler) AdminList(c *gin.Context) {
	var programs []models.Program
	h.db.Preload("Teachers").Order("course_id, order_index asc").Find(&programs)
	c.JSON(http.StatusOK, gin.H{"data": programs})
}

type ProgramInput struct {
	Title      string   `json:"title" binding:"required"`
	Description string  `json:"description"`
	ImageURL   string   `json:"image_url"`
	Price      float64  `json:"price"`
	CourseID   string   `json:"course_id"`
	OrderIndex int      `json:"order_index"`
	TeacherIDs []string `json:"teacher_ids"`
}

// CreateProgram godoc
// @Summary Create program
// @Tags programs
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body ProgramInput true "Program data"
// @Success 201 {object} models.Program
// @Router /admin/programs [post]
func (h *ProgramHandler) Create(c *gin.Context) {
	var input ProgramInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	program := models.Program{
		Title:       input.Title,
		Description: input.Description,
		ImageURL:    input.ImageURL,
		Price:       input.Price,
		CourseID:    input.CourseID,
		OrderIndex:  input.OrderIndex,
	}

	if err := h.db.Create(&program).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(input.TeacherIDs) > 0 {
		var teachers []models.Teacher
		h.db.Where("id IN ?", input.TeacherIDs).Find(&teachers)
		h.db.Model(&program).Association("Teachers").Replace(teachers)
	}

	// Update course lessons count
	h.updateCourseCounts(input.CourseID)

	h.db.Preload("Teachers").First(&program, "id = ?", program.ID)
	c.JSON(http.StatusCreated, gin.H{"data": program})
}

// UpdateProgram godoc
// @Summary Update program
// @Tags programs
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Program ID"
// @Param body body ProgramInput true "Program data"
// @Success 200 {object} models.Program
// @Router /admin/programs/{id} [put]
func (h *ProgramHandler) Update(c *gin.Context) {
	var program models.Program
	if err := h.db.First(&program, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var input ProgramInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&program).Updates(map[string]interface{}{
		"title":       input.Title,
		"description": input.Description,
		"image_url":   input.ImageURL,
		"price":       input.Price,
		"course_id":   input.CourseID,
		"order_index": input.OrderIndex,
	})

	if len(input.TeacherIDs) > 0 {
		var teachers []models.Teacher
		h.db.Where("id IN ?", input.TeacherIDs).Find(&teachers)
		h.db.Model(&program).Association("Teachers").Replace(teachers)
	}

	h.db.Preload("Teachers").First(&program, "id = ?", program.ID)
	c.JSON(http.StatusOK, gin.H{"data": program})
}

// DeleteProgram godoc
// @Summary Delete program
// @Tags programs
// @Security BearerAuth
// @Param id path string true "Program ID"
// @Success 200 {object} map[string]string
// @Router /admin/programs/{id} [delete]
func (h *ProgramHandler) Delete(c *gin.Context) {
	var program models.Program
	if err := h.db.First(&program, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	courseID := program.CourseID
	h.db.Delete(&program)
	h.updateCourseCounts(courseID)
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}

func (h *ProgramHandler) updateCourseCounts(courseID string) {
	if courseID == "" {
		return
	}
	var lessonsCount int64
	h.db.Model(&models.Lesson{}).
		Joins("JOIN programs ON programs.id = lessons.program_id").
		Where("programs.course_id = ?", courseID).
		Count(&lessonsCount)

	var programsCount int64
	h.db.Model(&models.Program{}).Where("course_id = ?", courseID).Count(&programsCount)

	h.db.Model(&models.Course{}).Where("id = ?", courseID).Updates(map[string]interface{}{
		"lessons_count":  lessonsCount,
		"programs_count": programsCount,
	})
}
