package handler

import (
	"github.com/gofiber/fiber/v3"
)

func Root(c fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"service": "fiber-backend",
		"status":  "running",
		"message": "Hello Brewnet (https://www.brewnet.dev)",
	})
}
