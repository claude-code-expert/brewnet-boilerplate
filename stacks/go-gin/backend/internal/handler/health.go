package handler

import (
	"net/http"
	"time"

	"brewnet-go-backend/internal/database"
	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":       "ok",
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
		"db_connected": database.CheckConnection(),
	})
}
