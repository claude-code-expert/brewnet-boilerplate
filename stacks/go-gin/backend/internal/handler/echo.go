package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Echo(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil || len(body) == 0 {
		c.JSON(http.StatusOK, gin.H{})
		return
	}
	c.Data(http.StatusOK, "application/json", body)
}
