package handler

import (
	"net/http"
	"time"

	"brewnet-go-backend/internal/database"
	"github.com/labstack/echo/v4"
)

func Health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":       "ok",
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
		"db_connected": database.CheckConnection(),
	})
}
