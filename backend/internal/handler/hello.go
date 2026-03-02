package handler

import (
	"net/http"
	"runtime"

	"github.com/labstack/echo/v4"
)

func Hello(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Hello from Echo!",
		"lang":    "go",
		"version": runtime.Version(),
	})
}
