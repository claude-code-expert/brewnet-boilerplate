package handler

import (
	"github.com/gofiber/fiber/v3"
)

func Echo(c fiber.Ctx) error {
	body := c.Body()
	if len(body) == 0 {
		return c.JSON(fiber.Map{})
	}
	c.Set("Content-Type", "application/json")
	return c.Send(body)
}
