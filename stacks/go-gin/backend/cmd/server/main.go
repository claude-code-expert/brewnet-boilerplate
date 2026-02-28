package main

import (
	"log"

	"brewnet-go-backend/internal/database"
	"brewnet-go-backend/internal/handler"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := database.Connect(); err != nil {
		log.Printf("Warning: DB connection failed: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	r.GET("/", handler.Root)
	r.GET("/health", handler.Health)
	r.GET("/api/hello", handler.Hello)
	r.POST("/api/echo", handler.Echo)

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
