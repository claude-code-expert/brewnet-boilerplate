package handler

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Echo(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil || len(body) == 0 {
		return c.JSON(http.StatusOK, map[string]interface{}{})
	}
	return c.Blob(http.StatusOK, "application/json", body)
}
