// WissensHub Azure Infrastructure Orchestrator
// Deploys all child modules with output chaining for cross-module dependencies
// Usage: az deployment group create --resource-group <rg> --template-file infra/main.bicep --parameters infra/parameters/dev.bicepparam --parameters sqlAdminPassword=<password>

targetScope = 'resourceGroup'

@allowed([
  'dev'
  'prod'
])
param environment string

param location string = resourceGroup().location

@secure()
param sqlAdminPassword string

// 1. Storage Account for Functions runtime
module storage 'modules/storage.bicep' = {
  name: 'storage-${environment}'
  params: {
    environment: environment
    location: location
  }
}

// 2. Application Insights + Log Analytics
module appInsights 'modules/app-insights.bicep' = {
  name: 'app-insights-${environment}'
  params: {
    environment: environment
    location: location
  }
}

// 3. Azure SQL Server + Database
module sql 'modules/sql.bicep' = {
  name: 'sql-${environment}'
  params: {
    environment: environment
    location: location
    sqlAdminPassword: sqlAdminPassword
  }
}

// 4. Function App (deployed before Key Vault -- uses deterministic KV name to break circular dep)
module functionApp 'modules/function-app.bicep' = {
  name: 'function-app-${environment}'
  params: {
    environment: environment
    location: location
    storageAccountConnectionString: storage.outputs.storageAccountConnectionString
    keyVaultName: 'wh-${environment}-kv'
  }
}

// 5. Key Vault (deployed after Function App -- needs principalId for RBAC assignment)
module keyVault 'modules/key-vault.bicep' = {
  name: 'key-vault-${environment}'
  params: {
    environment: environment
    location: location
    sqlConnectionString: sql.outputs.connectionString
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    appInsightsConnectionString: appInsights.outputs.connectionString
    functionAppPrincipalId: functionApp.outputs.principalId
  }
}

// Outputs for CI/CD pipeline consumption
output functionAppName string = functionApp.outputs.functionAppName
output functionAppHostName string = functionApp.outputs.defaultHostName
output sqlServerFqdn string = sql.outputs.serverFqdn
output keyVaultName string = keyVault.outputs.keyVaultName
