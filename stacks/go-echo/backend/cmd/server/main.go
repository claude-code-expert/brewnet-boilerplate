package main

import (
	"log"

	"brewnet-go-backend/internal/database"
	"brewnet-go-backend/internal/handler"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if err := database.Connect(); err != nil {
		log.Printf("Warning: DB connection failed: %v", err)
	}

	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	e.GET("/", handler.Root)
	e.GET("/health", handler.Health)
	e.GET("/api/hello", handler.Hello)
	e.POST("/api/echo", handler.Echo)

	if err := e.Start(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
