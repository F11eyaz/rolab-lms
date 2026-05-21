package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type CourseHandler struct {
	db *gorm.DB
}

func NewCourseHandler(db *gorm.DB) *CourseHandler {
	return &CourseHandler{db: db}
}

// ListCourses godoc
// @Summary List courses with filters
// @Tags courses
// @Produce json
// @Param search query string false "Search term"
// @Param category_id query int false "Category ID"
// @Param language query string false "Language (ru|kz)"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param sort query string false "Sort: rating|price_asc|price_desc|newest"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {array} models.Course
// @Router /courses [get]
func (h *CourseHandler) List(c *gin.Context) {
	query := h.db.Model(&models.Course{}).Preload("Category")

	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}
	if catID := c.Query("category_id"); catID != "" {
		query = query.Where("category_id = ?", catID)
	}
	if lang := c.Query("language"); lang != "" {
		query = query.Where("language = ?", lang)
	}
	if minPrice := c.Query("min_price"); minPrice != "" {
		if v, err := strconv.ParseFloat(minPrice, 64); err == nil {
			query = query.Where("price >= ?", v)
		}
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if v, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			query = query.Where("price <= ?", v)
		}
	}

	switch c.Query("sort") {
	case "rating":
		query = query.Order("average_rating desc")
	case "price_asc":
		query = query.Order("price asc")
	case "price_desc":
		query = query.Order("price desc")
	case "newest":
		query = query.Order("created_at desc")
	default:
		query = query.Order("created_at desc")
	}

	var total int64
	query.Count(&total)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var courses []models.Course
	query.Offset(offset).Limit(limit).Find(&courses)

	c.JSON(http.StatusOK, gin.H{
		"data":  courses,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetCourse godoc
// @Summary Get course by ID
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.Course
// @Router /courses/{id} [get]
func (h *CourseHandler) Get(c *gin.Context) {
	var course models.Course
	err := h.db.
		Preload("Category").
		Preload("Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		First(&course, "id = ?", c.Param("id")).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": course})
}

type CourseInput struct {
	Title          string  `json:"title" binding:"required"`
	Description    string  `json:"description"`
	ProgramContent string  `json:"program_content"`
	Glossary       string  `json:"glossary"`
	ImageURL       string  `json:"image_url"`
	Price          float64 `json:"price"`
	Language       string  `json:"language"`
	CategoryID     uint    `json:"category_id"`
	IsCombo        bool    `json:"is_combo"`
	Duration       string  `json:"duration"`
}

// CreateCourse godoc
// @Summary Create course
// @Tags courses
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body CourseInput true "Course data"
// @Success 201 {object} models.Course
// @Router /admin/courses [post]
func (h *CourseHandler) Create(c *gin.Context) {
	var input CourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	course := models.Course{
		Title:          input.Title,
		Description:    input.Description,
		ProgramContent: input.ProgramContent,
		Glossary:       input.Glossary,
		ImageURL:       input.ImageURL,
		Price:          input.Price,
		Language:       input.Language,
		CategoryID:     input.CategoryID,
		IsCombo:        input.IsCombo,
		Duration:       input.Duration,
	}
	if course.Language == "" {
		course.Language = "ru"
	}
	if course.Duration == "" {
		course.Duration = "1 мес"
	}

	if err := h.db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	h.db.Preload("Category").First(&course, "id = ?", course.ID)
	c.JSON(http.StatusCreated, gin.H{"data": course})
}

// UpdateCourse godoc
// @Summary Update course
// @Tags courses
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param body body CourseInput true "Course data"
// @Success 200 {object} models.Course
// @Router /admin/courses/{id} [put]
func (h *CourseHandler) Update(c *gin.Context) {
	var course models.Course
	if err := h.db.First(&course, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var input CourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Model(&course).Updates(map[string]interface{}{
		"title":           input.Title,
		"description":     input.Description,
		"program_content": input.ProgramContent,
		"glossary":        input.Glossary,
		"image_url":       input.ImageURL,
		"price":           input.Price,
		"language":        input.Language,
		"category_id":     input.CategoryID,
		"is_combo":        input.IsCombo,
		"duration":        input.Duration,
	})

	h.db.Preload("Category").First(&course, "id = ?", course.ID)
	c.JSON(http.StatusOK, gin.H{"data": course})
}

// DeleteCourse godoc
// @Summary Delete course
// @Tags courses
// @Security BearerAuth
// @Param id path string true "Course ID"
// @Success 200 {object} map[string]string
// @Router /admin/courses/{id} [delete]
func (h *CourseHandler) Delete(c *gin.Context) {
	if err := h.db.Delete(&models.Course{}, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "deleted"})
}

// ListAdminCourses godoc
// @Summary List all courses for admin (no pagination limit)
// @Tags courses
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Course
// @Router /admin/courses [get]
func (h *CourseHandler) AdminList(c *gin.Context) {
	var courses []models.Course
	h.db.Preload("Category").Order("created_at desc").Find(&courses)
	c.JSON(http.StatusOK, gin.H{"data": courses})
}
