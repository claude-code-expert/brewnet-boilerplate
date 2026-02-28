package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func Root(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"service": "echo-backend",
		"status":  "running",
		"message": "\xf0\x9f\x8d\xba Brewnet says hello!",
	})
}
