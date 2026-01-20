# RDS Module

variable "app_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name = "${var.app_name}-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.app_name}-${var.environment}"
    Environment = var.environment
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${var.app_name}-${var.environment}"

  engine = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  max_allocated_storage = 100
  storage_type = "gp3"
  storage_encrypted = true

  db_name = replace(var.app_name, "-", "_")
  username = "postgres"
  password = random_password.db_password.result

  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  backup_retention_period = 7
  skip_final_snapshot = var.environment != "prod"

  tags = {
    Name = "${var.app_name}-${var.environment}"
    Environment = var.environment
  }
}

# Random password for DB
resource "random_password" "db_password" {
  length = 32
  special = false
}

# Store password in SSM
resource "aws_ssm_parameter" "db_password" {
  name = "/${var.app_name}/${var.environment}/db-password"
  description = "Database password for ${var.app_name}"
  type = "SecureString"
  value = random_password.db_password.result

  tags = {
    Environment = var.environment
  }
}

# Outputs
output "endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_name" {
  value = aws_db_instance.main.db_name
}