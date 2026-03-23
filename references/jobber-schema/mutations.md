# Jobber GraphQL — Mutations Reference
Total: 99 mutations

## Current Write Scopes
Only `write_tax_rates` is currently active. All other mutations require additional write scopes.

## Domains
- [Clients](#clients) (9 mutations) — scope: `write_clients`
- [Custom Fields](#custom-fields) (9 mutations) — scope: `write_custom_field_configurations`
- [Expenses](#expenses) (3 mutations) — scope: `write_expenses`
- [Invoices](#invoices) (9 mutations) — scope: `write_invoices`
- [Jobs](#jobs) (13 mutations) — scope: `write_jobs`
- [Other](#other) (18 mutations) — scope: `unknown`
- [Products & Services](#products-services) (2 mutations) — scope: `write_products_services`
- [Properties](#properties) (2 mutations) — scope: `write_clients`
- [Quotes](#quotes) (8 mutations) — scope: `write_quotes`
- [Requests](#requests) (9 mutations) — scope: `write_requests`
- [Scheduling](#scheduling) (3 mutations) — scope: `write_scheduled_items`
- [Tax Rates](#tax-rates) (2 mutations) — scope: `write_tax_rates`
- [Users](#users) (1 mutations) — scope: `write_users`
- [Visits](#visits) (11 mutations) — scope: `write_scheduled_items`

---

## Clients
**Required scope:** `write_clients` — 🔒 requires additional scope

### `clientArchive`
**Returns:** `ClientArchivePayload!`

Archives a client.

**Input Arguments:**
- `clientId: EncodedId!` (**required**) — The unique identifier of the client

### `clientCreate`
**Returns:** `ClientCreatePayload!`

Create a client

**Input Arguments:**
- `input: ClientCreateInput!` (**required**) — The attributes of the new client

### `clientCreateNote`
**Returns:** `ClientCreateNotePayload!`

Creates a note on an existing client

**Input Arguments:**
- `clientId: EncodedId!` (**required**) — The unique identifier of the client
- `input: ClientCreateNoteInput!` (**required**) — The attributes for creating client notes

### `clientDeleteNote`
**Returns:** `ClientDeleteNotePayload!`

Deletes a note on an existing client

**Input Arguments:**
- `input: ClientDeleteNoteInput!` (**required**) — The attributes for deleting client notes

### `clientEdit`
**Returns:** `ClientEditPayload!`

Update a client based on the provided ID.

**Input Arguments:**
- `clientId: EncodedId!` (**required**) — The unique identifier of the client
- `input: ClientEditInput!` (**required**) — The attributes to modify on the existing client

### `clientEditNote`
**Returns:** `ClientEditNotePayload!`

Edits a note on an existing client

**Input Arguments:**
- `input: ClientEditNoteInput!` (**required**) — The attributes for editing client notes

### `clientNoteAddAttachment`
**Returns:** `ClientNoteAddAttachmentPayload!`

Adds an attachment to a note on an existing client

**Input Arguments:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `noteAddAttachmentAttributes: [NoteAttachmentAttributes!]!` (**required**) — List of attachments to append to the note
- `clientId: EncodedId!` (**required**) — The unique identifier of the client

### `clientUnarchive`
**Returns:** `ClientUnarchivePayload!`

Unarchives a client

**Input Arguments:**
- `clientId: EncodedId!` (**required**) — The unique identifier of the client

### `clientsCreate`
**Returns:** `ClientsCreatePayload!`

Create multiple clients

**Input Arguments:**
- `input: [ClientCreateInput!]!` (**required**) — The attributes of the new client(s)

---

## Custom Fields
**Required scope:** `write_custom_field_configurations` — 🔒 requires additional scope

### `customFieldConfigurationArchive`
**Returns:** `CustomFieldConfigurationArchivePayload!`

Archive many custom field configurations

**Input Arguments:**
- `customFieldConfigurationIds: [EncodedId!]!` (**required**) — The IDs of the custom field configurations being archived

### `customFieldConfigurationCreateArea`
**Returns:** `CustomFieldConfigurationCreateAreaPayload!`

Create an area custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateAreaInput!` (**required**) — Input for creating an area type custom field configuration

### `customFieldConfigurationCreateDropdown`
**Returns:** `CustomFieldConfigurationCreateDropdownPayload!`

Create a dropdown custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateDropdownInput!` (**required**) — Input for creating a dropdown type custom field configuration

### `customFieldConfigurationCreateLink`
**Returns:** `CustomFieldConfigurationCreateLinkPayload!`

Create a link custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateLinkInput!` (**required**) — Input for creating a link type custom field configuration

### `customFieldConfigurationCreateNumeric`
**Returns:** `CustomFieldConfigurationCreateNumericPayload!`

Create a numeric custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateNumericInput!` (**required**) — Input for creating a numeric type custom field configuration

### `customFieldConfigurationCreateText`
**Returns:** `CustomFieldConfigurationCreateTextPayload!`

Create a text custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateTextInput!` (**required**) — Input for creating a text type custom field configuration

### `customFieldConfigurationCreateTrueFalse`
**Returns:** `CustomFieldConfigurationCreateTrueFalsePayload!`

Create a true false custom field configuration

**Input Arguments:**
- `input: CustomFieldConfigurationCreateTrueFalseInput!` (**required**) — Input for creating a true false type custom field configuration

### `customFieldConfigurationEdit`
**Returns:** `CustomFieldConfigurationEditPayload!`

Edit a custom field configuration

**Input Arguments:**
- `customFieldConfigurationId: EncodedId!` (**required**) — The ID of the custom field configuration being edited
- `input: CustomFieldConfigurationEditInput!` (**required**) — Input for editing a custom field configuration

### `customFieldConfigurationUnarchive`
**Returns:** `CustomFieldConfigurationUnarchivePayload!`

Unarchive many custom field configurations

**Input Arguments:**
- `customFieldConfigurationIds: [EncodedId!]!` (**required**) — The IDs of the custom field configurations being unarchived

---

## Expenses
**Required scope:** `write_expenses` — 🔒 requires additional scope

### `expenseCreate`
**Returns:** `ExpenseCreatePayload!`

Create a new expense

**Input Arguments:**
- `input: ExpenseCreateInput!` (**required**) — The attributes of the new expense

### `expenseDelete`
**Returns:** `ExpenseDeletePayload!`

Delete an expense

**Input Arguments:**
- `expenseId: EncodedId!` (**required**) — The expense to delete

### `expenseEdit`
**Returns:** `ExpenseEditPayload!`

Edit an expense

**Input Arguments:**
- `expenseId: EncodedId!` (**required**) — The unique identifier of the expense
- `input: ExpenseEditInput!` (**required**) — The input to modify on the exiting expense

---

## Invoices
**Required scope:** `write_invoices` — 🔒 requires additional scope

### `invoiceClose`
**Returns:** `InvoiceClosePayload!`

Close an invoice

**Input Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the invoice to close
- `input: InvoiceCloseInput!` (**required**) — The attributes for closing the invoice

### `invoiceCreate`
**Returns:** `InvoiceCreatePayload!`

Create a new invoice

**Input Arguments:**
- `input: InvoiceCreateInput!` (**required**) — The attributes of the new invoice

### `invoiceCreateNote`
**Returns:** `InvoiceCreateNotePayload!`

Creates a note on an existing invoice

**Input Arguments:**
- `invoiceId: EncodedId!` (**required**) — The unique identifier of the invoice
- `input: InvoiceCreateNoteInput!` (**required**) — The attributes for creating invoice notes

### `invoiceEdit`
**Returns:** `InvoiceEditPayload!`

Edit an invoice

**Input Arguments:**
- `invoiceId: EncodedId!` (**required**) — The unique identifier of the invoice
- `input: InvoiceEditInput!` (**required**) — The input for editing an invoice

### `invoiceEditNote`
**Returns:** `InvoiceEditNotePayload!`

Edits a note on an existing invoice

**Input Arguments:**
- `input: InvoiceEditNoteInput!` (**required**) — The attributes for editing invoice notes

### `invoiceMarkAsSent`
**Returns:** `InvoiceMarkAsSentPayload!`

Mark a draft invoice as sent

**Input Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the invoice to mark as sent

### `invoiceReopen`
**Returns:** `InvoiceReopenPayload!`

Re-open a paid invoice

**Input Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the invoice to re-open

### `invoiceUnmarkBadDebt`
**Returns:** `InvoiceUnmarkBadDebtPayload!`

Unmark an invoice as bad debt

**Input Arguments:**
- `id: EncodedId!` (**required**) — The unique identifier of the invoice to unmark as bad debt

### `supplierInvoiceUpload`
**Returns:** `SupplierInvoiceUploadPayload!`

Upload a supplier invoice PDF for automated processing

**Input Arguments:**
- `signedBlobId: EncodedId!` (**required**) — The signed blob ID from directUploadCreate

---

## Jobs
**Required scope:** `write_jobs` — 🔒 requires additional scope

### `jobClose`
**Returns:** `JobClosePayload!`

Closes a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job
- `input: JobCloseInput!` (**required**) — The attributes for closing an existing job

### `jobCreate`
**Returns:** `JobCreatePayload!`

Create a job

**Input Arguments:**
- `input: JobCreateAttributes!` (**required**) — The attributes of the new job

### `jobCreateLineItems`
**Returns:** `JobCreateLineItemsPayload!`

Create line items on a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The job to create line items on
- `input: JobCreateLineItemsInput!` (**required**) — The line items to create

### `jobCreateNote`
**Returns:** `JobCreateNotePayload!`

Creates a note on an existing job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job
- `input: JobCreateNoteInput!` (**required**) — The attributes for creating job notes

### `jobDeleteLineItems`
**Returns:** `JobDeleteLineItemsPayload!`

Delete line items on a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The job to delete line items from
- `input: JobDeleteLineItemsInput!` (**required**) — The line items to delete

### `jobDeleteNote`
**Returns:** `JobDeleteNotePayload!`

Deletes a note on an existing job

**Input Arguments:**
- `input: JobDeleteNoteInput!` (**required**) — The attributes for deleting job notes

### `jobEdit`
**Returns:** `JobEditPayload!`

Update a job based on the provided ID.

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job
- `input: JobEditInput!` (**required**) — The attributes to modify on the existing job

### `jobEditLineItems`
**Returns:** `JobEditLineItemsPayload!`

Edit line items on a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job
- `input: JobEditLineItemsInput!` (**required**) — The line items to modify

### `jobEditNote`
**Returns:** `JobEditNotePayload!`

Edits a note on an existing job

**Input Arguments:**
- `input: JobEditNoteInput!` (**required**) — The attributes for editing job notes

### `jobNoteAddAttachment`
**Returns:** `JobNoteAddAttachmentPayload!`

Adds an attachment to a note on an existing job

**Input Arguments:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `noteAddAttachmentAttributes: [NoteAttachmentAttributes!]!` (**required**) — List of attachments to append to the note
- `jobId: EncodedId!` (**required**) — The unique identifier of the job

### `jobOrderLineItems`
**Returns:** `JobOrderLineItemsPayload!`

Order line items on a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job
- `orderedLineItemIds: [EncodedId!]!` (**required**) — The unique indentifiers of the line items in the desired order

### `jobReopen`
**Returns:** `JobReopenPayload!`

Reopen a job based on the provided ID.

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The unique identifier of the job

### `requestEditJobForms`
**Returns:** `RequestEditJobFormsPayload!`

Attach or detach form templates on a request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request
- `input: FormAttachmentInput` (optional) — Form template ids to attach (replaces existing)

---

## Other
**Required scope:** `unknown` — 🔒 requires additional scope

### `appAlertEdit`
**Returns:** `AppAlertEditPayload!`

Edit app alerts for an account

**Input Arguments:**
- `input: AppAlertEditInput!` (**required**) — The attributes to modify on the app alert

### `appDisconnect`
**Returns:** `AppDisconnectPayload!`

Forcefully remove an account from the requesting app

### `appInstanceLastSyncDateEdit`
**Returns:** `AppInstanceLastSyncDateEditPayload!`

Edit the last sync date

**Input Arguments:**
- `input: LastSyncDateEditInput!` (**required**) — The attributes of the new app request

### `assessmentComplete`
**Returns:** `AssessmentCompletePayload!`

Mark request assessment as complete

**Input Arguments:**
- `assessmentId: EncodedId!` (**required**) — The unique identifier of the assessment

### `assessmentCreate`
**Returns:** `AssessmentCreatePayload!`

Create request assessment

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the work request
- `input: AssessmentCreateInput!` (**required**) — The inputs for creating assessment

### `assessmentDelete`
**Returns:** `AssessmentDeletePayload!`

Delete request assessment

**Input Arguments:**
- `assessmentId: EncodedId!` (**required**) — The unique identifier of the assessment

### `assessmentEdit`
**Returns:** `AssessmentEditPayload!`

Edit request assessment

**Input Arguments:**
- `assessmentId: EncodedId!` (**required**) — The unique identifier of the assessment
- `input: AssessmentEditInput!` (**required**) — The inputs for editing assessment

### `assessmentUncomplete`
**Returns:** `AssessmentUncompletePayload!`

Unmark request assessment as incomplete

**Input Arguments:**
- `assessmentId: EncodedId!` (**required**) — The unique identifier of the assessment

### `eventCreate`
**Returns:** `EventCreatePayload!`

Creates an event

**Input Arguments:**
- `input: EventCreateInput!` (**required**) — The attributes of the new event

### `onMyWayTrackingLinkCreate`
**Returns:** `OnMyWayTrackingLinkCreatePayload!`

Create an on my way tracking link

**Input Arguments:**
- `input: OnMyWayTrackingLinkCreateInput!` (**required**) — The attributes of the new on my way tracking link
- `visitId: EncodedId!` (**required**) — The ID of the visit

### `taskCreate`
**Returns:** `TaskCreatePayload!`

Creates a task

**Input Arguments:**
- `clientId: EncodedId` (optional) — Client associated with this task
- `propertyId: EncodedId` (optional) — Property associated with this task
- `input: TaskCreateInput!` (**required**) — The attributes of the new task

### `taskDelete`
**Returns:** `TaskDeletePayload!`

Deletes a task

**Input Arguments:**
- `taskIds: [EncodedId!]!` (**required**) — IDs of the tasks being deleted
- `deleteFutureRecurring: Boolean` (optional) (default: `false`) — Whether to delete all future instances of a recurring task, or just the given task

### `taskEdit`
**Returns:** `TaskEditPayload!`

Update a task based on the provided ID.

**Input Arguments:**
- `taskId: EncodedId!` (**required**) — The unique identifier of the task
- `input: TaskEditInput!` (**required**) — Attributes to change

### `vehicleCreate`
**Returns:** `VehicleCreatePayload!`

Create a vehicle

**Input Arguments:**
- `input: VehicleCreateInput!` (**required**) — The attributes of the new vehicle

### `vehicleDelete`
**Returns:** `VehicleDeletePayload!`

Delete a vehicle

**Input Arguments:**
- `vehicleId: EncodedId!` (**required**) — The vehicle to delete

### `vehiclesUpdate`
**Returns:** `VehiclesUpdatePayload!`

Update vehicles

**Input Arguments:**
- `input: [VehicleUpdateInput!]!` (**required**) — The attributes to update the vehicle

### `webhookEndpointCreate`
**Returns:** `WebhookEndpointCreatePayload!`

Create a new webhook endpoint

**Input Arguments:**
- `input: WebhookEndpointCreateInput!` (**required**) — The attributes of the new webhook endpoint

### `webhookEndpointDelete`
**Returns:** `WebhookEndpointDeletePayload!`

Delete an existing webhook endpoint

**Input Arguments:**
- `webhookEndpointsIds: [EncodedId!]!` (**required**) — IDs of the webhook endpointss to delete

---

## Products & Services
**Required scope:** `write_products_services` — 🔒 requires additional scope

### `productsAndServicesCreate`
**Returns:** `CreatePayload!`

Create a new product or service

**Input Arguments:**
- `input: ProductsAndServicesInput!` (**required**) — Attributes of the new product or service

### `productsAndServicesEdit`
**Returns:** `EditPayload!`

Updates a product or service

**Input Arguments:**
- `productOrServiceId: EncodedId!` (**required**) — The unique identifier of the product or service
- `input: ProductsAndServicesEditInput!` (**required**) — Attributes of the new product or service

---

## Properties
**Required scope:** `write_clients` — 🔒 requires additional scope

### `propertyCreate`
**Returns:** `PropertyCreatePayload!`

Creates a new Property for an existing client

**Input Arguments:**
- `clientId: EncodedId!` (**required**) — The unique identifier of the client
- `input: PropertyCreateInput!` (**required**) — The attributes of the new property

### `propertyEdit`
**Returns:** `PropertyEditPayload!`

Modify an existing property

**Input Arguments:**
- `propertyId: EncodedId!` (**required**) — The unique identifier of the property
- `input: PropertyEditInput!` (**required**) — The attributes to modify on the existing property

---

## Quotes
**Required scope:** `write_quotes` — 🔒 requires additional scope

### `quoteCreate`
**Returns:** `QuoteCreatePayload!`

Create a new Quote

**Input Arguments:**
- `attributes: QuoteCreateAttributes!` (**required**) — The attributes of the new quote

### `quoteCreateLineItems`
**Returns:** `QuoteCreateLineItemsPayload!`

Create a line item on a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The unique identifier of the quote
- `lineItems: [QuoteCreateLineItemAttributes!]!` (**required**) — The attributes of the created text line items

### `quoteCreateNote`
**Returns:** `QuoteCreateNotePayload!`

Create a note on a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The unique identifier of the quote
- `input: QuoteCreateNoteInput!` (**required**) — The attributes for creating a quote note

### `quoteCreateTextLineItems`
**Returns:** `QuoteCreateTextLineItemsPayload!`

Create a text line item on a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The unique identifier of the quote
- `lineItems: [QuoteCreateTextLineItemAttributes!]!` (**required**) — The attributes of the created text line items

### `quoteDeleteLineItems`
**Returns:** `QuoteDeleteLineItemsPayload!`

Delete line items on a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The quote to delete line items from
- `lineItemIds: [EncodedId!]!` (**required**) — The line items to delete

### `quoteEdit`
**Returns:** `QuoteEditPayload!`

Edit a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The unique identifier of the quote
- `attributes: QuoteEditAttributes!` (**required**) — The attributes to modify on the existing quote

### `quoteEditLineItems`
**Returns:** `QuoteEditLineItemsPayload!`

Edit a line item on a quote

**Input Arguments:**
- `quoteId: EncodedId!` (**required**) — The unique identifier of the quote
- `lineItems: [QuoteEditLineItemAttributes!]!` (**required**) — The line items to modify

### `quoteEditNote`
**Returns:** `QuoteEditNotePayload!`

Edit a note on a quote

**Input Arguments:**
- `input: QuoteEditNoteInput!` (**required**) — The attributes for editing quote notes

---

## Requests
**Required scope:** `write_requests` — 🔒 requires additional scope

### `requestArchive`
**Returns:** `RequestArchivePayload!`

Archive the given request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request

### `requestCreate`
**Returns:** `RequestCreatePayload!`

Create a request

**Input Arguments:**
- `input: RequestCreateInput!` (**required**) — Input used to create a new request

### `requestCreateLineItems`
**Returns:** `RequestCreateLineItemsPayload!`

Add line items to a request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request
- `lineItems: [RequestCreateLineItemAttributes!]!` (**required**) — The attributes of the created line items

### `requestCreateNote`
**Returns:** `RequestCreateNotePayload!`

Creates a note on an existing request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request
- `input: RequestCreateNoteInput!` (**required**) — The attributes for creating request notes

### `requestDeleteLineItems`
**Returns:** `RequestDeleteLineItemsPayload!`

Delete line items from a request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The request to delete line items from
- `lineItemIds: [EncodedId!]!` (**required**) — The line items to delete

### `requestEdit`
**Returns:** `RequestEditPayload!`

Edit a request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request
- `input: RequestEditInput!` (**required**) — The attributes to modify on the existing request

### `requestEditLineItems`
**Returns:** `RequestEditLineItemsPayload!`

Edit line items on a request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request
- `lineItems: [RequestEditLineItemAttributes!]!` (**required**) — The line items to modify

### `requestEditNote`
**Returns:** `RequestEditNotePayload!`

Edits a note on an existing request

**Input Arguments:**
- `input: RequestEditNoteInput!` (**required**) — The attributes for editing request notes

### `requestUnarchive`
**Returns:** `RequestUnarchivePayload!`

Unarchive the given request

**Input Arguments:**
- `requestId: EncodedId!` (**required**) — The unique identifier of the request

---

## Scheduling
**Required scope:** `write_scheduled_items` — 🔒 requires additional scope

### `appointmentEditAssignment`
**Returns:** `AppointmentEditAssignmentPayload!`

Edit the team member assignment for an appointment (task, visit, assessment)

**Input Arguments:**
- `appointmentId: EncodedId!` (**required**) — The encoded ID of the appointment to reassign
- `input: AppointmentEditAssignmentInput!` (**required**) — The new appointment assignees

### `appointmentEditCompleteness`
**Returns:** `AppointmentEditCompletenessPayload!`

Marks appointment as complete or incomplete

**Input Arguments:**
- `appointmentId: EncodedId!` (**required**) — The encoded ID of the appointment to edit its completeness
- `input: AppointmentEditCompletenessInput!` (**required**) — The new appointment complete status

### `appointmentEditSchedule`
**Returns:** `AppointmentEditSchedulePayload!`

Edit schedule for any appointment type (task, visit, assessment, event)

**Input Arguments:**
- `appointmentId: EncodedId!` (**required**) — The encoded ID of the appointment to edit
- `input: AppointmentEditScheduleInput!` (**required**) — The new appointment schedule

---

## Tax Rates
**Required scope:** `write_tax_rates` — ✅ available

### `taxCreate`
**Returns:** `TaxCreatePayload!`

Create a new tax

**Input Arguments:**
- `input: TaxCreateInput!` (**required**) — The attributes of the new tax

### `taxGroupCreate`
**Returns:** `TaxGroupCreatePayload!`

Create a new tax group

**Input Arguments:**
- `input: TaxGroupCreateInput!` (**required**) — The attributes of the new tax group

---

## Users
**Required scope:** `write_users` — 🔒 requires additional scope

### `userEdit`
**Returns:** `UserEditPayload!`

Update a user based on the provided ID.

**Input Arguments:**
- `userId: EncodedId!` (**required**) — The unique identifier of the user
- `input: UserEditInput!` (**required**) — The attributes to modify on the existing user

---

## Visits
**Required scope:** `write_scheduled_items` — 🔒 requires additional scope

### `updateFutureVisits`
**Returns:** `UpdateFutureVisitsPayload!`

Update future visits for a job

**Input Arguments:**
- `input: UpdateFutureVisitsInput!` (**required**) — Update parameters

### `visitComplete`
**Returns:** `VisitCompletePayload!`

Mark a visit complete based on the provided ID

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The unique identifier of the visit
- `input: VisitCompleteInput` (optional) — The input to complete a visit

### `visitCreate`
**Returns:** `VisitCreatePayload!`

Add visits to a job

**Input Arguments:**
- `jobId: EncodedId!` (**required**) — The job to create visits for
- `input: VisitCreateInput!` (**required**) — The visits to create

### `visitCreateLineItems`
**Returns:** `VisitCreateLineItemsPayload!`

Adds new line items to a visit

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The unique identifier of the visit
- `input: VisitCreateLineItemInput!` (**required**) — The attributes of the line items to be created

### `visitDelete`
**Returns:** `VisitDeletePayload!`

Deletes a Visit

**Input Arguments:**
- `visitIds: [EncodedId!]!` (**required**) — IDs of the visits to delete

### `visitDeleteLineItems`
**Returns:** `VisitDeleteLineItemsPayload!`

Removes line items from a visit

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The unique identifier of the visit
- `input: VisitDeleteLineItemsInput!` (**required**) — The attributes of the line items to be deleted

### `visitEdit`
**Returns:** `VisitEditPayload!`

Update a visit based on the provided ID.

**Input Arguments:**
- `id: EncodedId!` (**required**) — The encoded ID
- `attributes: VisitEditAttributes!` (**required**) — Attributes to change

### `visitEditAssignedUsers`
**Returns:** `VisitEditAssignedUsersPayload!`

Edit assigned to on a visit

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The encoded ID
- `input: VisitEditAssignedUsersInput!` (**required**) — Attributes to change

### `visitEditLineItems`
**Returns:** `VisitEditLineItemsPayload!`

Edit line items on a visit

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The unique identifier of the visit
- `input: VisitEditLineItemsInput!` (**required**) — The attributes of the line items to modify

### `visitEditSchedule`
**Returns:** `VisitEditSchedulePayload!`

Edit schedule for a visit

**Input Arguments:**
- `id: EncodedId!` (**required**) — The encoded ID of the visit to edit
- `input: VisitEditScheduleInput!` (**required**) — The new visit schedule

### `visitUncomplete`
**Returns:** `VisitUncompletePayload!`

Mark a visit as uncomplete based on the provided ID

**Input Arguments:**
- `visitId: EncodedId!` (**required**) — The unique identifier of the visit

---
