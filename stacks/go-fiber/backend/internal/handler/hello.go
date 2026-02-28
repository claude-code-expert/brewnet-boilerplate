package handler

import (
	"runtime"

	"github.com/gofiber/fiber/v3"
)

func Hello(c fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"message": "Hello from Fiber!",
		"lang":    "go",
		"version": runtime.Version(),
	})
}
