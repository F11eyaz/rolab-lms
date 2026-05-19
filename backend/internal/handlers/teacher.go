package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type TeacherHandler struct {
	db *gorm.DB
}

func NewTeacherHandler(db *gorm.DB) *TeacherHandler {
	return &TeacherHandler{db: db}
}

// ListTeachers godoc
// @Summary List all teachers
// @Tags teachers
// @Produce json
// @Success 200 {array} models.Teacher
// @Router /teachers [get]
func (h *TeacherHandler) List(c *gin.Context) {
	var teachers []models.Teacher
	h.db.Order("order_index asc, created_at asc").Find(&teachers)
	c.JSON(http.StatusOK, gin.H{"data": teachers})
}

// GetTeacher godoc
// @Summary Get teacher by ID
// @Tags teachers
// @Produce json
// @Param id path string true "Teacher ID"
// @Success 200 {object} models.Teacher
// @Router /teachers/{id} [get]
func (h *TeacherHandler) Get(c *gin.Context) {
	var teacher models.Teacher
	if err := h.db.First(&teacher, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": teacher})
}

// CreateTeacher godoc
// @Summary Create teacher
// @Tags teachers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body models.Teacher true "Teacher data"
// @Success 201 {object} models.Teacher
// @Router /admin/teachers [post]
func (h *TeacherHandler) Create(c *gin.Context) {
	var input models.Teacher
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": input})
}

// UpdateTeacher godoc
// @Summary Update teacher
// @Tags teachers
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Teacher ID"
// @Param body body models.Teacher true "Teacher data"
// @Success 200 {object} models.Teacher
// @Router /admin/teachers/{id} [put]
func (h *TeacherHandler) Update(c *gin.Context) {
	var teacher models.Teacher
	if err := h.db.First(&teacher, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var input models.Teacher
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Model(&teacher).Updates(&input)
	c.JSON(http.StatusOK, gin.H{"data": teacher})
}

// DeleteTeacher godoc
// @Summary Delete teacher
// @Tags teachers
// @Security BearerAuth
// @Param id path string true "Teacher ID"
// @Success 200 {object} map[string]string
// @Router /admin/teachers/{id} [delete]
func (h *TeacherHandler) Delete(c *gin.Context) {
	if err := h.db.Delete(&models.Teacher{}, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}
