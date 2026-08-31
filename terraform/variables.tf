variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "Central India"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "food-ordering"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}
