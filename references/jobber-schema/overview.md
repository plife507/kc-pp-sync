# Jobber GraphQL API — Overview
**API Version:** 2025-04-16
**Introspection Date:** 2025-03-20
**Base URL:** `https://api.getjobber.com/api/graphql`

## Schema Summary
| Category | Count |
|----------|-------|
| Root Queries | 58 |
| Mutations | 99 |
| Object Types | 344 |
| Input Types | 185 |
| Enum Types | 85 |
| Interface Types | 15 |
| Union Types | 10 |
| Scalar Types | 17 |
| **Total Types** | **656** |

## Current OAuth Scopes
```
read_clients
read_requests
read_quotes
read_jobs
read_scheduled_items
read_invoices
read_jobber_payments
read_users
write_tax_rates          ← only write scope
read_equipment
read_expenses
read_custom_field_configurations
read_time_sheets
```

## Mutations by Domain
| Domain | Count | Required Scope | Status |
|--------|-------|---------------|--------|
| Clients | 9 | `write_clients` | 🔒 |
| Custom Fields | 9 | `write_custom_field_configurations` | 🔒 |
| Expenses | 3 | `write_expenses` | 🔒 |
| Invoices | 9 | `write_invoices` | 🔒 |
| Jobs | 13 | `write_jobs` | 🔒 |
| Other | 18 | `unknown` | 🔒 |
| Products & Services | 2 | `write_products_services` | 🔒 |
| Properties | 2 | `write_clients` | 🔒 |
| Quotes | 8 | `write_quotes` | 🔒 |
| Requests | 9 | `write_requests` | 🔒 |
| Scheduling | 3 | `write_scheduled_items` | 🔒 |
| Tax Rates | 2 | `write_tax_rates` | ✅ |
| Users | 1 | `write_users` | 🔒 |
| Visits | 11 | `write_scheduled_items` | 🔒 |

## Read Coverage (Queries)
| Domain | Example Queries | Scope |
|--------|----------------|-------|
| Account | `account`, `accountUnsafe` | `read_account_settings` |
| Clients | `client`, `clientEmails`, `clientMeta` | `read_clients` |
| Custom Fields | `customFieldConfigurations` | `read_custom_field_configurations` |
| Expenses | `expense`, `expenses` | `read_expenses` |
| Invoices | `invoice`, `invoices`, `supplierInvoiceBatches` | `read_invoices` |
| Jobs | `job`, `jobs` | `read_jobs` |
| Other | `appAlerts`, `apps`, `assessment` | `unknown` |
| Payments | `paymentMethods`, `paymentRecord`, `paymentRecords` | `read_jobber_payments` |
| Products & Services | `product`, `productOrService`, `productOrServices` | `read_products_services` |
| Properties | `property` | `read_clients` |
| Quotes | `quote`, `quotes` | `read_quotes` |
| Requests | `request`, `requestSettings`, `requestSettingsCollection` | `read_requests` |
| Scheduling | `scheduledItems` | `read_scheduled_items` |
| Tax Rates | `taxRates` | `read_tax_rates` |
| Time Sheets | `timeSheetEntries`, `timeSheetEntriesByGroup`, `timeSheetEntry` | `read_time_sheets` |
| Users | `user`, `users` | `read_users` |
| Visits | `visit`, `visits` | `read_scheduled_items` |

## What's Possible with Current Scopes
### ✅ Read Operations (all available)
- Clients, properties, contacts
- Service requests
- Quotes
- Jobs (with line items, visits)
- Scheduled items / visits
- Invoices
- Jobber Payments (payouts, transactions, bank accounts)
- Users / team members
- Equipment
- Expenses
- Custom field configurations
- Time sheets

### ✅ Write Operations (currently available)
- `write_tax_rates` — create/update/delete tax rates

### 🔒 Write Operations (require additional scopes)
- `write_clients`: `clientArchive`, `clientCreate`, `clientCreateNote`, `clientDeleteNote` + 5 more
- `write_custom_field_configurations`: `customFieldConfigurationArchive`, `customFieldConfigurationCreateArea`, `customFieldConfigurationCreateDropdown`, `customFieldConfigurationCreateLink` + 5 more
- `write_expenses`: `expenseCreate`, `expenseDelete`, `expenseEdit`
- `write_invoices`: `invoiceClose`, `invoiceCreate`, `invoiceCreateNote`, `invoiceEdit` + 5 more
- `write_jobs`: `jobClose`, `jobCreate`, `jobCreateLineItems`, `jobCreateNote` + 9 more
- `unknown`: `appAlertEdit`, `appDisconnect`, `appInstanceLastSyncDateEdit`, `assessmentComplete` + 14 more
- `write_products_services`: `productsAndServicesCreate`, `productsAndServicesEdit`
- `write_clients`: `propertyCreate`, `propertyEdit`
- `write_quotes`: `quoteCreate`, `quoteCreateLineItems`, `quoteCreateNote`, `quoteCreateTextLineItems` + 4 more
- `write_requests`: `requestArchive`, `requestCreate`, `requestCreateLineItems`, `requestCreateNote` + 5 more
- `write_scheduled_items`: `appointmentEditAssignment`, `appointmentEditCompleteness`, `appointmentEditSchedule`
- `write_users`: `userEdit`
- `write_scheduled_items`: `updateFutureVisits`, `visitComplete`, `visitCreate`, `visitCreateLineItems` + 7 more

## Files in this Reference
| File | Contents |
|------|----------|
| [queries.md](queries.md) | All 58 root queries with args and return types |
| [mutations.md](mutations.md) | All 99 mutations grouped by domain |
| [types.md](types.md) | All object types with fields |
| [enums.md](enums.md) | All enum types with values |
| [inputs.md](inputs.md) | All input object types |
| [connections.md](connections.md) | Relay pagination connection types |
| [schema.json](schema.json) | Raw introspection JSON (~1MB) |
