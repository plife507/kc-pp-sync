# Jobber GraphQL — Queries Reference
Total: 58 root query fields
_All queries require appropriate read_* scope._
---
## `account`
**Returns:** `Account`

The account the authenticated user belongs to

---
## `accountUnsafe`
**Returns:** `AccountUnsafe`

Deprecated: Do not use in new development. This is a temporary resolver used only for the mobile Account REST-to-GraphQL migration.

> ⚠️ **Deprecated:** This resolver is deprecated and will be removed in a future version. Use `AccountType` for accessing account information.

---
## `appAlerts(after: String, before: String, first: Int, last: Int)`
**Returns:** `AppAlertConnection!`

List of 100 app alerts

**Arguments:**
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `apps(searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `ApplicationConnection!`

List of applications which improve Jobber's experience

**Arguments:**
- `searchTerm: String` (optional) — Text to match applications against
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `assessment(id: EncodedId!)`
**Returns:** `Assessment`

Single assessment by unique identifier, belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the assessment to find

---
## `capitalLoans(filter: CapitalLoanFilterAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `JobberPaymentsCapitalLoanConnection!`

List of recently updated Capital loans, belonging to the account of the authenticated user

**Arguments:**
- `filter: CapitalLoanFilterAttributes` (optional) — The filter options for selecting specific Capital loans
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `client(id: EncodedId!)`
**Returns:** `Client`

Single client by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the client

---
## `clientEmails(searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `EmailConnection!`

Search for a client email address by name or email. Results are sorted
by most plausible match in descending order.

Returns results from the most recently active clients if the search term is blank.


**Arguments:**
- `searchTerm: String` (optional) — Text to match client/client emails against
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `clientMeta(id: EncodedId!)`
**Returns:** `ClientMeta`

Metadata for a client

**Arguments:**
- `id: EncodedId!` (**required**) — The id of the client

---
## `clientPhone(id: EncodedId!)`
**Returns:** `ClientPhoneNumber!`

A single client phone number

**Arguments:**
- `id: EncodedId!` (**required**) — The id of the phone number.

---
## `clientPhones(searchTerm: String, filter: ClientPhoneFilterAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `ClientPhoneNumberConnection!`

All client phone numbers. Sort order is by most recently updated clients

**Arguments:**
- `searchTerm: String` (optional) — Text to match client/client phones against
- `filter: ClientPhoneFilterAttributes` (optional) — The filter options for selecting specific client phones
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `clients(filter: ClientFilterAttributes, searchTerm: String, searchFields: [ClientSearchField!], sort: ClientsSortInput, after: String, before: String, first: Int, last: Int)`
**Returns:** `ClientConnection!`

List of 100 recently updated clients satisfying a filter, belonging to the account of the authenticated in Service Provider

**Arguments:**
- `filter: ClientFilterAttributes` (optional) — The filter options for selecting specific clients
- `searchTerm: String` (optional) — Text to match on clients search
- `searchFields: [ClientSearchField!]` (optional) — Array of field names to include in search. If not provided, searches all fields.
- `sort: ClientsSortInput` (optional) — The sort attributes for clients
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `customFieldConfigurations(filter: CustomFieldConfigurationsFilterInput, sort: [CustomFieldConfigurationsSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `CustomFieldConfigurationConnection!`

List of 100 custom field configurations

**Arguments:**
- `filter: CustomFieldConfigurationsFilterInput` (optional) — The filter options for custom field configurations
- `sort: [CustomFieldConfigurationsSortInput!]` (optional) — The sort attributes for custom field configurations
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `event(id: EncodedId!)`
**Returns:** `Event`

Single event by unique identifier, belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the event to find

---
## `expense(id: EncodedId!)`
**Returns:** `Expense`

Single expense by unique identifier belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the expense to find

---
## `expenses(filter: ExpenseFilterAttributes, sort: [ExpensesSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `ExpenseConnection`

Connection of expenses belonging to the account of the authenticated Service Provider

**Arguments:**
- `filter: ExpenseFilterAttributes` (optional) — The filter options for selecting specific expenses
- `sort: [ExpensesSortInput!]` (optional) — The sort attributes for expenses
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `externalReminders(sourceType: String, status: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `ExternalReminderConnection!`

List of external reminders for the account

**Arguments:**
- `sourceType: String` (optional) — Filter reminders by source type (e.g., 'asset_bookkeeping')
- `status: String` (optional) — Filter reminders by status (pending, viewed, completed)
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `invoice(id: EncodedId!)`
**Returns:** `Invoice`

Single invoice by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the invoice to find

---
## `invoices(filter: InvoiceFilterAttributes, searchTerm: String, sort: [InvoiceSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `InvoiceConnection!`

List of 100 recently updated invoices satisfying a filter, belonging to the account of the authenticated in Service Provider

**Arguments:**
- `filter: InvoiceFilterAttributes` (optional) — The filter options for selecting specific invoices
- `searchTerm: String` (optional) — Text to match on invoice search
- `sort: [InvoiceSortInput!]` (optional) — The sort attributes for invoices
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `job(id: EncodedId!)`
**Returns:** `Job`

Single job by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the job to find

---
## `jobs(filter: JobFilterAttributes, sort: [JobsSortInput!], searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `JobConnection!`

100 recently updated jobs of the logged in account.

**Arguments:**
- `filter: JobFilterAttributes` (optional) — The filter options for selecting specific jobs
- `sort: [JobsSortInput!]` (optional) — The sort attributes for jobs
- `searchTerm: String` (optional) — Text to match on job search
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `onlineBookingConfiguration`
**Returns:** `OnlineBookingConfiguration`

OnlineBookingConfiguration belonging to the account of the authenticated Service Provider

---
## `paymentMethods(filter: JobberPaymentsPaymentMethodFilterAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `PaymentMethodInterfaceConnection`

List of 100 Jobber Payments payment methods

**Arguments:**
- `filter: JobberPaymentsPaymentMethodFilterAttributes` (optional) — The filter options for selecting specific Jobber Payments payment methods
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `paymentRecord(id: EncodedId!)`
**Returns:** `PaymentRecordInterface`

Single payment record by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the payment record to find

---
## `paymentRecords(filter: PaymentRecordFilterAttributes, sort: PaymentRecordSortAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `PaymentRecordInterfaceConnection`

List of 100 recently sent payment records satisfying a filter, belonging to the account of the authenticated in Service Provider

**Arguments:**
- `filter: PaymentRecordFilterAttributes` (optional) — The filter options for selecting specific payment records
- `sort: PaymentRecordSortAttributes` (optional) — The sort options for ordering payment records
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `paymentRefundReasons`
**Returns:** `[String!]`

List of all possible refund reasons for a payment

---
## `payoutRecord(id: EncodedId!)`
**Returns:** `PayoutRecord`

The payout record resolver

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the payout to find

---
## `payoutRecords(filter: PayoutFilterAttributes, sort: [PayoutSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `PayoutRecordConnection!`

The payout records resolver

**Arguments:**
- `filter: PayoutFilterAttributes` (optional) — The filter options for selecting specific payouts
- `sort: [PayoutSortInput!]` (optional) — The sort options for sorting the payouts
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `product(id: EncodedId!)`
**Returns:** `ProductOrService!`

Single product or service by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the product or service

---
## `productOrService(id: EncodedId!)`
**Returns:** `ProductOrService!`

List of 100 products or services, belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the product or service

> ⚠️ **Deprecated:** Functionality duplicated by improved query, use `product` instead.

---
## `productOrServices(after: String, before: String, first: Int, last: Int)`
**Returns:** `ProductOrServiceConnection!`

List of 100 products or services, belonging to the account of the authenticated in Service Provider

**Arguments:**
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

> ⚠️ **Deprecated:** Functionality duplicated by improved query, use `products` instead.

---
## `products(filter: ProductsFilterInput, searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `ProductOrServiceConnection!`

List of 100 services and products.

**Arguments:**
- `filter: ProductsFilterInput` (optional) — The filter options for selecting specific items
- `searchTerm: String` (optional) — Search by the items name
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `productsSearch(searchTerm: String!, after: String, before: String, first: Int, last: Int)`
**Returns:** `ProductOrServiceConnection!`

List of 100 products or services matching a search term

**Arguments:**
- `searchTerm: String!` (**required**) — Text to match work items against
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

> ⚠️ **Deprecated:** Use `products` instead.

---
## `properties(filter: PropertiesFilterAttributes, searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `PropertyConnection!`

List of 100 recently updated properties, belonging to the account of the authenticated Service Provider

**Arguments:**
- `filter: PropertiesFilterAttributes` (optional) — The filter options for selecting specific properties
- `searchTerm: String` (optional) — Text to match properties against
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `property(id: EncodedId!)`
**Returns:** `Property`

Single property by unique identifier belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the property to find

---
## `quote(id: EncodedId!)`
**Returns:** `Quote`

Single quote by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the quote to find

---
## `quotes(filter: QuoteFilterAttributes, searchTerm: String, sort: [QuotesSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `QuoteConnection!`

List of 100 recently updated quotes satisfying a filter, belonging to the account of the authenticated in Service Provider

**Arguments:**
- `filter: QuoteFilterAttributes` (optional) — The filter options for selecting specific quotes
- `searchTerm: String` (optional) — Text to match on quotes search
- `sort: [QuotesSortInput!]` (optional) — The sort attributes for quotes
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `request(id: EncodedId!)`
**Returns:** `Request`

Single request by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the request to find

---
## `requestSettings(id: EncodedId)`
**Returns:** `RequestSettings`

Request settings and details for the service provider's account

**Arguments:**
- `id: EncodedId` (optional) — The ID of the request settings, returns default settings if omitted

---
## `requestSettingsCollection(filter: RequestSettingsFilterAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `RequestSettingsConnection!`

Request settings collection for the service provider's account

**Arguments:**
- `filter: RequestSettingsFilterAttributes` (optional) — Filter the request settings collection
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `requests(filter: RequestFilterAttributes, searchTerm: String, sort: [RequestsSortInput!], timezone: Timezone, after: String, before: String, first: Int, last: Int)`
**Returns:** `RequestConnection!`

100 recently updated work requests of the logged in account.

**Arguments:**
- `filter: RequestFilterAttributes` (optional) — The filter options for selecting specific requests
- `searchTerm: String` (optional) — Text to match on request search
- `sort: [RequestsSortInput!]` (optional) — The sort attributes for requests
- `timezone: Timezone` (optional) — The timezone to calculate request status. Defaults to the account timezone.
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `scheduledItems(sort: ScheduledItemsSortInput, filter: ScheduledItemsFilterAttributes!, after: String, before: String, first: Int, last: Int)`
**Returns:** `ScheduledItemInterfaceConnection!`

All scheduled items (Basic Tasks, Visits, Events, Assessments, Quote Reminders, and Invoice Reminders) for a list of team members on a given day

**Arguments:**
- `sort: ScheduledItemsSortInput` (optional) — The sort of the scheduled items. If not provided, the items will be sorted by startAt in ascending order.
- `filter: ScheduledItemsFilterAttributes!` (**required**) — The filter options for scheduled items
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `similarClients(name: String, companyName: String, emails: [String!], after: String, before: String, first: Int, last: Int)`
**Returns:** `ClientConnection!`

Find similar clients to the given client. This query will never return more than 10 items.

**Arguments:**
- `name: String` (optional) — The name of the client
- `companyName: String` (optional) — The company name of the client
- `emails: [String!]` (optional) — The email addresses of the client
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `supplierInvoiceBatches(after: String, before: String, first: Int, last: Int)`
**Returns:** `SupplierInvoiceBatchConnection!`

List of supplier invoice batches for the current account

**Arguments:**
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `task(id: EncodedId!)`
**Returns:** `Task`

Single task by unique identifier, belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the visit to find

---
## `tasks(filter: TaskFilterAttributes, sort: [TaskSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `TaskConnection!`

A collection of sortable tasks. Default sorting order is on `START_AT`, by `ASCENDING`

**Arguments:**
- `filter: TaskFilterAttributes` (optional) — Filter to apply to result set
- `sort: [TaskSortInput!]` (optional) — The sort attributes for tasks
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `taxRates(searchTerm: String, after: String, before: String, first: Int, last: Int)`
**Returns:** `TaxRateConnection!`

The different tax rates of the logged in account.

**Arguments:**
- `searchTerm: String` (optional) — Text to match tax rates against
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `timeSheetEntries(sort: [TimeSheetEntriesSortAttributes!], filter: TimeSheetEntriesFilterAttributes, after: String, before: String, first: Int, last: Int)`
**Returns:** `TimeSheetEntryConnection!`

All timesheet entries for users on a given day

**Arguments:**
- `sort: [TimeSheetEntriesSortAttributes!]` (optional) — The sort attributes for timesheet entries
- `filter: TimeSheetEntriesFilterAttributes` (optional) — The filter options for timesheet entries
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `timeSheetEntriesByGroup(filter: TimeSheetEntryGroupsFilterAttributes!, after: String, before: String, first: Int, last: Int)`
**Returns:** `TimeSheetEntryGroupConnection!`

Time sheet entries grouped by job or label for a user and date range

**Arguments:**
- `filter: TimeSheetEntryGroupsFilterAttributes!` (**required**) — Filter options including user, date range, and optional job constraints
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `timeSheetEntry(id: EncodedId!)`
**Returns:** `TimeSheetEntry`

Single timesheet entry by unique identifier belonging to the account of the authenticated in Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the timesheet to find

---
## `user(id: EncodedId)`
**Returns:** `User`

Single user by unique identifier belonging to the account of the authenticated Service Provider. When a unique identifier is not supplied, the current user is returned

**Arguments:**
- `id: EncodedId` (optional) — The unique identifier of the user to find

---
## `users(filter: UsersFilterAttributes, sort: [UsersSortInput!], after: String, before: String, first: Int, last: Int)`
**Returns:** `UserConnection!`

List of 10,000 users satisfying a filter, belonging to the account of the authenticated Service Provider

**Arguments:**
- `filter: UsersFilterAttributes` (optional) — Filter to apply to result set.
- `sort: [UsersSortInput!]` (optional) — The sort attributes for users
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `vehicle(vehicleId: EncodedId!)`
**Returns:** `Vehicle`

Single vehicle by unique identifier belonging to the authenticated account

**Arguments:**
- `vehicleId: EncodedId!` (**required**) — The unique identifier of the vehicle to find

---
## `vehicles(after: String, before: String, first: Int, last: Int)`
**Returns:** `VehicleConnection!`

Retrieves vehicles for the authenticated account

**Arguments:**
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `visit(id: EncodedId!)`
**Returns:** `Visit`

Single visit by unique identifier associated with a Job, belonging to the account of the authenticated Service Provider

**Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the visit to find

---
## `visits(filter: VisitFilterAttributes, sort: [VisitsSortInput!], timezone: Timezone, after: String, before: String, first: Int, last: Int)`
**Returns:** `VisitConnection!`

A collection of sortable visits. Default sorting order is on `START_AT`, by `ASCENDING`

**Arguments:**
- `filter: VisitFilterAttributes` (optional) — Filter to apply to result set
- `sort: [VisitsSortInput!]` (optional) — The sort attributes for visits
- `timezone: Timezone` (optional) — The timezone to calculate the visit status
- `after: String` (optional) — Returns the elements in the list that come after the specified cursor.
- `before: String` (optional) — Returns the elements in the list that come before the specified cursor.
- `first: Int` (optional) — Returns the first _n_ elements from the list.
- `last: Int` (optional) — Returns the last _n_ elements from the list.

---
## `webHookEvent(webHookId: EncodedId!, itemId: EncodedId!, accountId: EncodedId!, occuredAt: ISO8601DateTime!, webhookType: Webhook)`
**Returns:** `WebHookPayload!`

Internal query to retrieve payload sent to external developer when a web hook event is triggered

**Arguments:**
- `webHookId: EncodedId!` (**required**) — The unique identifier of the web hook which is being triggered
- `itemId: EncodedId!` (**required**) — The unique identifier of the object which triggered the event
- `accountId: EncodedId!` (**required**) — The unique identifier of the account which triggered the event
- `occuredAt: ISO8601DateTime!` (**required**) — The time the event occurred at
- `webhookType: Webhook` (optional) — The type of web hook that is being triggered

---
## `workItemSearch(searchTerm: String!, maxResults: Int)`
**Returns:** `[WorkItem!]!`

Initialize work items for line items

**Arguments:**
- `searchTerm: String!` (**required**) — Text to match work items against
- `maxResults: Int` (optional) — Max number of results to return

> ⚠️ **Deprecated:** Use `products` instead

---
