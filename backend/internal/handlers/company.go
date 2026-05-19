package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rolab/lms/internal/models"
	"gorm.io/gorm"
)

type CompanyHandler struct {
	db *gorm.DB
}

func NewCompanyHandler(db *gorm.DB) *CompanyHandler {
	return &CompanyHandler{db: db}
}

// GetCompany godoc
// @Summary Get company info
// @Tags company
// @Produce json
// @Success 200 {object} models.Company
// @Router /company [get]
func (h *CompanyHandler) Get(c *gin.Context) {
	var company models.Company
	if err := h.db.First(&company).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": models.Company{}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": company})
}

// UpdateCompany godoc
// @Summary Update company info
// @Tags company
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body models.Company true "Company data"
// @Success 200 {object} models.Company
// @Router /admin/company [put]
func (h *CompanyHandler) Update(c *gin.Context) {
	var input models.Company
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var company models.Company
	if err := h.db.First(&company).Error; err != nil {
		input.ID = 1
		h.db.Create(&input)
		c.JSON(http.StatusOK, gin.H{"data": input})
		return
	}

	h.db.Model(&company).Updates(&input)
	c.JSON(http.StatusOK, gin.H{"data": company})
}
