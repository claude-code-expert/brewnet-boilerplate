package handler

import (
	"time"

	"brewnet-go-backend/internal/database"
	"github.com/gofiber/fiber/v3"
)

func Health(c fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":       "ok",
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
		"db_connected": database.CheckConnection(),
	})
}
