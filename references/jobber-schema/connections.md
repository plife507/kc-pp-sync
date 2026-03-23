# Jobber GraphQL — Connection / Pagination Types
Jobber uses the [Relay Cursor Connections](https://relay.dev/graphql/connections.htm) pattern.

## Pagination Arguments
All paginated queries accept:
- `first: Int` — number of records from start
- `last: Int` — number of records from end
- `after: String` — cursor for forward pagination
- `before: String` — cursor for backward pagination

## PageInfo
- `endCursor: String`
- `hasNextPage: Boolean!`
- `hasPreviousPage: Boolean!`
- `startCursor: String`

## Connection Types (54)

### `AppAlertConnection`
**Fields:**
- `edges: [AppAlertEdge!]`
- `nodes: [AppAlert!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`AppAlertEdge` fields:**
- `cursor: String!`
- `node: AppAlert!`


### `ApplicationConnection`
**Fields:**
- `edges: [ApplicationEdge!]`
- `nodes: [Application!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ApplicationEdge` fields:**
- `cursor: String!`
- `node: Application!`


### `BalanceTransactionInterfaceConnection`
**Fields:**
- `edges: [BalanceTransactionInterfaceEdge!]`
- `nodes: [BalanceTransactionInterface!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`BalanceTransactionInterfaceEdge` fields:**
- `cursor: String!`
- `node: BalanceTransactionInterface!`


### `ClientConnection`
**Fields:**
- `edges: [ClientEdge!]`
- `nodes: [Client!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ClientEdge` fields:**
- `cursor: String!`
- `node: Client!`


### `ClientNoteConnection`
**Fields:**
- `edges: [ClientNoteEdge!]`
- `nodes: [ClientNote!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ClientNoteEdge` fields:**
- `cursor: String!`
- `node: ClientNote!`


### `ClientNoteFileConnection`
**Fields:**
- `edges: [ClientNoteFileEdge!]`
- `nodes: [ClientNoteFile!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ClientNoteFileEdge` fields:**
- `cursor: String!`
- `node: ClientNoteFile!`


### `ClientPhoneNumberConnection`
**Fields:**
- `edges: [ClientPhoneNumberEdge!]`
- `nodes: [ClientPhoneNumber!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ClientPhoneNumberEdge` fields:**
- `cursor: String!`
- `node: ClientPhoneNumber!`


### `ContactModelConnection`
**Fields:**
- `edges: [ContactModelEdge!]`
- `nodes: [ContactModel!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ContactModelEdge` fields:**
- `cursor: String!`
- `node: ContactModel!`


### `CustomFieldConfigurationConnection`
**Fields:**
- `edges: [CustomFieldConfigurationEdge!]`
- `nodes: [CustomFieldConfiguration!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`CustomFieldConfigurationEdge` fields:**
- `cursor: String!`
- `node: CustomFieldConfiguration!`


### `EmailConnection`
**Fields:**
- `edges: [EmailEdge!]`
- `nodes: [Email!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`EmailEdge` fields:**
- `cursor: String!`
- `node: Email!`


### `ExpenseConnection`
**Fields:**
- `edges: [ExpenseEdge!]`
- `nodes: [Expense!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ExpenseEdge` fields:**
- `cursor: String!`
- `node: Expense!`


### `ExternalReminderConnection`
**Fields:**
- `edges: [ExternalReminderEdge!]`
- `nodes: [ExternalReminder!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ExternalReminderEdge` fields:**
- `cursor: String!`
- `node: ExternalReminder!`


### `InvoiceConnection`
**Fields:**
- `edges: [InvoiceEdge!]`
- `nodes: [Invoice!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`InvoiceEdge` fields:**
- `cursor: String!`
- `node: Invoice!`


### `InvoiceLineItemConnection`
**Fields:**
- `edges: [InvoiceLineItemEdge!]`
- `nodes: [InvoiceLineItem!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`InvoiceLineItemEdge` fields:**
- `cursor: String!`
- `node: InvoiceLineItem!`


### `InvoiceNoteFileConnection`
**Fields:**
- `edges: [InvoiceNoteFileEdge!]`
- `nodes: [InvoiceNoteFile!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`InvoiceNoteFileEdge` fields:**
- `cursor: String!`
- `node: InvoiceNoteFile!`


### `InvoiceNoteUnionConnection`
**Fields:**
- `edges: [InvoiceNoteUnionEdge!]`
- `nodes: [InvoiceNoteUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`InvoiceNoteUnionEdge` fields:**
- `cursor: String!`
- `node: InvoiceNoteUnion!`


### `JobConnection`
**Fields:**
- `edges: [JobEdge!]`
- `nodes: [Job!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`JobEdge` fields:**
- `cursor: String!`
- `node: Job!`


### `JobLineItemConnection`
**Fields:**
- `edges: [JobLineItemEdge!]`
- `nodes: [JobLineItem!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`JobLineItemEdge` fields:**
- `cursor: String!`
- `node: JobLineItem!`


### `JobNoteFileConnection`
**Fields:**
- `edges: [JobNoteFileEdge!]`
- `nodes: [JobNoteFile!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`JobNoteFileEdge` fields:**
- `cursor: String!`
- `node: JobNoteFile!`


### `JobNoteUnionConnection`
**Fields:**
- `edges: [JobNoteUnionEdge!]`
- `nodes: [JobNoteUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`JobNoteUnionEdge` fields:**
- `cursor: String!`
- `node: JobNoteUnion!`


### `JobberPaymentsCapitalLoanConnection`
**Fields:**
- `edges: [JobberPaymentsCapitalLoanEdge!]`
- `nodes: [JobberPaymentsCapitalLoan!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`JobberPaymentsCapitalLoanEdge` fields:**
- `cursor: String!`
- `node: JobberPaymentsCapitalLoan!`


### `MessageInterfaceConnection`
**Fields:**
- `edges: [MessageInterfaceEdge!]`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`MessageInterfaceEdge` fields:**
- `cursor: String!`


### `NoteFileInterfaceConnection`
**Fields:**
- `edges: [NoteFileInterfaceEdge!]`
- `nodes: [NoteFileInterface!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`NoteFileInterfaceEdge` fields:**
- `cursor: String!`
- `node: NoteFileInterface!`


### `PaymentMethodInterfaceConnection`
**Fields:**
- `edges: [PaymentMethodInterfaceEdge!]`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PaymentMethodInterfaceEdge` fields:**
- `cursor: String!`


### `PaymentRecordAllocationInterfaceConnection`
**Fields:**
- `edges: [PaymentRecordAllocationInterfaceEdge!]`
- `nodes: [PaymentRecordAllocationInterface!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PaymentRecordAllocationInterfaceEdge` fields:**
- `cursor: String!`
- `node: PaymentRecordAllocationInterface!`


### `PaymentRecordConnection`
**Fields:**
- `edges: [PaymentRecordEdge!]`
- `nodes: [PaymentRecord!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PaymentRecordEdge` fields:**
- `cursor: String!`
- `node: PaymentRecord!`


### `PaymentRecordInterfaceConnection`
**Fields:**
- `edges: [PaymentRecordInterfaceEdge!]`
- `nodes: [PaymentRecordInterface!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PaymentRecordInterfaceEdge` fields:**
- `cursor: String!`
- `node: PaymentRecordInterface!`


### `PaymentRecordRefundConnection`
**Fields:**
- `edges: [PaymentRecordRefundEdge!]`
- `nodes: [PaymentRecordRefund!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PaymentRecordRefundEdge` fields:**
- `cursor: String!`
- `node: PaymentRecordRefund!`


### `PayoutRecordConnection`
**Fields:**
- `edges: [PayoutRecordEdge!]`
- `nodes: [PayoutRecord!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PayoutRecordEdge` fields:**
- `cursor: String!`
- `node: PayoutRecord!`


### `ProductOrServiceConnection`
**Fields:**
- `edges: [ProductOrServiceEdge!]`
- `nodes: [ProductOrService!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ProductOrServiceEdge` fields:**
- `cursor: String!`
- `node: ProductOrService!`


### `PropertyConnection`
**Fields:**
- `edges: [PropertyEdge!]`
- `nodes: [Property!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`PropertyEdge` fields:**
- `cursor: String!`
- `node: Property!`


### `QuoteConnection`
**Fields:**
- `edges: [QuoteEdge!]`
- `nodes: [Quote!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`QuoteEdge` fields:**
- `cursor: String!`
- `node: Quote!`


### `QuoteLineItemConnection`
**Fields:**
- `edges: [QuoteLineItemEdge!]`
- `nodes: [QuoteLineItem!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`QuoteLineItemEdge` fields:**
- `cursor: String!`
- `node: QuoteLineItem!`


### `QuoteNoteFileConnection`
**Fields:**
- `edges: [QuoteNoteFileEdge!]`
- `nodes: [QuoteNoteFile!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`QuoteNoteFileEdge` fields:**
- `cursor: String!`
- `node: QuoteNoteFile!`


### `QuoteNoteUnionConnection`
**Fields:**
- `edges: [QuoteNoteUnionEdge!]`
- `nodes: [QuoteNoteUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`QuoteNoteUnionEdge` fields:**
- `cursor: String!`
- `node: QuoteNoteUnion!`


### `RequestConnection`
**Fields:**
- `edges: [RequestEdge!]`
- `nodes: [Request!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestEdge` fields:**
- `cursor: String!`
- `node: Request!`


### `RequestLineItemConnection`
**Fields:**
- `edges: [RequestLineItemEdge!]`
- `nodes: [RequestLineItem!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestLineItemEdge` fields:**
- `cursor: String!`
- `node: RequestLineItem!`


### `RequestNoteFileConnection`
**Fields:**
- `edges: [RequestNoteFileEdge!]`
- `nodes: [RequestNoteFile!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestNoteFileEdge` fields:**
- `cursor: String!`
- `node: RequestNoteFile!`


### `RequestNoteUnionConnection`
**Fields:**
- `edges: [RequestNoteUnionEdge!]`
- `nodes: [RequestNoteUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestNoteUnionEdge` fields:**
- `cursor: String!`
- `node: RequestNoteUnion!`


### `RequestSettingsConnection`
**Fields:**
- `edges: [RequestSettingsEdge!]`
- `nodes: [RequestSettings!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestSettingsEdge` fields:**
- `cursor: String!`
- `node: RequestSettings!`


### `RequestedWorkObjectUnionConnection`
**Fields:**
- `edges: [RequestedWorkObjectUnionEdge!]`
- `nodes: [RequestedWorkObjectUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`RequestedWorkObjectUnionEdge` fields:**
- `cursor: String!`
- `node: RequestedWorkObjectUnion!`


### `ScheduledItemInterfaceConnection`
**Fields:**
- `edges: [ScheduledItemInterfaceEdge!]`
- `nodes: [ScheduledItemInterface!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`ScheduledItemInterfaceEdge` fields:**
- `cursor: String!`
- `node: ScheduledItemInterface!`


### `SupplierInvoiceBatchConnection`
**Fields:**
- `edges: [SupplierInvoiceBatchEdge!]`
- `nodes: [SupplierInvoiceBatch!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`SupplierInvoiceBatchEdge` fields:**
- `cursor: String!`
- `node: SupplierInvoiceBatch!`


### `SupplierInvoiceDocumentConnection`
**Fields:**
- `edges: [SupplierInvoiceDocumentEdge!]`
- `nodes: [SupplierInvoiceDocument!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`SupplierInvoiceDocumentEdge` fields:**
- `cursor: String!`
- `node: SupplierInvoiceDocument!`


### `TagConnection`
**Fields:**
- `edges: [TagEdge!]`
- `nodes: [Tag!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TagEdge` fields:**
- `cursor: String!`
- `node: Tag!`


### `TaskConnection`
**Fields:**
- `edges: [TaskEdge!]`
- `nodes: [Task!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TaskEdge` fields:**
- `cursor: String!`
- `node: Task!`


### `TaxRateConnection`
**Fields:**
- `edges: [TaxRateEdge!]`
- `nodes: [TaxRate!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TaxRateEdge` fields:**
- `cursor: String!`
- `node: TaxRate!`


### `TimeSheetEntryConnection`
**Fields:**
- `edges: [TimeSheetEntryEdge!]`
- `nodes: [TimeSheetEntry!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TimeSheetEntryEdge` fields:**
- `cursor: String!`
- `node: TimeSheetEntry!`


### `TimeSheetEntryGroupConnection`
**Fields:**
- `edges: [TimeSheetEntryGroupEdge!]`
- `nodes: [TimeSheetEntryGroup!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TimeSheetEntryGroupEdge` fields:**
- `cursor: String!`
- `node: TimeSheetEntryGroup!`


### `TimeSheetUserDayConnection`
**Fields:**
- `edges: [TimeSheetUserDayEdge!]`
- `nodes: [TimeSheetUserDay!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`TimeSheetUserDayEdge` fields:**
- `cursor: String!`
- `node: TimeSheetUserDay!`


### `UserConnection`
**Fields:**
- `edges: [UserEdge!]`
- `nodes: [User!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`UserEdge` fields:**
- `cursor: String!`
- `node: User!`


### `VehicleConnection`
**Fields:**
- `edges: [VehicleEdge!]`
- `nodes: [Vehicle!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`VehicleEdge` fields:**
- `cursor: String!`
- `node: Vehicle!`


### `VisitConnection`
**Fields:**
- `edges: [VisitEdge!]`
- `nodes: [Visit!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`VisitEdge` fields:**
- `cursor: String!`
- `node: Visit!`


### `WorkObjectUnionConnection`
**Fields:**
- `edges: [WorkObjectUnionEdge!]`
- `nodes: [WorkObjectUnion!]!`
- `pageInfo: PageInfo!`
- `totalCount: Int!`

**`WorkObjectUnionEdge` fields:**
- `cursor: String!`
- `node: WorkObjectUnion!`

