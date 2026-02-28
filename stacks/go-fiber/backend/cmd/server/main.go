package main

import (
	"log"

	"brewnet-go-backend/internal/database"
	"brewnet-go-backend/internal/handler"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	if err := database.Connect(); err != nil {
		log.Printf("Warning: DB connection failed: %v", err)
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	app.Get("/", handler.Root)
	app.Get("/health", handler.Health)
	app.Get("/api/hello", handler.Hello)
	app.Post("/api/echo", handler.Echo)

	if err := app.Listen(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
