// App Service Plan + Function App + managed identity (per D-03)
// Linux Consumption plan with .NET 10 isolated worker

param environment string
param location string

@secure()
param storageAccountConnectionString string

param keyVaultName string

resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'wh-${environment}-asp'
  location: location
  kind: 'linux'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2024-04-01' = {
  name: 'wh-${environment}-func'
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|10.0'
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageAccountConnectionString
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=AppInsightsConnectionString)'
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=SqlConnectionString)'
        }
      ]
      cors: {
        allowedOrigins: [
          'https://*.sharepoint.com'
        ]
      }
    }
  }
}

output principalId string = functionApp.identity.principalId
output functionAppName string = functionApp.name
output defaultHostName string = functionApp.properties.defaultHostName
