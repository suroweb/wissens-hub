using '../main.bicep'

param environment = 'dev'
param location = 'westeurope'
// sqlAdminPassword must be provided at deployment time via --parameters sqlAdminPassword=<value>
