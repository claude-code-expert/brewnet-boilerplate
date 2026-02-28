package handler

import (
	"net/http"
	"runtime"

	"github.com/gin-gonic/gin"
)

func Hello(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello from Gin!",
		"lang":    "go",
		"version": runtime.Version(),
	})
}
