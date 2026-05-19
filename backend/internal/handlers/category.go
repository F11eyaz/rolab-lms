package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	db *gorm.DB
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{db: db}
}

// ListCategories godoc
// @Summary List all categories
// @Tags categories
// @Produce json
// @Success 200 {array} models.Category
// @Router /categories [get]
func (h *CategoryHandler) List(c *gin.Context) {
	type CategoryWithCount struct {
		models.Category
		CoursesCount int64 `json:"courses_count"`
	}

	var categories []models.Category
	h.db.Order("order_index asc").Find(&categories)

	result := make([]CategoryWithCount, 0, len(categories))
	for _, cat := range categories {
		var count int64
		h.db.Model(&models.Course{}).Where("category_id = ?", cat.ID).Count(&count)
		result = append(result, CategoryWithCount{Category: cat, CoursesCount: count})
	}

	var total int64
	h.db.Model(&models.Course{}).Count(&total)

	c.JSON(http.StatusOK, gin.H{"data": result, "total_courses": total})
}

// CreateCategory godoc
// @Summary Create category
// @Tags categories
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body models.Category true "Category data"
// @Success 201 {object} models.Category
// @Router /admin/categories [post]
func (h *CategoryHandler) Create(c *gin.Context) {
	var input models.Category
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

// UpdateCategory godoc
// @Summary Update category
// @Tags categories
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Category ID"
// @Param body body models.Category true "Category data"
// @Success 200 {object} models.Category
// @Router /admin/categories/{id} [put]
func (h *CategoryHandler) Update(c *gin.Context) {
	var category models.Category
	if err := h.db.First(&category, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var input models.Category
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.db.Model(&category).Updates(&input)
	c.JSON(http.StatusOK, gin.H{"data": category})
}

// DeleteCategory godoc
// @Summary Delete category
// @Tags categories
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]string
// @Router /admin/categories/{id} [delete]
func (h *CategoryHandler) Delete(c *gin.Context) {
	if err := h.db.Delete(&models.Category{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}
