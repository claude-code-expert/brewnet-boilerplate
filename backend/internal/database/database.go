package database

import (
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	driver := os.Getenv("DB_DRIVER")
	if driver == "" {
		driver = "postgres"
	}

	var err error

	switch driver {
	case "postgres":
		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			getEnv("DB_HOST", "postgres"), getEnv("DB_PORT", "5432"),
			getEnv("DB_USER", "brewnet"), getEnv("DB_PASSWORD", ""),
			getEnv("DB_NAME", "brewnet_db"))
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	case "mysql":
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			getEnv("MYSQL_USER", "brewnet"), getEnv("MYSQL_PASSWORD", ""),
			getEnv("MYSQL_HOST", "mysql"), getEnv("MYSQL_PORT", "3306"),
			getEnv("MYSQL_DATABASE", "brewnet_db"))
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	case "sqlite3":
		path := getEnv("SQLITE_PATH", "./data/brewnet_db.db")
		DB, err = gorm.Open(sqlite.Open(path), &gorm.Config{})

	default:
		return fmt.Errorf("unsupported DB_DRIVER: %s", driver)
	}

	return err
}

func CheckConnection() bool {
	if DB == nil {
		return false
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return false
	}
	if err := sqlDB.Ping(); err != nil {
		return false
	}
	return true
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
