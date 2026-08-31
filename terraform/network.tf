resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-${var.environment}-vnet"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  address_space = [
    "10.0.0.0/16"
  ]

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet" "frontend" {
  name                 = "${var.project_name}-${var.environment}-frontend-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name

  address_prefixes = [
    "10.0.1.0/24"
  ]
}

resource "azurerm_subnet" "backend" {
  name                 = "${var.project_name}-${var.environment}-backend-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name

  address_prefixes = [
    "10.0.2.0/24"
  ]
}

resource "azurerm_subnet" "database" {
  name                 = "${var.project_name}-${var.environment}-database-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name

  address_prefixes = [
    "10.0.3.0/24"
  ]
}