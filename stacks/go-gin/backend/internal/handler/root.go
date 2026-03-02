package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Root(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service": "gin-backend",
		"status":  "running",
		"message": "Hello Brewnet (https://www.brewnet.dev)",
	})
}
