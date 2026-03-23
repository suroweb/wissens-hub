using '../main.bicep'

param environment = 'prod'
param location = 'westeurope'
// sqlAdminPassword must be provided at deployment time via --parameters sqlAdminPassword=<value>
