# Jobber GraphQL — Object Types Reference
Total: 342 object types
---

## `Account`

The company of a Service Provider who uses Jobber for their business operations.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — The time the account was created |
| `earliestInvoiceIssuedDate` | `ISO8601DateTime` | — The earliest invoice issued date |
| `features` | `[AccountFeature!]` | — A list of features |
| `id` | `EncodedId!` | — The unique identifier |
| `industry` | `Industry` | — Industry associated with the account |
| `name` | `String!` | — The name of the company |
| `phone` | `String` | — The phone number of the account |
| `signupName` | `String` | — The name of the signup attribute |

---

## `AccountFeature`

Feature for an account

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `available` | `Boolean!` | — The availability state |
| `discoverable` | `Boolean!` | — The discoverable state |
| `enabled` | `Boolean!` | — The enabled state |
| `name` | `String!` | — The feature name |

---

## `AccountUnsafe`

Legacy account type to match fields in the Account REST endpoint. This type is deprecated and will be removed in a future version. Use `AccountType` for accessing account information.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `canToggleJobberPayments` | `Boolean` | ⚠️ *deprecated* — Whether the account can toggle Jobber payments |
| `country` | `String` | ⚠️ *deprecated* — The country of the account |
| `enabledAchPayments` | `Boolean` | ⚠️ *deprecated* — Whether the account can toggle ACH payments |
| `hasPaymentError` | `Boolean!` | ⚠️ *deprecated* — Whether or not the account's payment details have an error |
| `id` | `EncodedId!` | — The unique identifier |
| `planCode` | `String!` | ⚠️ *deprecated* — The current plan code of the account |
| `planTier` | `String!` | ⚠️ *deprecated* — The tier name for the plan set, e.g., 'CONNECT' |
| `subscriptionCancelled` | `Boolean` | ⚠️ *deprecated* — Whether the subscription is cancelled |

---

## `AchBankPaymentPaymentRecord`

An ACH bank payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the ACH bank payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `AdvanceBalanceTransaction`

An Advance Payout Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `AdvanceFundingBalanceTransaction`

An Advance Funding Payout Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `AppAlert`

Alerts from a third-party application that require an account user's attention

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `app` | `Application!` | — the application the app alerts belong to |
| `count` | `Int!` | — total number of alerts |
| `updatedAt` | `ISO8601DateTime` | — last time the alert count was updated |

---

## `AppAlertConnection`

The connection type for AppAlert.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[AppAlertEdge!]` | — A list of edges. |
| `nodes` | `[AppAlert!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `AppAlertEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `AppAlert!` | — The item at the end of the edge. |

---

## `AppAlertEditPayload`

Autogenerated return type of AppAlertEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appAlert` | `AppAlert` | — The modified app alert |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the app alert |

---

## `AppDisconnectPayload`

Autogenerated return type of AppDisconnect.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `app` | `Application` | — The application that was disconnected from the user |
| `userErrors` | `[MutationErrors!]!` | — The errors returned when trying to disconnect the account from the application |

---

## `AppInstanceLastSyncDateEditPayload`

Autogenerated return type of AppInstanceLastSyncDateEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `lastSyncDate` | `LastSyncDate` | — The modified last sync date |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the app request |

---

## `Application`

Applications which improve Jobber's experience

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `applicationScopes` | `String!` | — The scopes requested for this application |
| `author` | `String!` | — The display name of the application author |
| `beforeStartingContent` | `String!` | — The before starting documentation for the application |
| `description` | `String` | — The description of the application |
| `displayName` | `String!` | — The display name of the application. Defaults to full name if not specified |
| `id` | `EncodedId!` | — The unique identifier |
| `installationStepsContent` | `String!` | — The installation steps for the application |
| `learnMoreUrl` | `String!` | — The URL that links to additional information about the application |
| `logoUrl` | `String` | — The logo URL to display the logo of the application |
| `manageAppUrl` | `String` | — The URL for the manage app button for an installed App |
| `marketplaceUrl` | `String!` | — The URL that links to a selected app landing page |
| `name` | `String!` | — The full name of the application |
| `oauthUrl` | `String` | — The URL that should start the OAuth flow |
| `redirectUrl` | `String` | — The redirect URL used for OAuth purposes |

---

## `ApplicationConnection`

The connection type for Application.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ApplicationEdge!]` | — A list of edges. |
| `nodes` | `[Application!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ApplicationEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Application!` | — The item at the end of the edge. |

---

## `AppointmentEditAssignmentPayload`

Autogenerated return type of AppointmentEditAssignment.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appointment` | `ScheduledItemInterface` | — The updated appointment |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to edit the appointment assignment |

---

## `AppointmentEditCompletenessPayload`

Autogenerated return type of AppointmentEditCompleteness.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appointment` | `ScheduledItemInterface` | — The updated appointment |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to edit the appointment |

---

## `AppointmentEditSchedulePayload`

Autogenerated return type of AppointmentEditSchedule.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appointment` | `ScheduledItemInterface` | — The updated appointment |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to edit the appointment schedule |

---

## `ArrivalWindow`

The time window during which the SP can arrive

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `centeredOnStartTime` | `Boolean!` | — Whether the arrival window is centered on the job |
| `duration` | `Minutes!` | — The duration of the arrival window |
| `endAt` | `ISO8601DateTime!` | — The end time of the arrival window |
| `id` | `EncodedId!` | — The unique identifier |
| `startAt` | `ISO8601DateTime!` | — The start time of the arrival window |

---

## `Assessment`

An assessment represents each time a Service Provider goes to a client property to assess and plan for future work

**Implements:** `ScheduledItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allDay` | `Boolean!` | — Indicates whether the scheduled item is for a full day |
| `assignedUsers` | `UserConnection` | — Users assigned to the scheduled item |
| `client` | `Client!` | — The client for the assessment |
| `clientConfirmed` | `Boolean!` | — Whether the client has confirmed this assessment |
| `completedAt` | `ISO8601DateTime` | — The time that the assessment was completed. |
| `createdBy` | `User` | — The user that created this scheduled item |
| `duration` | `Int` | — Minute duration between start and end time. |
| `endAt` | `ISO8601DateTime` | — End date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `id` | `EncodedId!` | — The unique identifier |
| `instructions` | `String` | — The instructions for the assessment |
| `isComplete` | `Boolean!` | — Whether the assessment has been completed |
| `isDefaultTitle` | `Boolean!` | — Indicates whether the title is the default |
| `linkedCommunications` | `MessageInterfaceConnection!` | — All messages related to this work object. |
| `overrideOrder` | `Int` | — An override for ordering anytime and unscheduled items |
| `property` | `Property` | — The property for the assessment |
| `request` | `Request!` | — The parent request associated with this assessment. |
| `routingOrder` | `Int` | — The order in which the scheduled item should be routed |
| `startAt` | `ISO8601DateTime` | — Start date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `teamReminderOffset` | `Minutes` | — Offset in minutes from the time of the scheduled item to notify the team |
| `title` | `String` | — The title of the scheduled item |

---

## `AssessmentCompletePayload`

Autogenerated return type of AssessmentComplete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assessment` | `Assessment` | — The assessment |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the assessment completeness |

---

## `AssessmentCreatePayload`

Autogenerated return type of AssessmentCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assessment` | `Assessment` | — The added assessment |
| `request` | `Request` | — The related request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the assessment |

---

## `AssessmentDeletePayload`

Autogenerated return type of AssessmentDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedAssessment` | `Assessment` | — The deleted assessment |
| `request` | `Request` | — The related request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when deleting the assessment |

---

## `AssessmentEditPayload`

Autogenerated return type of AssessmentEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assessment` | `Assessment` | — The edited assessment |
| `request` | `Request` | — The related request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the assessment |

---

## `AssessmentUncompletePayload`

Autogenerated return type of AssessmentUncomplete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assessment` | `Assessment` | — The assessment |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the assessment completeness |

---

## `BalanceTransactionInterfaceConnection`

The connection type for BalanceTransactionInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[BalanceTransactionInterfaceEdge!]` | — A list of edges. |
| `nodes` | `[BalanceTransactionInterface!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `BalanceTransactionInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `BalanceTransactionInterface!` | — The item at the end of the edge. |

---

## `BankTransferPaymentRecord`

A bank transfer payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the bank transfer |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `CashAppPaymentRecord`

A cash app payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the Cash App payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `CashPaymentRecord`

A cash payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `CheckPaymentRecord`

A check payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `checkNumber` | `String` | — The check number used for payment |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `Client`

Clients are the customers who pay for services on Jobber's platform - they belong to the Jobber account / service provider.

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `balance` | `Float!` | — The client's current balance |
| `billingAddress` | `ClientAddress` | — The billing address of the client |
| `billingAddressPresent` | `Boolean!` | — Is a custom billing address present for this client? |
| `clientProperties` | `PropertyConnection!` | — The properties belonging to the client which are serviced by the service provider |
| `companyName` | `String` | — The name of the business |
| `contacts` | `ContactModelConnection!` | — The contacts associated with the client |
| `createdAt` | `ISO8601DateTime!` | — The time the client was created |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `defaultEmails` | `[String!]!` | — The email address stored from previous communications. |
| `defaultPhones` | `[String!]!` | — Default phone numbers to fetch for the given message type. |
| `email` | `String` | — The client's primary email address |
| `emails` | `[Email!]!` | — The email addresses belonging to the client |
| `firstName` | `String!` | — The first name of the client |
| `id` | `EncodedId!` | — The unique identifier |
| `invoices` | `InvoiceConnection!` | — The invoices associated with the client |
| `isArchivable` | `Boolean!` | — Is the client archivable |
| `isArchived` | `Boolean!` | — Is the client archived |
| `isCompany` | `Boolean!` | — Does the client represent a business |
| `isLead` | `Boolean!` | — The status of the client; represents whether the client is a prospective lead |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `jobs` | `JobConnection!` | — The jobs associated with the client |
| `lastName` | `String!` | — The last name of the client |
| `messages` | `MessageInterfaceConnection!` | — All messages for the client ordered by date descending. |
| `name` | `String!` | — The primary name of the client |
| `noteAttachments` | `ClientNoteFileConnection!` | — The note files attached to the client |
| `notes` | `ClientNoteConnection!` | — The notes attached to the client |
| `phone` | `String` | — The client's primary phone number |
| `phones` | `[ClientPhoneNumber!]!` | — The phone numbers belonging to the client |
| `properties` | `[Property!]!` | ⚠️ *deprecated* — The properties belonging to the client which are serviced by the service provider |
| `quotes` | `QuoteConnection!` | — The quotes associated with the client |
| `receivesFollowUps` | `Boolean!` | — Does the client receive job follow ups |
| `receivesInvoiceFollowUps` | `Boolean!` | — Does the client receive invoice follow ups |
| `receivesQuoteFollowUps` | `Boolean!` | — Does the client receive quote follow ups |
| `receivesReminders` | `Boolean!` | — Does the client receive assessment or visit reminders |
| `receivesReviewRequests` | `Boolean!` | — Does the client receive review requests |
| `requestedWorkObjects` | `RequestedWorkObjectUnionConnection` | — The client's requests, quotes, jobs, invoices, and treatments, defaulting to descending modified date order |
| `requests` | `RequestConnection!` | — The requests associated with the client |
| `sampleData` | `Boolean!` | — Is the client sample data |
| `scheduledItems` | `ScheduledItemInterfaceConnection!` | — All scheduled items associated with the client, including both scheduled and unscheduled appointments |
| `secondaryName` | `String` | — The secondary name of the client |
| `sourceAttribution` | `SourceAttribution` | — The source of the client object |
| `tags` | `TagConnection!` | — The custom tags added to the client |
| `title` | `String` | — The title of the client |
| `unallocatedDepositRecords` | `PaymentRecordInterfaceConnection!` | — The deposit records that haven't been applied to an invoice and have not been refunded |
| `updatedAt` | `ISO8601DateTime!` | — The last time the client was updated |
| `workObjects` | `WorkObjectUnionConnection` | ⚠️ *deprecated* — The client's requests, quotes, jobs, and invoices sorted descending by modified date |

---

## `ClientAddress`

Address for a client property or billing address

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `city` | `String!` | — The city for this address. |
| `country` | `String!` | — The country of this address. |
| `latitude` | `String!` | — The latitude of this address. |
| `longitude` | `String!` | — The longitude of this address. |
| `name` | `String` | — The name of the property for the address |
| `postalCode` | `String!` | — The zip or postal code of this address. |
| `province` | `String!` | — The state or province of this address. |
| `street` | `String!` | — The street component |
| `street1` | `String!` | — The first line of the street address |
| `street2` | `String!` | — The second line of the street address |

---

## `ClientArchivePayload`

Autogenerated return type of ClientArchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The archived client |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when archiving the client |

---

## `ClientConnection`

The connection type for Client.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ClientEdge!]` | — A list of edges. |
| `nodes` | `[Client!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ClientCounts`

Association counts for a client

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deposits` | `Int` | — The number of deposits associated with the client |
| `invoices` | `Int` | — The number of invoices associated with the client |
| `jobs` | `Int` | — The number of jobs associated with the client |
| `notes` | `Int` | — The number of notes associated with the client |
| `payments` | `Int` | — The number of payments associated with the client |
| `properties` | `Int` | — The number of properties associated with the client |
| `quotes` | `Int` | — The number of quotes associated with the client |
| `requests` | `Int` | — The number of requests associated with the client |
| `tasks` | `Int` | — The number of tasks associated with the client |
| `visits` | `Int` | — The number of visits associated with the client |

---

## `ClientCreateNotePayload`

Autogenerated return type of ClientCreateNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The client the note is attached to |
| `clientNote` | `ClientNote` | — The newly created note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note creation |

---

## `ClientCreatePayload`

Autogenerated return type of ClientCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The created client |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the client |

---

## `ClientDeleteNotePayload`

Autogenerated return type of ClientDeleteNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The client the note is attached to |
| `deletedNote` | `ClientNote` | — The deleted note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `ClientEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Client!` | — The item at the end of the edge. |

---

## `ClientEditNotePayload`

Autogenerated return type of ClientEditNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The client the note is attached to |
| `clientNote` | `ClientNote` | — The edited note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `ClientEditPayload`

Autogenerated return type of ClientEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The modified client |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the client |

---

## `ClientMeta`

Metadata for a client

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `clientHub` | `Boolean` | — Whether the client has a client hub enabled |
| `counts` | `ClientCounts` | — Association counts for the client |

---

## `ClientNote`

A client note

**Implements:** `NoteInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the note was created |
| `createdBy` | `NoteCreatedByUnion` | — The user or app that created the note |
| `fileAttachments` | `NoteFileInterfaceConnection!` | — The attached note files |
| `id` | `EncodedId!` | — The unique identifier |
| `lastEditedAt` | `ISO8601DateTime` | — When the note was last updated by a user |
| `lastEditedBy` | `User` | — The last user to edit the note |
| `linkedTo` | `NoteLink!` | — What objects (client, quote, job, etc.) the note is linked to |
| `message` | `String!` | — The note message |
| `pinned` | `Boolean!` | — Whether the note is pinned |

---

## `ClientNoteAddAttachmentPayload`

Autogenerated return type of ClientNoteAddAttachment.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `attachmentsToBeAdded` | `[String!]` | — The URLs of the newly added attachments which are being processed |
| `userErrors` | `[MutationErrors!]!` | — Errors when appending the attachments to the note |

---

## `ClientNoteConnection`

The connection type for ClientNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ClientNoteEdge!]` | — A list of edges. |
| `nodes` | `[ClientNote!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ClientNoteEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ClientNote!` | — The item at the end of the edge. |

---

## `ClientNoteFile`

A file attached to a note

**Implements:** `NoteFileInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `contentType` | `String!` | — The type of the file |
| `createdAt` | `ISO8601DateTime!` | — The time the note file attachment was created |
| `fileName` | `String!` | — The name of the file |
| `fileSize` | `Int!` | — The size of the file in bytes |
| `id` | `EncodedId!` | — The unique identifier |
| `note` | `ClientNote!` | — The note this attachment is attached to |
| `status` | `NoteFileStatusEnum!` | — The possible statuses for the file |
| `thumbnailUrl` | `String!` | — The location of the thumbnail |
| `updatedAt` | `ISO8601DateTime!` | — The time the note file attachment was updated |
| `url` | `String!` | — The location of the file |

---

## `ClientNoteFileConnection`

The connection type for ClientNoteFile.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ClientNoteFileEdge!]` | — A list of edges. |
| `nodes` | `[ClientNoteFile!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ClientNoteFileEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ClientNoteFile!` | — The item at the end of the edge. |

---

## `ClientPhoneNumber`

A client phone number

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client!` | — The client attached to this phone |
| `contact` | `ContactModel` | — The contact attached to this phone number |
| `description` | `String!` | — The phone type (eg Main, Mobile, etc) |
| `friendly` | `String!` | — A user friendly representation of the phone number |
| `id` | `EncodedId!` | — The unique identifier |
| `normalizedPhoneNumber` | `String` | — The normalized phone number in the e164 format |
| `number` | `String!` | — The phone number as stored. |
| `primary` | `Boolean!` | — Is the phone number a primary number? |
| `smsAllowed` | `Boolean!` | — Can the phone number receive text messages? |

---

## `ClientPhoneNumberConnection`

The connection type for ClientPhoneNumber.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ClientPhoneNumberEdge!]` | — A list of edges. |
| `nodes` | `[ClientPhoneNumber!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ClientPhoneNumberEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ClientPhoneNumber!` | — The item at the end of the edge. |

---

## `ClientUnarchivePayload`

Autogenerated return type of ClientUnarchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The unarchived client |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when unarchiving the client |

---

## `ClientsCreatePayload`

Autogenerated return type of ClientsCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `clients` | `ClientConnection` | — The created client(s) |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the client(s) |

---

## `ContactModel`

A contact associated with a client that can receive communications

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the contact was created |
| `emails` | `EmailConnection!` | — The email addresses belonging to the contact |
| `firstName` | `String` | — The first name of the contact |
| `id` | `EncodedId!` | — The unique identifier |
| `isBillingContact` | `Boolean!` | — Whether this contact is responsible for billing |
| `lastName` | `String` | — The last name of the contact |
| `name` | `String` | — The name of the contact |
| `phones` | `ClientPhoneNumberConnection!` | — The phone numbers belonging to the contact |
| `properties` | `PropertyConnection!` | — The properties belonging to the contact |
| `receivesFollowUps` | `Boolean!` | — Whether this contact receives job follow ups |
| `receivesInvoiceFollowUps` | `Boolean!` | — Whether this contact receives invoice follow ups |
| `receivesQuoteFollowUps` | `Boolean!` | — Whether this contact receives quote follow ups |
| `receivesReminders` | `Boolean!` | — Whether this contact receives assessment or visit reminders |
| `role` | `String` | — The role of the contact |
| `title` | `String` | — The title of the contact |
| `updatedAt` | `ISO8601DateTime!` | — When the contact was last updated |

---

## `ContactModelConnection`

The connection type for ContactModel.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ContactModelEdge!]` | — A list of edges. |
| `nodes` | `[ContactModel!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ContactModelEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ContactModel!` | — The item at the end of the edge. |

---

## `CreatePayload`

Autogenerated return type of Create.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `productOrService` | `ProductOrService` | — The newly created product or service |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the product or service |

---

## `CreditCardPaymentRecord`

A credit or debit card payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `ccTransactionNumber` | `String` | — The transaction number of the credit or debit card payment |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `CustomFieldArea`

The Area Custom Field Types.
Example query:
```
{
  ... on CustomFieldAreaType {
    id
    label
    unit
    valueArea {
      length
      width
    }
  }
}
```


**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationArea!` | — The area custom field configuration for this value. |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `unit` | `String!` | — The unit of this field. |
| `valueArea` | `CustomFieldAreaValue!` | — The length and width of this field. |

---

## `CustomFieldAreaValue`

An area custom field

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `length` | `Float!` | — The length value. |
| `width` | `Float!` | — The width value. |

---

## `CustomFieldConfigurationArchivePayload`

Autogenerated return type of CustomFieldConfigurationArchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfigurations` | `[CustomFieldConfiguration!]` | — The archived custom field configurations |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the custom field configuration |

---

## `CustomFieldConfigurationArea`

An area custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `CustomFieldConfigurationAreaDefaultValue!` | — The default length and width for an area custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `unit` | `String!` | — The unit of an area custom field |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationAreaDefaultValue`

The default value for area custom fields

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `length` | `Float!` | — The default length for area custom fields |
| `width` | `Float!` | — The default width for area custom fields |

---

## `CustomFieldConfigurationConnection`

The connection type for CustomFieldConfiguration.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[CustomFieldConfigurationEdge!]` | — A list of edges. |
| `nodes` | `[CustomFieldConfiguration!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `CustomFieldConfigurationCreateAreaPayload`

Autogenerated return type of CustomFieldConfigurationCreateArea.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationArea` | — The configured area custom field configuration |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the area custom field configuration |

---

## `CustomFieldConfigurationCreateDropdownPayload`

Autogenerated return type of CustomFieldConfigurationCreateDropdown.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationDropdown` | — The configured dropdown custom field |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the dropdown custom field |

---

## `CustomFieldConfigurationCreateLinkPayload`

Autogenerated return type of CustomFieldConfigurationCreateLink.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationLink` | — The configured link custom field configuration |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the link custom field. |

---

## `CustomFieldConfigurationCreateNumericPayload`

Autogenerated return type of CustomFieldConfigurationCreateNumeric.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationNumeric` | — The configured numeric custom field configuration |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the numeric custom field configuration |

---

## `CustomFieldConfigurationCreateTextPayload`

Autogenerated return type of CustomFieldConfigurationCreateText.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationText` | — The configured text custom field configuration |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the text custom field configuration |

---

## `CustomFieldConfigurationCreateTrueFalsePayload`

Autogenerated return type of CustomFieldConfigurationCreateTrueFalse.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationTrueFalse` | — The configured true false custom field |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the true false custom field configuration |

---

## `CustomFieldConfigurationDropdown`

A dropdown custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `String!` | — The default value for a dropdown custom field |
| `dropdownOptions` | `[String!]!` | — The list of possible dropdown values of a dropdown custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `CustomFieldConfiguration!` | — The item at the end of the edge. |

---

## `CustomFieldConfigurationEditPayload`

Autogenerated return type of CustomFieldConfigurationEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfiguration` | — The modified custom field configuration |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the custom field configuration |

---

## `CustomFieldConfigurationLink`

A link custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `CustomFieldConfigurationLinkDefaultValue!` | — The default values for this link custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationLinkDefaultValue`

The default value for a link custom field

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `text` | `String!` | — The default text for this link custom field |
| `url` | `String!` | — The default URL for this link custom field |

---

## `CustomFieldConfigurationNumeric`

A numeric custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `Float!` | — The default number for a numeric custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `unit` | `String!` | — The unit of a numeric custom field |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationText`

A text custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `String!` | — The default value for a text custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationTrueFalse`

A true false custom field configuration

**Implements:** `CustomFieldConfigurationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `appliesTo` | `CustomFieldAppliesTo!` | — The object type to which the CustomFieldConfiguration belongs |
| `archived` | `Boolean!` | — Indicates if the custom field is archived |
| `createdAt` | `ISO8601DateTime!` | — The time the CustomFieldConfiguration was created |
| `defaultValue` | `Boolean!` | — The default value for a TrueFalse custom field |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — The name of the CustomFieldConfiguration |
| `readOnly` | `Boolean!` | — Sets if Custom Field values are editable by Jobber users |
| `sortOrder` | `Int!` | — The order in which custom fields are displayed by default in Jobber |
| `transferable` | `Boolean!` | — Transferable custom fields allow data to appear in multiple places and follow you through your workflow |
| `transferedFrom` | `CustomFieldConfiguration` | — custom field configuration that this field was transferred from |
| `updatedAt` | `ISO8601DateTime!` | — The last time the CustomFieldConfiguration was updated |
| `valueCount` | `ValueCount!` | — The number of work objects that currently have a value associated with this configuration |
| `valueType` | `CustomFieldConfigurationValueType!` | — The type of CustomFieldConfiguration |

---

## `CustomFieldConfigurationUnarchivePayload`

Autogenerated return type of CustomFieldConfigurationUnarchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfigurations` | `[CustomFieldConfiguration!]` | — The unarchived custom field configurations |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems with configuring the custom field configuration |

---

## `CustomFieldDropdown`

A custom field with dropdown options

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationDropdown!` | — The dropdown custom field configuration for this value |
| `dropdownOptions` | `[String!]!` | — The list of possible values of this field |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `valueDropdown` | `String!` | — The dropdown value of this custom field |

---

## `CustomFieldLink`

A link custom field

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationLink!` | — The link custom field configuration for this value. |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `valueLink` | `CustomFieldLinkValue!` | — The value of the custom field link |

---

## `CustomFieldLinkValue`

A link custom field value

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `text` | `String!` | — The link label text for this link custom field |
| `url` | `String!` | — The URL for this link custom field |

---

## `CustomFieldNumeric`

A custom field with a numeric value

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationNumeric!` | — The numeric custom field configuration for this value |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `unit` | `String!` | — The unit of this field |
| `valueNumeric` | `Float!` | — The numeric value of this field |

---

## `CustomFieldText`

A text custom field

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationText!` | — The text custom field configuration for this value. |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `valueText` | `String!` | — The value of this field. |

---

## `CustomFieldTrueFalse`

A custom field with true or false for the value

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `customFieldConfiguration` | `CustomFieldConfigurationTrueFalse!` | — The true or false custom field configuration for this value |
| `id` | `EncodedId` | — The ID of this custom field. |
| `label` | `String!` | — The label to display for this field. |
| `valueTrueFalse` | `Boolean!` | — The value of this field which can be either true or false |

---

## `CustomLeadSource`

Represents a custom lead source that can be created by an SP.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `EncodedId!` | — The unique identifier |
| `label` | `String!` | — The label for the lead source |

---

## `DepositBalanceTransaction`

A Deposit Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `DisputeBalanceTransaction`

A Dispute Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `paymentRecord` | `PaymentRecordInterface` | — The payment record associated with |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `EPaymentPaymentRecord`

An e-payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `gatewayName` | `String` | — The gateway used for the payment |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `ETransferPaymentRecord`

An e-transfer payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the e-Transfer payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `EditPayload`

Autogenerated return type of Edit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `productOrService` | `ProductOrService` | — The updated product or service |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the product or service |

---

## `Email`

Email information

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `address` | `String!` | — The email address as stored. |
| `client` | `Client!` | — The client attached to this email |
| `contact` | `ContactModel` | — The contact attached to this email |
| `description` | `String!` | — The email address type (eg Main, Work, Personal, Other). |
| `id` | `EncodedId!` | — The unique identifier |
| `primary` | `Boolean!` | — Is this the primary email address? |

---

## `EmailConnection`

The connection type for Email.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[EmailEdge!]` | — A list of edges. |
| `nodes` | `[Email!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `EmailEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Email!` | — The item at the end of the edge. |

---

## `Event`

An event represents each time a Service Provider has scheduled holidays, team meetings, etc.

**Implements:** `ScheduledItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allDay` | `Boolean!` | — Indicates whether the scheduled item is for a full day |
| `assignedUsers` | `UserConnection` | — Users assigned to the scheduled item |
| `client` | `Client` | — The client for the event |
| `createdBy` | `User` | — The user that created this scheduled item |
| `description` | `String` | — The instructions for the event |
| `duration` | `Int` | — Minute duration between start and end time. |
| `endAt` | `ISO8601DateTime` | — End date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `id` | `EncodedId!` | — The unique identifier |
| `isComplete` | `Boolean!` | — Whether the event has been completed |
| `isDefaultTitle` | `Boolean!` | — Indicates whether the title is the default |
| `isRecurring` | `Boolean!` | — Indicates if the event is part of a recurring chain |
| `overrideOrder` | `Int` | — An override for ordering anytime and unscheduled items |
| `property` | `Property` | — The property for the event |
| `recurrenceSchedule` | `RecurrenceSchedule` | — Recurrence details |
| `recurringSummary` | `String` | — The summary of a recurring event |
| `routingOrder` | `Int` | — The order in which the scheduled item should be routed |
| `startAt` | `ISO8601DateTime` | — Start date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `teamReminderOffset` | `Minutes` | — Offset in minutes from the time of the scheduled item to notify the team |
| `title` | `String` | — The title of the scheduled item |

---

## `EventCreatePayload`

Autogenerated return type of EventCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `event` | `Event` | — The created event |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered in creating event |

---

## `Expense`

An expense incurred by a Service Provider

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the expense was created |
| `date` | `ISO8601DateTime!` | — When the expense was incurred |
| `description` | `String` | — The description of the expense |
| `enteredBy` | `User` | — The user who filled out the expense |
| `id` | `EncodedId!` | — The unique identifier |
| `linkedJob` | `Job` | — The associated Job |
| `paidBy` | `User` | — The user who paid the expense |
| `reimbursableTo` | `User` | — The user receiving the reimbursed expense amount |
| `title` | `String!` | — The title of the expense |
| `total` | `Float` | — Total cost of the expense |
| `updatedAt` | `ISO8601DateTime!` | — When the expense was updated |

---

## `ExpenseConnection`

The connection type for Expense.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ExpenseEdge!]` | — A list of edges. |
| `nodes` | `[Expense!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ExpenseCreatePayload`

Autogenerated return type of ExpenseCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `expense` | `Expense` | — The created expense |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the expense |

---

## `ExpenseDeletePayload`

Autogenerated return type of ExpenseDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedExpense` | `Expense` | — The deleted expense |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to delete the expense |

---

## `ExpenseEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Expense!` | — The item at the end of the edge. |

---

## `ExpenseEditPayload`

Autogenerated return type of ExpenseEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `expense` | `Expense` | — The modified expense |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the expense |

---

## `ExternalReminder`

A reminder from an external integration that requires user attention

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `completedAt` | `ISO8601DateTime` | — When the reminder was completed |
| `createdAt` | `ISO8601DateTime!` | — When the reminder was created in Jobber |
| `description` | `String` | — Description of the reminder |
| `firstRequestedAt` | `ISO8601DateTime!` | — When the reminder was first requested by the external system |
| `id` | `EncodedId!` | — The unique identifier |
| `lastRequestedAt` | `ISO8601DateTime!` | — When the reminder was last requested by the external system |
| `reminderType` | `String!` | — The type/category of reminder from the source system |
| `sourceId` | `String!` | — The ID from the external system |
| `sourceType` | `String!` | — The integration source type (e.g., 'asset_bookkeeping') |
| `status` | `String!` | — The status of the reminder (pending, viewed, completed) |
| `updatedAt` | `ISO8601DateTime!` | — When the reminder was last updated in Jobber |
| `viewedAt` | `ISO8601DateTime` | — When the user viewed the reminder |

---

## `ExternalReminderConnection`

The connection type for ExternalReminder.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ExternalReminderEdge!]` | — A list of edges. |
| `nodes` | `[ExternalReminder!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ExternalReminderEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ExternalReminder!` | — The item at the end of the edge. |

---

## `FeeAdjustmentBalanceTransaction`

A Fee Adjustment Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `FinancingPayoutBalanceTransaction`

A Financing Payout Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `FinancingRepaymentBalanceTransaction`

A Financing Repayment Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `GeoPoint`

A geographic coordinate with a single point

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `latitude` | `Float!` | — The geographic coordinate that specifies the north-south position of a point on the Earth's surface |
| `latitudeString` | `String!` | — The geographic coordinate that specifies the north-south position of a point on the Earth's surface as a string |
| `longitude` | `Float!` | — The geographic coordinate that specifies the east-west position of a point on the Earth's surface |
| `longitudeString` | `String!` | — The geographic coordinate that specifies the east-west position of a point on the Earth's surface as a string |
| `point` | `String!` | — The geographic coordinate point that combines latitude and longitude |

---

## `GpsPositionType`

Represents the latitude and longitude of a vehicle's position

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `latitude` | `Float!` | — The latitude of the vehicle's position |
| `longitude` | `Float!` | — The longitude of the vehicle's position |
| `timestamp` | `ISO8601DateTime!` | — The timestamp for the position data |

---

## `InstantPayoutBalanceTransaction`

A Instant Payout Balance Transaction 

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `payoutRecord` | `PayoutRecord` | — The payout record associated with |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `InstantPayoutFeeBalanceTransaction`

A Instant Payout Fee Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `Invoice`

A request for payment which Service Providers send to their clients after the work is done

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allowReviewRequest` | `Boolean!` | — Allow SMS to be sent to client for Google Reviews feature |
| `amounts` | `InvoiceAmounts` | — All amounts related to the invoice |
| `archivedJobs` | `JobConnection!` | — The archived jobs related to the invoice |
| `billingAddress` | `InvoiceBillingAddress` | — The billing address associated with the invoice |
| `billingIsSameAsPropertyAddress` | `Boolean` | — If invoice has a billing address, returns whether the billing address is the same as the property address |
| `client` | `Client` | — The client the invoice is for |
| `clientHubUri` | `String` | — URI of the invoice in client hub |
| `contractDisclaimer` | `String` | — The contract disclaimer for the invoice |
| `createdAt` | `ISO8601DateTime!` | — The date the invoice was created on |
| `customFieldValues` | `[CustomFieldUnion!]!` | ⚠️ *deprecated* — The custom fields set on the invoice |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `dateViewedInClientHub` | `ISO8601DateTime` | — The date the invoice was viewed in client hub |
| `depositAmount` | `Float!` | ⚠️ *deprecated* — The deposit amount on the invoice |
| `disableClientHubAchPayments` | `Boolean!` | ⚠️ *deprecated* — Whether ach payments are disabled on the invoice |
| `disableClientHubCreditCardPayments` | `Boolean!` | ⚠️ *deprecated* — Whether credit card payments are disabled on the invoice |
| `discountAmount` | `Float!` | ⚠️ *deprecated* — The discount amount on the invoice |
| `discountRate` | `Float!` | ⚠️ *deprecated* — The discount rate on the invoice |
| `discountType` | `String!` | ⚠️ *deprecated* — The discount type on the invoice - dollar amount or percent |
| `dueDate` | `ISO8601DateTime` | — The date the invoice is due on |
| `hasInvoiceNumberDuplicates` | `Boolean!` | — Whether there are other invoices with the same invoice number |
| `id` | `EncodedId!` | — The unique identifier |
| `invoiceNet` | `Int` | — Number of whole days after the issue_date that payment is due |
| `invoiceNumber` | `String!` | — The invoice number |
| `invoiceStatus` | `InvoiceStatusTypeEnum!` | — The status of the invoice |
| `issuedDate` | `ISO8601DateTime` | — The date the invoice was issued on |
| `jobIds` | `[EncodedId!]!` | ⚠️ *deprecated* — A list of job ID's associated with the invoice |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `jobs` | `JobConnection!` | — The jobs related to the invoice |
| `lineItems` | `InvoiceLineItemConnection!` | — The line items on the invoice |
| `linkedCommunications` | `MessageInterfaceConnection!` | — All messages related to this work object. |
| `message` | `String` | — The message on the invoice |
| `nextDateToSendReviewSms` | `ISO8601DateTime` | — The next available date to send an SMS review request |
| `nonTaxAmount` | `Float!` | ⚠️ *deprecated* — The non-tax amount on the invoice |
| `noteAttachments` | `InvoiceNoteFileConnection!` | — The note files attached to the invoice |
| `notes` | `InvoiceNoteUnionConnection!` | — The notes attached to the invoice |
| `paymentRecords` | `PaymentRecordConnection!` | — The payment records applied to the invoice |
| `paymentsTotal` | `Float!` | ⚠️ *deprecated* — The total payments payed on the invoice |
| `properties` | `PropertyConnection!` | — The properties related to the invoice |
| `propertyIds` | `[EncodedId!]!` | ⚠️ *deprecated* — A list of property ID's associated with the invoice |
| `receivedDate` | `ISO8601DateTime` | — The date the invoice was received on |
| `salesperson` | `User` | — Salesperson for the invoice |
| `subject` | `String!` | — The subject of the invoice |
| `subtotal` | `Float!` | ⚠️ *deprecated* — The subtotal of the invoice |
| `syncStatus` | `String!` | ⚠️ *deprecated* — The status of the object for an accounting sync |
| `tax` | `Float!` | ⚠️ *deprecated* — The percentage of tax on the invoice |
| `taxAmount` | `Float!` | ⚠️ *deprecated* — The tax amount on the invoice |
| `taxCalculationMethod` | `String!` | — The tax calculation method on the invoice |
| `taxDetails` | `TaxDetails` | — The tax rate and amount details |
| `taxRate` | `TaxRate` | — The tax rate information on the invoice |
| `taxRateName` | `String!` | ⚠️ *deprecated* — The name of the tax rate set on the invoice |
| `total` | `Float!` | ⚠️ *deprecated* — The total cost of the invoice |
| `transactionIds` | `[EncodedId!]!` | ⚠️ *deprecated* — A list of transaction ID's associated with the invoice |
| `updatedAt` | `ISO8601DateTime!` | — The last time the invoice was changed in a way that is meaningful to the Service Provider |
| `visits` | `VisitConnection!` | — The visits associated with the invoice |
| `waitingForFinancedPayment` | `Boolean!` | — Whether the invoice is waiting for a financed payment |

---

## `InvoiceAmounts`

All amounts related to an invoice

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `depositAmount` | `Float!` | — The deposit amount |
| `discountAmount` | `Float!` | — The discount amount |
| `invoiceBalance` | `Float!` | — The invoice balance after all payments |
| `legacyDiscountAmount` | `Float!` | — The computed discount amount applied to the invoice subtotal |
| `nonTaxAmount` | `Float!` | — The non-tax amount including the line items which are exempted from the tax |
| `paymentsTotal` | `Float!` | — The total payments payed on the invoice |
| `subtotal` | `Float!` | — The subtotal including line item costs but excluding tax amounts |
| `taxAmount` | `Float!` | — The tax amount |
| `tipsTotal` | `Float!` | — The sum of all tips paid to an invoice |
| `total` | `Float!` | — The total cost of the invoice or quote, including line item costs and tax amounts |

---

## `InvoiceBillingAddress`

Billing address associated with an invoice

**Implements:** `AddressInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `city` | `String` | — The city of the address |
| `coordinates` | `GeoPoint` | — The point coordinates of the address if it has been geo-coded |
| `country` | `String` | — The country of the address |
| `geoStatus` | `GeoStatus` | — The status of geo-locating the coordinates for an address |
| `name` | `String` | — The name of the property for the address |
| `postalCode` | `String` | — The postal code of the address |
| `province` | `String` | — The province of the address |
| `street` | `String!` | — The street address |
| `street1` | `String` | — The first line of the street address |
| `street2` | `String` | — The second line of the street address |

---

## `InvoiceClosePayload`

Autogenerated return type of InvoiceClose.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The closed invoice |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when closing the invoice |

---

## `InvoiceConnection`

The connection type for Invoice.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[InvoiceEdge!]` | — A list of edges. |
| `nodes` | `[Invoice!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `InvoiceCreateNotePayload`

Autogenerated return type of InvoiceCreateNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The invoice the note is attached to |
| `invoiceNote` | `InvoiceNote` | — The newly created note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note creation |

---

## `InvoiceCreatePayload`

Autogenerated return type of InvoiceCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The newly created invoice |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the invoice |

---

## `InvoiceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Invoice!` | — The item at the end of the edge. |

---

## `InvoiceEditNotePayload`

Autogenerated return type of InvoiceEditNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The invoice the note is attached to |
| `invoiceNote` | `InvoiceNote` | — The edited note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `InvoiceEditPayload`

Autogenerated return type of InvoiceEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The edited invoice |
| `userErrors` | `[MutationErrors!]!` | — The errors returned on mutation failure |

---

## `InvoiceLineItem`

An invoice line item

**Implements:** `LineItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `category` | `ProductsAndServicesCategory!` | — The category of the line item |
| `cost` | `Float!` | ⚠️ *deprecated* — The price of the line item |
| `createdAt` | `ISO8601DateTime!` | — The DateTime the line item was created |
| `date` | `ISO8601DateTime` | — The date of service associated with this line item |
| `description` | `String!` | — The description of the line item |
| `id` | `EncodedId!` | — The unique identifier |
| `jobLineItem` | `JobLineItem` | — The associated job line item if this invoice line item was created from a job |
| `linkedProductOrService` | `ProductOrService` | — The product or service from the Service Providers saved Products and Services list that was used to create this line item |
| `name` | `String!` | — The name of the line item |
| `originalCost` | `Float` | — The original cost of the line item before any progress invoicing adjustments |
| `qty` | `Float!` | ⚠️ *deprecated* — The quantity of the line item |
| `quantity` | `Float!` | — The quantity of the line item |
| `taxRate` | `TaxRate!` | — The tax rate type of the line item |
| `taxable` | `Boolean!` | — If the line item is taxable |
| `totalPrice` | `Float!` | — The total price of the line item |
| `unitPrice` | `Float!` | — The unit price of the line item |
| `updatedAt` | `ISO8601DateTime!` | — The last DateTime the line item was changed in a way that is meaningful to the Service Provider |

---

## `InvoiceLineItemConnection`

The connection type for InvoiceLineItem.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[InvoiceLineItemEdge!]` | — A list of edges. |
| `nodes` | `[InvoiceLineItem!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `InvoiceLineItemEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `InvoiceLineItem!` | — The item at the end of the edge. |

---

## `InvoiceMarkAsSentPayload`

Autogenerated return type of InvoiceMarkAsSent.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The updated invoice |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when marking the invoice as sent |

---

## `InvoiceNote`

An invoice note

**Implements:** `NoteInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the note was created |
| `createdBy` | `NoteCreatedByUnion` | — The user or app that created the note |
| `fileAttachments` | `NoteFileInterfaceConnection!` | — The attached note files |
| `id` | `EncodedId!` | — The unique identifier |
| `lastEditedAt` | `ISO8601DateTime` | — When the note was last updated by a user |
| `lastEditedBy` | `User` | — The last user to edit the note |
| `linkedTo` | `NoteLink!` | — What objects (client, quote, job, etc.) the note is linked to |
| `message` | `String!` | — The note message |
| `pinned` | `Boolean!` | — Whether the note is pinned |

---

## `InvoiceNoteFile`

A file attached to a note

**Implements:** `NoteFileInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `contentType` | `String!` | — The type of the file |
| `createdAt` | `ISO8601DateTime!` | — The time the note file attachment was created |
| `fileName` | `String!` | — The name of the file |
| `fileSize` | `Int!` | — The size of the file in bytes |
| `id` | `EncodedId!` | — The unique identifier |
| `note` | `InvoiceNoteUnion!` | — The note this attachment is attached to |
| `status` | `NoteFileStatusEnum!` | — The possible statuses for the file |
| `thumbnailUrl` | `String!` | — The location of the thumbnail |
| `updatedAt` | `ISO8601DateTime!` | — The time the note file attachment was updated |
| `url` | `String!` | — The location of the file |

---

## `InvoiceNoteFileConnection`

The connection type for InvoiceNoteFile.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[InvoiceNoteFileEdge!]` | — A list of edges. |
| `nodes` | `[InvoiceNoteFile!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `InvoiceNoteFileEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `InvoiceNoteFile!` | — The item at the end of the edge. |

---

## `InvoiceNoteUnionConnection`

The connection type for InvoiceNoteUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[InvoiceNoteUnionEdge!]` | — A list of edges. |
| `nodes` | `[InvoiceNoteUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `InvoiceNoteUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `InvoiceNoteUnion!` | — The item at the end of the edge. |

---

## `InvoicePaymentRecordAllocation`

A payment record allocation associated with an invoice

**Implements:** `PaymentRecordAllocationInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `amount` | `Float!` | — The allocation amount |
| `invoice` | `Invoice!` | — The invoice associated with this payment record allocation |

---

## `InvoiceReopenPayload`

Autogenerated return type of InvoiceReopen.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The updated invoice |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when re-opening the invoice |

---

## `InvoiceSchedule`

Invoice schedule detailed information

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `billingFrequency` | `BillingFrequencyEnum!` | — Frequency type for invoicing the job |
| `recurrenceSchedule` | `RecurrenceSchedule` | — Recurrence details |
| `scheduleSummary` | `String!` | — Friendly string of invoicing frequency |

---

## `InvoiceUnmarkBadDebtPayload`

Autogenerated return type of InvoiceUnmarkBadDebt.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoice` | `Invoice` | — The updated invoice |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when unmarking the invoice as bad debt |

---

## `Job`

A detailed contract of work which Service Providers use to schedule work for a Service Consumer

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allowReviewRequest` | `Boolean!` | — Allow SMS to be sent to client for Google Reviews feature |
| `arrivalWindow` | `ArrivalWindow` | — The time window during which the SP can arrive at the job |
| `billingType` | `BillingStrategy!` | — Invoicing strategy selected for the job |
| `bookingConfirmationSentAt` | `ISO8601DateTime` | — The time when booking confirmation for the job was sent |
| `client` | `Client!` | — The client on the job |
| `completedAndUninvoicedVisitsCount` | `Int!` | — Count of completed visits that have not been invoiced. Only relevant for visit-based billing jobs. |
| `completedAndUninvoicedVisitsTotal` | `Float!` | — The total dollar value of completed visits that have not been invoiced. Only relevant for visit-based billing jobs; returns 0 for fixed-price jobs. |
| `completedAt` | `ISO8601DateTime` | — The completion date of the job |
| `createdAt` | `ISO8601DateTime!` | — The time the job was created |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `defaultVisitTitle` | `String!` | — The default title for new visits |
| `endAt` | `ISO8601DateTime` | — End date of the job |
| `expenses` | `ExpenseConnection!` | — Expenses associated with the job |
| `id` | `EncodedId!` | — The unique identifier |
| `initialAssignedUsers` | `UserConnection!` | ⚠️ *deprecated* — Users assigned at time of job creation. This may differ from users assigned to the job's visits |
| `instructions` | `String` | — The instructions on a job |
| `invoiceSchedule` | `InvoiceSchedule!` | — Schedule of invoices |
| `invoicedTotal` | `Float!` | — The total invoiced amount of the job |
| `invoices` | `InvoiceConnection!` | — The invoices associated with the job |
| `jobBalanceTotals` | `JobBalanceTotals` | — The total and outstanding balance of the job based on invoice and quote deposits |
| `jobCosting` | `JobCosting` | — The job costing fields representing the profitability of the job |
| `jobNumber` | `Int!` | — The number of the job |
| `jobStatus` | `JobStatusTypeEnum!` | — The status of the job |
| `jobType` | `JobTypeTypeEnum!` | — The type of job |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `lineItems` | `JobLineItemConnection!` | — The line items associated with the job |
| `nextDateToSendReviewSms` | `ISO8601DateTime` | — The next available date to send an SMS review request |
| `noteAttachments` | `JobNoteFileConnection!` | — The note files attached to the job |
| `notes` | `JobNoteUnionConnection!` | — The notes attached to the job |
| `paymentRecords` | `PaymentRecordConnection!` | — The payment records applied to this job's invoices |
| `property` | `Property!` | — The property associated with the job |
| `quote` | `Quote` | — When applicable, the quote associated with the job |
| `request` | `Request` | — When applicable, the request associated with the job |
| `salesperson` | `User` | — Salesperson for the job |
| `source` | `Source!` | — The originating source of the job |
| `startAt` | `ISO8601DateTime` | — Start date of the job |
| `timeSheetEntries` | `TimeSheetEntryConnection!` | — A list of all timesheet entries for this job |
| `title` | `String` | — The scheduling information of the job |
| `total` | `Float!` | — The total chargeable amount of the job |
| `uninvoicedTotal` | `Float!` | — The total uninvoiced amount of the job |
| `updatedAt` | `ISO8601DateTime!` | — The last time the job was changed in a way that is meaningful to the Service Provider |
| `visitSchedule` | `VisitSchedule!` | — Schedule of visits |
| `visits` | `VisitConnection!` | — The scheduled or unscheduled visits to the customer's property to complete the work associated with this job |
| `visitsInfo` | `VisitsInfo!` | — Information about jobs visits |
| `willClientBeAutomaticallyCharged` | `Boolean` | — The setting for automatic invoice charges |

---

## `JobBalanceTotals`

The total and outstanding balance of a job

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `outstandingAmount` | `Float` | — The outstanding balance of the job to be paid based off of the invoices |
| `totalAmount` | `Float` | — The total balance of the job from the invoices |

---

## `JobClosePayload`

Autogenerated return type of JobClose.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The closed job |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when closing the job |

---

## `JobConnection`

The connection type for Job.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[JobEdge!]` | — A list of edges. |
| `nodes` | `[Job!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `JobCosting`

The profitability data associated to a Job

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `expenseCost` | `Float!` | — Total expense cost associated with this job |
| `id` | `EncodedId!` | — The unique identifier |
| `labourCost` | `Float!` | — Total labour cost associated with this job |
| `labourDuration` | `Seconds!` | — Total labour duration in seconds of the job |
| `lineItemCost` | `Float!` | — Total line item cost associated with this job |
| `profitAmount` | `Float!` | — Total profit amount associated with this job |
| `profitPercentage` | `Float` | — Total profit percentage associated with this job |
| `totalCost` | `Float!` | — Total cost associated with this job |
| `totalRevenue` | `Float!` | — Total revenue associated with this job |

---

## `JobCreateLineItemsPayload`

Autogenerated return type of JobCreateLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdLineItems` | `[JobLineItem!]!` | — The line items which have been created successfully |
| `job` | `Job!` | — The job modified when creating line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the job |

---

## `JobCreateNotePayload`

Autogenerated return type of JobCreateNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The job the note is attached to |
| `jobNote` | `JobNote` | — The newly created note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note creation |

---

## `JobCreatePayload`

Autogenerated return type of JobCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The created job |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the job |

---

## `JobDeleteLineItemsPayload`

Autogenerated return type of JobDeleteLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedLineItems` | `[JobLineItem!]!` | — The line items which have been deleted successfully |
| `job` | `Job` | — The job modified when deleting line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the job |

---

## `JobDeleteNotePayload`

Autogenerated return type of JobDeleteNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedNote` | `JobNote` | — The deleted note |
| `job` | `Job` | — The job the note is attached to |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `JobEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Job!` | — The item at the end of the edge. |

---

## `JobEditLineItemsPayload`

Autogenerated return type of JobEditLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The job modified when editing line items |
| `modifiedLineItems` | `[JobLineItem!]` | — The edited line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the job line items |

---

## `JobEditNotePayload`

Autogenerated return type of JobEditNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The job the note is attached to |
| `jobNote` | `JobNote` | — The edited note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `JobEditPayload`

Autogenerated return type of JobEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The modified job |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the job |

---

## `JobLineItem`

A job line item

**Implements:** `LineItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `category` | `ProductsAndServicesCategory!` | — The category of the line item |
| `cost` | `Float!` | ⚠️ *deprecated* — The price of the line item |
| `createdAt` | `ISO8601DateTime!` | — The DateTime the line item was created |
| `description` | `String!` | — The description of the line item |
| `id` | `EncodedId!` | — The unique identifier |
| `linkedProductOrService` | `ProductOrService` | — The product or service from the Service Providers saved Products and Services list that was used to create this line item |
| `name` | `String!` | — The name of the line item |
| `qty` | `Float!` | ⚠️ *deprecated* — The quantity of the line item |
| `quantity` | `Float!` | — The quantity of the line item |
| `taxable` | `Boolean!` | — If the line item is taxable |
| `totalCost` | `Float` | — The total (internal) cost of the line item |
| `totalPrice` | `Float!` | — The total price of the line item |
| `unitCost` | `Float` | — The unit cost of the line item |
| `unitPrice` | `Float!` | — The unit price of the line item |
| `updatedAt` | `ISO8601DateTime!` | — The last DateTime the line item was changed in a way that is meaningful to the Service Provider |

---

## `JobLineItemConnection`

The connection type for JobLineItem.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[JobLineItemEdge!]` | — A list of edges. |
| `nodes` | `[JobLineItem!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `JobLineItemEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `JobLineItem!` | — The item at the end of the edge. |

---

## `JobNote`

A job note

**Implements:** `NoteInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the note was created |
| `createdBy` | `NoteCreatedByUnion` | — The user or app that created the note |
| `fileAttachments` | `NoteFileInterfaceConnection!` | — The attached note files |
| `id` | `EncodedId!` | — The unique identifier |
| `lastEditedAt` | `ISO8601DateTime` | — When the note was last updated by a user |
| `lastEditedBy` | `User` | — The last user to edit the note |
| `linkedTo` | `NoteLink!` | — What objects (client, quote, job, etc.) the note is linked to |
| `message` | `String!` | — The note message |
| `pinned` | `Boolean!` | — Whether the note is pinned |

---

## `JobNoteAddAttachmentPayload`

Autogenerated return type of JobNoteAddAttachment.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `attachmentsToBeAdded` | `[String!]` | — The URLs of the newly added attachments which are being processed |
| `userErrors` | `[MutationErrors!]!` | — Errors when appending the attachments to the note |

---

## `JobNoteFile`

A file attached to a note

**Implements:** `NoteFileInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `contentType` | `String!` | — The type of the file |
| `createdAt` | `ISO8601DateTime!` | — The time the note file attachment was created |
| `fileName` | `String!` | — The name of the file |
| `fileSize` | `Int!` | — The size of the file in bytes |
| `id` | `EncodedId!` | — The unique identifier |
| `note` | `JobNoteUnion!` | — The note this attachment is attached to |
| `status` | `NoteFileStatusEnum!` | — The possible statuses for the file |
| `thumbnailUrl` | `String!` | — The location of the thumbnail |
| `updatedAt` | `ISO8601DateTime!` | — The time the note file attachment was updated |
| `url` | `String!` | — The location of the file |

---

## `JobNoteFileConnection`

The connection type for JobNoteFile.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[JobNoteFileEdge!]` | — A list of edges. |
| `nodes` | `[JobNoteFile!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `JobNoteFileEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `JobNoteFile!` | — The item at the end of the edge. |

---

## `JobNoteUnionConnection`

The connection type for JobNoteUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[JobNoteUnionEdge!]` | — A list of edges. |
| `nodes` | `[JobNoteUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `JobNoteUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `JobNoteUnion!` | — The item at the end of the edge. |

---

## `JobOrderLineItemsPayload`

Autogenerated return type of JobOrderLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The job modified when editing line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when ordering the job line items |

---

## `JobReopenPayload`

Autogenerated return type of JobReopen.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `job` | `Job` | — The reopened job |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when reopening the job |

---

## `JobberPaymentsACHPaymentRecord`

A Jobber Payments ACH payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `bankName` | `String!` | — The name of the bank that the online payment originated from |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `devicePlatform` | `DevicePlatform` | — The device platform used for this payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `feeAmount` | `Float` | — The amount of fee attached to a Jobber payment |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `lastDigits` | `String!` | — The last 4 digits of the bank account number that the online payment originated from |
| `negatedBalanceAdjustment` | `PaymentRecordInterface` | — The original payment record which was negated |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `payout` | `PayoutRecord` | — The payout associated with the payment record |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refundedAt` | `ISO8601DateTime` | — If refunded, the DateTime the payment was refunded. |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment record |
| `selectedTipPercentage` | `String` | — The tip percentage the customer selected |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |
| `terminalReaderType` | `TerminalReader` | — The terminal reader type used for this payment |
| `tipAmount` | `Float` | — The amount of tip attached to a Jobber payment |
| `transactionId` | `String!` | — The unique transaction for the payment used in an online transaction |
| `transactionStatus` | `JobberPaymentTransactionStatus!` | — The status of the jobber payment |

---

## `JobberPaymentsCapitalLoan`

Details on a loan which a Service Provider with a lender

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `acceptedAdvanceAmount` | `Float` | — Amount of advance accepted for loan, in whole currency units (eg. dollars) |
| `acceptedFrom` | `CapitalLoanAcceptanceSource` | — Where the capital loan offer was accepted from |
| `createdAt` | `ISO8601DateTime!` | — The time when the capital loan was created |
| `dismissedAt` | `ISO8601DateTime` | — The time when the capital loan was dismissed |
| `expiresAfter` | `ISO8601DateTime` | — The datetime that the capital loan expires |
| `financingType` | `StripeCapitalLoan` | — The type of financing product |
| `id` | `EncodedId!` | — The unique identifier |
| `initialOffer` | `Boolean!` | — Whether the loan is the Service Provider's first loan offer |
| `initiatedAmplitudeEvent` | `Boolean!` | — Whether the capital financing loan application has initiated, started, but not yet finished |
| `loanFeeAmount` | `Float` | — Amount of fee charged for loan, in whole currency units (eg. dollars) |
| `loanId` | `String!` | — The ID of the loan |
| `offeredAdvanceAmount` | `Float` | — Amount of advance offered for loan, in whole currency units (eg. dollars) |
| `refill` | `Boolean!` | — Whether the loan is a refill |
| `status` | `String!` | — The status of the loan |
| `updatedAt` | `ISO8601DateTime!` | — The last time the capital loan was changed |

---

## `JobberPaymentsCapitalLoanConnection`

The connection type for JobberPaymentsCapitalLoan.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[JobberPaymentsCapitalLoanEdge!]` | — A list of edges. |
| `nodes` | `[JobberPaymentsCapitalLoan!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `JobberPaymentsCapitalLoanEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `JobberPaymentsCapitalLoan!` | — The item at the end of the edge. |

---

## `JobberPaymentsCreditCardPaymentRecord`

A Jobber Payments credit card payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `brand` | `String!` | — The brand of the credit card used for an online transaction |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `devicePlatform` | `DevicePlatform` | — The device platform used for this payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `expiry` | `String!` | — The expiry on the card used for an online transaction |
| `feeAmount` | `Float` | — The amount of fee attached to a Jobber payment |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `lastDigits` | `String!` | — The last 4 digits on the card used for an online transaction |
| `nameOnCard` | `String!` | — The name on the card used for an online transaction |
| `paymentMethodFunding` | `String` | — Card funding type (e.g. credit, debit, prepaid) |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `payout` | `PayoutRecord` | — The payout associated with the payment record |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refundedAt` | `ISO8601DateTime` | — If refunded, the DateTime the payment was refunded. |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment record |
| `selectedTipPercentage` | `String` | — The tip percentage the customer selected |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |
| `surchargeAmount` | `Float` | — Surcharge amount in dollars |
| `surchargeTaxAmount` | `Float` | — Tax on surcharge in dollars |
| `terminalReaderType` | `TerminalReader` | — The terminal reader type used for this payment |
| `tipAmount` | `Float` | — The amount of tip attached to a Jobber payment |
| `transactionId` | `String!` | — The unique transaction for the payment used in an online transaction |
| `transactionStatus` | `JobberPaymentTransactionStatus!` | — The status of the jobber payment |

---

## `JobberPaymentsRefundPaymentRecord`

A refunded payment

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `devicePlatform` | `DevicePlatform` | — The device platform used for this payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `feeAmount` | `Float` | — The amount of fee attached to a Jobber payment |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refundedAt` | `ISO8601DateTime` | — If refunded, the DateTime the payment was refunded. |
| `refundedPaymentRecord` | `PaymentRecordInterface` | — The original payment made that was refunded |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `selectedTipPercentage` | `String` | — The tip percentage the customer selected |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |
| `terminalReaderType` | `TerminalReader` | — The terminal reader type used for this payment |
| `tipAmount` | `Float` | — The amount of tip attached to a Jobber payment |
| `transactionId` | `String!` | — The unique transaction for the payment used in an online transaction |
| `transactionStatus` | `JobberPaymentTransactionStatus!` | — The status of the jobber payment |

---

## `LastSyncDate`

Fields for updating the app's last sync date

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `payroll` | `ISO8601DateTime` | — Payroll app's last sync date information |

---

## `LienBalanceTransaction`

A lien balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `LiveState`

Represents the live state of a vehicle

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `currentPosition` | `GpsPositionType!` | — The current position of the vehicle |
| `dataRefreshedAt` | `ISO8601DateTime!` | — The timestamp when the live state data was last refreshed |
| `direction` | `Float!` | — The direction of the vehicle as a number of degrees (0-360) from north |
| `fuelPercentage` | `Float!` | — The current fuel percentage of the vehicle, expressed as a value between 0 and 1 |
| `speed` | `Float!` | — The current speed of the vehicle in km/h |
| `starterBatteryVoltage` | `Float!` | — The current starter battery voltage of the vehicle |
| `status` | `VehicleStatus!` | — The current status of the vehicle |
| `statusChangedAt` | `ISO8601DateTime!` | — The timestamp when the vehicle's status last changed |

---

## `MessageInterfaceConnection`

The connection type for MessageInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[MessageInterfaceEdge!]` | — A list of edges. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `MessageInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |

---

## `MoneyOrderPaymentRecord`

A money order payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `MutationErrors`

User errors that are triggered by a mutation

**Implements:** `UserErrorsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `message` | `String!` | — The message provided for this error. |
| `path` | `[String!]!` | — The field that triggered the error. |

---

## `Name`

The name of a person

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `first` | `String!` | — The first name of the person |
| `full` | `String!` | — The full name of the person |
| `last` | `String!` | — The last name of the person |

---

## `NoteFileInterfaceConnection`

The connection type for NoteFileInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[NoteFileInterfaceEdge!]` | — A list of edges. |
| `nodes` | `[NoteFileInterface!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `NoteFileInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `NoteFileInterface!` | — The item at the end of the edge. |

---

## `NoteLink`

Objects a note is linked to
```


**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `invoices` | `Boolean!` | — The note is linked to invoices |
| `jobs` | `Boolean!` | — The note is linked to jobs |
| `quotes` | `Boolean!` | — The note is linked to quotes |
| `requests` | `Boolean!` | — The note is linked to requests |

---

## `OnMyWayTrackingLink`

A on my way tracking link

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `trackingLink` | `Url!` | — The on my way tracking link |
| `vehicle` | `Vehicle!` | — The vehicle |
| `visit` | `Visit!` | — The visit |

---

## `OnMyWayTrackingLinkCreatePayload`

Autogenerated return type of OnMyWayTrackingLinkCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `onMyWayTrackingLink` | `OnMyWayTrackingLink` | — The newly created on my way tracking link |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the on my way tracking link |

---

## `OnlineBookingConfiguration`

Configuration settings for Online Booking belonging to the account of the authenticated Service Provider

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `acceptingOnlineBookings` | `Boolean!` | — Is the online booking page belonging to the account of the authenticated Service Provider currently available to the public |
| `bookingEmbedScript` | `String` | — The HTML for embedding the public online booking form |
| `bookingUrl` | `String!` | — Fully qualified URL for the SP's unique booking page. Shareable to SCs. |
| `id` | `EncodedId!` | — The unique identifier |

---

## `OtherPaymentRecord`

An other payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `PageInfo`

Information about pagination in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `endCursor` | `String` | — When paginating forwards, the cursor to continue. |
| `hasNextPage` | `Boolean!` | — When paginating forwards, are there more items? |
| `hasPreviousPage` | `Boolean!` | — When paginating backwards, are there more items? |
| `startCursor` | `String` | — When paginating backwards, the cursor to continue. |

---

## `PaymentBalanceTransaction`

A Payment Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `paymentRecord` | `PaymentRecordInterface` | — The payment record associated with |
| `tipAmount` | `Int` | — The balance transaction tip amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `PaymentMethodInterfaceConnection`

The connection type for PaymentMethodInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PaymentMethodInterfaceEdge!]` | — A list of edges. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PaymentMethodInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |

---

## `PaymentRecord`

Payment records applied to a quote or invoice

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `jobberPaymentLast4` | `String` | — The last4 of payment method |
| `jobberPaymentPaymentMethod` | `PaymentMethodSource` | — The payment method |
| `jobberPaymentTransactionStatus` | `JobberPaymentTransactionStatus` | — The status of the jobber payment, returns null for other payment types |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment record |
| `tipAmount` | `Float` | — The amount of tip attached to a Jobber payment |

---

## `PaymentRecordAllocationInterfaceConnection`

The connection type for PaymentRecordAllocationInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PaymentRecordAllocationInterfaceEdge!]` | — A list of edges. |
| `nodes` | `[PaymentRecordAllocationInterface!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PaymentRecordAllocationInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `PaymentRecordAllocationInterface!` | — The item at the end of the edge. |

---

## `PaymentRecordConnection`

The connection type for PaymentRecord.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PaymentRecordEdge!]` | — A list of edges. |
| `nodes` | `[PaymentRecord!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PaymentRecordEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `PaymentRecord!` | — The item at the end of the edge. |

---

## `PaymentRecordInterfaceConnection`

The connection type for PaymentRecordInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PaymentRecordInterfaceEdge!]` | — A list of edges. |
| `nodes` | `[PaymentRecordInterface!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PaymentRecordInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `PaymentRecordInterface!` | — The item at the end of the edge. |

---

## `PaymentRecordRefund`

Refund record applied to a payment record

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `jobberPaymentTransactionStatus` | `JobberPaymentTransactionStatus` | — The status of the jobber payment, returns null for other payment types |
| `tipAmount` | `Float` | — The amount of tip attached to a Jobber payment |

---

## `PaymentRecordRefundConnection`

The connection type for PaymentRecordRefund.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PaymentRecordRefundEdge!]` | — A list of edges. |
| `nodes` | `[PaymentRecordRefund!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PaymentRecordRefundEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `PaymentRecordRefund!` | — The item at the end of the edge. |

---

## `PayoutRecord`

A payout is the transfer of funds to a bank account

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `arrivalDate` | `ISO8601DateTime!` | — The expected arrival date of payout |
| `balanceTransactions` | `BalanceTransactionInterfaceConnection!` | — The transactions of the payout |
| `created` | `ISO8601DateTime!` | — The date the payout was created in Stripe |
| `createdAt` | `ISO8601DateTime!` | — The date the payout was created |
| `currency` | `String!` | — The currency used for the payout |
| `feeAmount` | `Int!` | — The payout fee amount in cents |
| `grossAmount` | `Int!` | — The payout gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `identifier` | `String!` | — The payout identifier |
| `netAmount` | `Int!` | — The payout net amount in cents |
| `payoutMethod` | `PayoutMethod!` | — The payout method |
| `status` | `PayoutStatus!` | — The status of the payout |
| `type` | `Payout!` | — The payout type |
| `updatedAt` | `ISO8601DateTime!` | — The date the payout was updated |

---

## `PayoutRecordConnection`

The connection type for PayoutRecord.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PayoutRecordEdge!]` | — A list of edges. |
| `nodes` | `[PayoutRecord!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PayoutRecordEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `PayoutRecord!` | — The item at the end of the edge. |

---

## `PaypalPaymentRecord`

A paypal payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the paypal payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `ProductOrService`

The collection of attributes that represent a product or service

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `bookableType` | `SelfServeBooking` | — The type of booking to be created in online booking for the product or service |
| `category` | `ProductsAndServicesCategory!` | — The item's category |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `defaultUnitCost` | `Float!` | — A product or service has a default price |
| `description` | `String` | — The description of product or service |
| `durationMinutes` | `Minutes` | — The duration of the service in minutes |
| `id` | `EncodedId!` | — The unique identifier |
| `internalUnitCost` | `Float` | — A product or service has a default internal unit cost |
| `lastJobLineItem` | `JobLineItem` | — The last line item created for this product or service |
| `lastQuoteLineItem` | `QuoteLineItem` | — The last quote line item created for this product or service |
| `markup` | `Float` | — A product or service has a default markup |
| `name` | `String!` | — The name of the product or service |
| `onlineBookingSortOrder` | `Int` | — Sort order of the service on the booking page |
| `onlineBookingsEnabled` | `Boolean` | — Whether the service is enabled on the booking page |
| `quantityRange` | `QuantityRange` | — Quantity range for the product or service when created through online booking |
| `taxable` | `Boolean` | — A product or service can be taxable or non-taxable |
| `visible` | `Boolean` | — A 'visible' product or service will show up as an autocomplete suggestion on quotes/jobs/invoice line items |

---

## `ProductOrServiceConnection`

The connection type for ProductOrService.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ProductOrServiceEdge!]` | — A list of edges. |
| `nodes` | `[ProductOrService!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ProductOrServiceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ProductOrService!` | — The item at the end of the edge. |

---

## `Property`

Properties are locations owned by Service Consumers where Service Providers provide service for

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `address` | `PropertyAddress!` | — The address of the property |
| `city` | `String!` | ⚠️ *deprecated* — The city for this address. |
| `client` | `Client` | — The client associated with the property |
| `contacts` | `ContactModelConnection` | — The contacts associated with the property |
| `country` | `String!` | ⚠️ *deprecated* — The country of this address. |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `id` | `EncodedId!` | — The unique identifier |
| `isBillingAddress` | `Boolean` | — Whether the property is a billing address |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `jobs` | `JobConnection!` | — The jobs associated with the property |
| `latitude` | `String!` | ⚠️ *deprecated* — The latitude of this address. |
| `longitude` | `String!` | ⚠️ *deprecated* — The longitude of this address. |
| `name` | `String` | — The name of the property |
| `postalCode` | `String!` | ⚠️ *deprecated* — The zip or postal code of this address. |
| `province` | `String!` | ⚠️ *deprecated* — The state or province of this address. |
| `quotes` | `QuoteConnection!` | — The quotes associated with the property |
| `recentPricing` | `ProductOrServiceConnection` | — The recently used work items for the property. |
| `requests` | `RequestConnection!` | — The requests associated with the property |
| `routingOrder` | `Int` | — The routing order of the property |
| `scheduledItems` | `ScheduledItemInterfaceConnection!` | — All scheduled items associated with the property, including visits, tasks, assessments, events, and reminders |
| `street` | `String!` | ⚠️ *deprecated* — The street component |
| `street1` | `String!` | ⚠️ *deprecated* — The first line of the street address |
| `street2` | `String!` | ⚠️ *deprecated* — The second line of the street address |
| `taxRate` | `TaxRate` | — The tax rate of the property |

---

## `PropertyAddress`

Address of properties owned by Service Consumers where Service Providers provide service for

**Implements:** `AddressInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `city` | `String` | — The city of the address |
| `coordinates` | `GeoPoint` | — The point coordinates of the address if it has been geo-coded |
| `country` | `String` | — The country of the address |
| `geoStatus` | `GeoStatus` | — The status of geo-locating the coordinates for an address |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String` | — The name of the property for the address |
| `postalCode` | `String` | — The postal code of the address |
| `province` | `String` | — The province of the address |
| `street` | `String!` | — The street address |
| `street1` | `String` | — The first line of the street address |
| `street2` | `String` | — The second line of the street address |

---

## `PropertyConnection`

The connection type for Property.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[PropertyEdge!]` | — A list of edges. |
| `nodes` | `[Property!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `PropertyCreatePayload`

Autogenerated return type of PropertyCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `client` | `Client` | — The client of the property |
| `properties` | `[Property!]!` | — The properties which have been created successfully |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the property |

---

## `PropertyEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Property!` | — The item at the end of the edge. |

---

## `PropertyEditPayload`

Autogenerated return type of PropertyEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `property` | `Property` | — The modified property |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the property |

---

## `QuantityRange`

Defines the valid range of quantities for a product or service when created through online booking

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `maxQuantity` | `Int` | — The maximum quantity (inclusive) an SC can select when booking this product or service |
| `minQuantity` | `Int` | — The minimum quantity (inclusive) an SC can select when booking this product or service |
| `quantityEnabled` | `Boolean!` | — True if the quantity range will be used when booking this product or service, false otherwise |

---

## `Quote`

A cost estimate of work which Service Providers send to their clients before any work is done

**Implements:** `CustomFieldsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `amounts` | `QuoteAmounts!` | — All amounts related to the quote |
| `client` | `Client` | — The client the quote was made for |
| `clientHubUri` | `String` | — The URI of the quote in client hub |
| `clientHubViewedAt` | `ISO8601DateTime` | — Time the quote was viewed at in Client Hub |
| `contractDisclaimer` | `String` | — The contract disclaimer for the quote |
| `cost` | `Float!` | ⚠️ *deprecated* — The total cost of the quote provided to the Service Client |
| `createdAt` | `ISO8601DateTime!` | — The time the quote was created |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `depositAmountUnallocated` | `Float` | — Paid deposit amount that is not yet associated with an invoice |
| `depositCollected` | `Boolean!` | ⚠️ *deprecated* — Has at least one deposit been collected? |
| `depositRecords` | `PaymentRecordConnection!` | — The deposit records applied to the quote |
| `eligibleForFinancing` | `Boolean!` | — Indicates if the quote is eligible for Wisetack financing offers |
| `id` | `EncodedId!` | — The unique identifier |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `jobs` | `JobConnection` | — Job IDs converted from this quote |
| `lastTransitioned` | `QuoteLastTransitioned!` | — The last transitioned dates of a quote |
| `lineItems` | `QuoteLineItemConnection!` | — The line items associated with the quote |
| `linkedCommunications` | `MessageInterfaceConnection!` | — All messages related to this work object. |
| `message` | `String` | — The message to the client |
| `noteAttachments` | `QuoteNoteFileConnection!` | — The note files attached to the quote |
| `notes` | `QuoteNoteUnionConnection!` | — The notes attached to the quote |
| `property` | `Property` | — The property the quote was made for |
| `quoteNumber` | `String!` | — A non-unique number assigned to the quote by a Service Provider |
| `quoteStatus` | `QuoteStatusTypeEnum!` | — The current status the quote |
| `request` | `Request` | — The request associated with the quote |
| `salesperson` | `User` | — Salesperson for the quote |
| `sentAt` | `ISO8601DateTime` | — The time a quote was last sent to the Service Client |
| `taxDetails` | `TaxDetails` | — The tax rate and amount details |
| `taxRate` | `TaxRate` | ⚠️ *deprecated* — The tax rate of the quote |
| `title` | `String` | — The description of the quote |
| `transitionedAt` | `ISO8601DateTime!` | — Time the quote transitioned to its current status |
| `unallocatedDepositRecords` | `PaymentRecordConnection!` | — The deposit records that haven't been applied to an invoice and have not been refunded |
| `updatedAt` | `ISO8601DateTime!` | — The last time the quote was changed in a way that is meaningful to the Service Provider |

---

## `QuoteAmounts`

All amounts related to a quote

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `depositAmount` | `Float!` | — The deposit amount |
| `discountAmount` | `Float!` | — The discount amount |
| `nonTaxAmount` | `Float!` | — The non-tax amount including the line items which are exempted from the tax |
| `outstandingDepositAmount` | `Float!` | — The remaining balance of the quote deposit yet to be collected |
| `subtotal` | `Float!` | — The subtotal including line item costs but excluding tax amounts |
| `taxAmount` | `Float!` | — The tax amount |
| `total` | `Float!` | — The total cost of the invoice or quote, including line item costs and tax amounts |

---

## `QuoteConnection`

The connection type for Quote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[QuoteEdge!]` | — A list of edges. |
| `nodes` | `[Quote!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `QuoteCreateLineItemsPayload`

Autogenerated return type of QuoteCreateLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdLineItems` | `[QuoteLineItem!]` | — The added line items |
| `quote` | `Quote` | — The related quote |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the quote |

---

## `QuoteCreateNotePayload`

Autogenerated return type of QuoteCreateNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `quote` | `Quote` | — The quote the note is attached to |
| `quoteNote` | `QuoteNote` | — The newly created note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note creation |

---

## `QuoteCreatePayload`

Autogenerated return type of QuoteCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `quote` | `Quote` | — The created quote |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the quote |

---

## `QuoteCreateTextLineItemsPayload`

Autogenerated return type of QuoteCreateTextLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdLineItems` | `[QuoteLineItem!]` | — The added line items |
| `quote` | `Quote` | — The related quote |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the quote |

---

## `QuoteDeleteLineItemsPayload`

Autogenerated return type of QuoteDeleteLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedLineItems` | `[QuoteLineItem!]!` | — The line items which have been deleted successfully |
| `quote` | `Quote` | — The quotes modified when deleting line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the quote |

---

## `QuoteEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Quote!` | — The item at the end of the edge. |

---

## `QuoteEditLineItemsPayload`

Autogenerated return type of QuoteEditLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `modifiedLineItems` | `[QuoteLineItem!]` | — The modified line items |
| `quote` | `Quote` | — The quote |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the quote |

---

## `QuoteEditNotePayload`

Autogenerated return type of QuoteEditNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `quote` | `Quote` | — The quote the note is attached to |
| `quoteNote` | `QuoteNote` | — The edited note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `QuoteEditPayload`

Autogenerated return type of QuoteEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `quote` | `Quote` | — The modified quote |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the quote |

---

## `QuoteLastTransitioned`

The last transitioned dates of a quote

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `approvedAt` | `ISO8601DateTime` | — The date the quote was last approved |
| `changesRequestedAt` | `ISO8601DateTime` | — The date the quote was last requested for changes |
| `convertedAt` | `ISO8601DateTime` | — The date the quote was last converted |

---

## `QuoteLineItem`

A quote line item

**Implements:** `LineItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `category` | `ProductsAndServicesCategory!` | — The category of the line item |
| `cost` | `Float!` | ⚠️ *deprecated* — The price of the line item |
| `createdAt` | `ISO8601DateTime!` | — The DateTime the line item was created |
| `description` | `String!` | — The description of the line item |
| `id` | `EncodedId!` | — The unique identifier |
| `linkedProductOrService` | `ProductOrService` | — The product or service from the Service Providers saved Products and Services list that was used to create this line item |
| `markup` | `Float` | — The markup of the line item |
| `name` | `String!` | — The name of the line item |
| `optional` | `Boolean!` | — Is the line item considered optional? |
| `qty` | `Float!` | ⚠️ *deprecated* — The quantity of the line item |
| `quantity` | `Float!` | — The quantity of the line item |
| `recommended` | `Boolean` | — When the line item is optional, is it recommended or has it been selected to be included by the client? |
| `selected` | `Boolean` | ⚠️ *deprecated* — Has the client chosen this optional line item? |
| `sortOrder` | `Int` | — The sort order of the line item |
| `taxable` | `Boolean!` | — If the line item is taxable |
| `textOnly` | `Boolean!` | — Is the line item text only (doesn't include quantity and price information) |
| `totalCost` | `Float` | — The total cost of the line item |
| `totalPrice` | `Float!` | — The total price of the line item |
| `unitCost` | `Float` | — The unit cost of the quote line item |
| `unitPrice` | `Float!` | — The unit price of the line item |
| `updatedAt` | `ISO8601DateTime!` | — The last DateTime the line item was changed in a way that is meaningful to the Service Provider |

---

## `QuoteLineItemConnection`

The connection type for QuoteLineItem.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[QuoteLineItemEdge!]` | — A list of edges. |
| `nodes` | `[QuoteLineItem!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `QuoteLineItemEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `QuoteLineItem!` | — The item at the end of the edge. |

---

## `QuoteNote`

A quote note

**Implements:** `NoteInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the note was created |
| `createdBy` | `NoteCreatedByUnion` | — The user or app that created the note |
| `fileAttachments` | `NoteFileInterfaceConnection!` | — The attached note files |
| `id` | `EncodedId!` | — The unique identifier |
| `lastEditedAt` | `ISO8601DateTime` | — When the note was last updated by a user |
| `lastEditedBy` | `User` | — The last user to edit the note |
| `linkedTo` | `NoteLink!` | — What objects (client, quote, job, etc.) the note is linked to |
| `message` | `String!` | — The note message |
| `pinned` | `Boolean!` | — Whether the note is pinned |

---

## `QuoteNoteFile`

A file attached to a note

**Implements:** `NoteFileInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `contentType` | `String!` | — The type of the file |
| `createdAt` | `ISO8601DateTime!` | — The time the note file attachment was created |
| `fileName` | `String!` | — The name of the file |
| `fileSize` | `Int!` | — The size of the file in bytes |
| `id` | `EncodedId!` | — The unique identifier |
| `note` | `QuoteNoteUnion!` | — The note this attachment is attached to |
| `status` | `NoteFileStatusEnum!` | — The possible statuses for the file |
| `thumbnailUrl` | `String!` | — The location of the thumbnail |
| `updatedAt` | `ISO8601DateTime!` | — The time the note file attachment was updated |
| `url` | `String!` | — The location of the file |

---

## `QuoteNoteFileConnection`

The connection type for QuoteNoteFile.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[QuoteNoteFileEdge!]` | — A list of edges. |
| `nodes` | `[QuoteNoteFile!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `QuoteNoteFileEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `QuoteNoteFile!` | — The item at the end of the edge. |

---

## `QuoteNoteUnionConnection`

The connection type for QuoteNoteUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[QuoteNoteUnionEdge!]` | — A list of edges. |
| `nodes` | `[QuoteNoteUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `QuoteNoteUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `QuoteNoteUnion!` | — The item at the end of the edge. |

---

## `RecurrenceSchedule`

Recurrence details for a repeating event

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `calendarRule` | `ICalendarRule!` | — iCalendar Recurrence Rule |
| `friendly` | `String!` | — Human readable string describing the schedule's recurrence. Ex. Weekly on Sundays |

---

## `RefundBalanceTransaction`

A Refund Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `paymentRecord` | `PaymentRecordInterface` | — The payment record associated with |
| `tipAmount` | `Int` | — The balance transaction tip amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `RefundFeeBalanceTransaction`

A Refund Fee Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `Request`

A request which a client will create when they wish to enlist the help of a Service Provider for work

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `arrivalWindow` | `ArrivalWindow` | — The time window during which the SP can arrive at the assessment associated with the work request |
| `assessment` | `Assessment` | — The assessment associated with the work request |
| `client` | `Client!` | — The client associated with the work request |
| `companyName` | `String` | — The company name provided in the work request |
| `contactName` | `String` | — The primary contact of the client requesting work |
| `createdAt` | `ISO8601DateTime!` | — The time the work request was created |
| `email` | `String` | — The contact email provided in the work request |
| `id` | `EncodedId!` | — The unique identifier |
| `isArchivable` | `Boolean!` | — Whether the work request can be archived |
| `isScheduled` | `Boolean!` | — Whether the work request is scheduled |
| `jobberWebUri` | `String!` | — The URI for the given record in Jobber Online |
| `jobs` | `JobConnection!` | — The jobs associated with the specific work request |
| `lineItems` | `RequestLineItemConnection` | — The line items associated with the work request |
| `noteAttachments` | `RequestNoteFileConnection!` | — The note files attached to the request |
| `notes` | `RequestNoteUnionConnection!` | — The notes attached to the request |
| `phone` | `String` | — The contact phone provided in the work request |
| `property` | `Property` | — The property associated with the work request |
| `quotes` | `QuoteConnection!` | — The quotes associated with the work request |
| `referringClient` | `Client` | — The client that referred this work request, if this work request was referred |
| `requestStatus` | `RequestStatusTypeEnum!` | — The status of the work request |
| `salesperson` | `User` | — Salesperson for the request |
| `source` | `String!` | — The source of the work request |
| `title` | `String` | — The title of the work request |
| `updatedAt` | `ISO8601DateTime!` | — The last time the work request was changed in a way that is meaningful to the Service Provider |

---

## `RequestArchivePayload`

Autogenerated return type of RequestArchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The archived request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to archive the request |

---

## `RequestConnection`

The connection type for Request.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestEdge!]` | — A list of edges. |
| `nodes` | `[Request!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestCreateLineItemsPayload`

Autogenerated return type of RequestCreateLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `lineItems` | `[RequestLineItem!]` | — The added line items |
| `request` | `Request` | — The related request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the request |

---

## `RequestCreateNotePayload`

Autogenerated return type of RequestCreateNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The request the note is attached to |
| `requestNote` | `RequestNote` | — The newly created note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note creation |

---

## `RequestCreatePayload`

Autogenerated return type of RequestCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The created request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the request |

---

## `RequestDeleteLineItemsPayload`

Autogenerated return type of RequestDeleteLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `lineItems` | `[RequestLineItem!]` | — The line items which have been deleted successfully |
| `request` | `Request` | — The request modified when deleting line items |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the request |

---

## `RequestEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Request!` | — The item at the end of the edge. |

---

## `RequestEditJobFormsPayload`

Autogenerated return type of RequestEditJobForms.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The request with updated forms |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when updating the request |

---

## `RequestEditLineItemsPayload`

Autogenerated return type of RequestEditLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `lineItems` | `[RequestLineItem!]` | — The modified line items |
| `request` | `Request` | — The request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the request |

---

## `RequestEditNotePayload`

Autogenerated return type of RequestEditNote.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The request the note is attached to |
| `requestNote` | `RequestNote` | — The edited note |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during note edit |

---

## `RequestEditPayload`

Autogenerated return type of RequestEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The modified request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the request |

---

## `RequestLineItem`

A request line item

**Implements:** `LineItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `category` | `ProductsAndServicesCategory!` | — The category of the line item |
| `cost` | `Float!` | ⚠️ *deprecated* — The price of the line item |
| `createdAt` | `ISO8601DateTime!` | — The DateTime the line item was created |
| `description` | `String!` | — The description of the line item |
| `id` | `EncodedId!` | — The unique identifier |
| `linkedProductOrService` | `ProductOrService` | — The product or service from the Service Providers saved Products and Services list that was used to create this line item |
| `name` | `String!` | — The name of the line item |
| `qty` | `Float!` | ⚠️ *deprecated* — The quantity of the line item |
| `quantity` | `Float!` | — The quantity of the line item |
| `sortOrder` | `Int` | — The sort order of the line item |
| `taxable` | `Boolean!` | — If the line item is taxable |
| `totalCost` | `Float` | — The total cost of the line item |
| `totalPrice` | `Float!` | — The total price of the line item |
| `unitCost` | `Float` | — The unit cost of the line item |
| `unitPrice` | `Float!` | — The unit price of the line item |
| `updatedAt` | `ISO8601DateTime!` | — The last DateTime the line item was changed in a way that is meaningful to the Service Provider |

---

## `RequestLineItemConnection`

The connection type for RequestLineItem.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestLineItemEdge!]` | — A list of edges. |
| `nodes` | `[RequestLineItem!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestLineItemEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `RequestLineItem!` | — The item at the end of the edge. |

---

## `RequestNote`

A request note

**Implements:** `NoteInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the note was created |
| `createdBy` | `NoteCreatedByUnion` | — The user or app that created the note |
| `fileAttachments` | `NoteFileInterfaceConnection!` | — The attached note files |
| `id` | `EncodedId!` | — The unique identifier |
| `lastEditedAt` | `ISO8601DateTime` | — When the note was last updated by a user |
| `lastEditedBy` | `User` | — The last user to edit the note |
| `linkedTo` | `NoteLink!` | — What objects (client, quote, job, etc.) the note is linked to |
| `message` | `String!` | — The note message |
| `pinned` | `Boolean!` | — Whether the note is pinned |

---

## `RequestNoteFile`

A file attached to a note

**Implements:** `NoteFileInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `contentType` | `String!` | — The type of the file |
| `createdAt` | `ISO8601DateTime!` | — The time the note file attachment was created |
| `fileName` | `String!` | — The name of the file |
| `fileSize` | `Int!` | — The size of the file in bytes |
| `id` | `EncodedId!` | — The unique identifier |
| `note` | `RequestNoteUnion!` | — The note this attachment is attached to |
| `status` | `NoteFileStatusEnum!` | — The possible statuses for the file |
| `thumbnailUrl` | `String!` | — The location of the thumbnail |
| `updatedAt` | `ISO8601DateTime!` | — The time the note file attachment was updated |
| `url` | `String!` | — The location of the file |

---

## `RequestNoteFileConnection`

The connection type for RequestNoteFile.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestNoteFileEdge!]` | — A list of edges. |
| `nodes` | `[RequestNoteFile!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestNoteFileEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `RequestNoteFile!` | — The item at the end of the edge. |

---

## `RequestNoteUnionConnection`

The connection type for RequestNoteUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestNoteUnionEdge!]` | — A list of edges. |
| `nodes` | `[RequestNoteUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestNoteUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `RequestNoteUnion!` | — The item at the end of the edge. |

---

## `RequestSettings`

Request form settings and templates

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `bookingType` | `BookingType!` | — The type of booking this form creates when it's submitted. |
| `bufferDurationMinutes` | `Minutes!` | — Prevent back-to-back appointments by adding a buffer time between appointments. This does not take into account the client's location |
| `connectedToGoogle` | `Boolean!` | — Whether these request settings are the ones used for Google online booking |
| `default` | `Boolean!` | — Whether these request settings are the default for the account |
| `description` | `String` | — The description of the request form |
| `earliestAvailabilityMinutes` | `Minutes!` | — The earliest availability minutes |
| `efficientSchedulingType` | `EfficientSchedulingType!` | — How to handle buffer time between appointments. none allows back-to-back appointments. |
| `embeddedRequestUrl` | `String` | — The URL for the embeded version of the public work request form |
| `enabled` | `Boolean!` | — Whether the request settings are enabled or disabled. Disabled work requests will not be visible to clients. |
| `formAssignments` | `[RequestFormAssignment!]!` | — The places where this request form is being used |
| `id` | `EncodedId!` | — The unique identifier |
| `intervalDurationMinutes` | `Minutes!` | — The interval duration minutes |
| `maxDriveTimeMinutes` | `Minutes!` | — Only show appointments that are within the indicated drive time of other appointments |
| `name` | `String` | — The name of the form |
| `requestEmbedScript` | `String` | — The HTML for the public work request form |
| `requestUrl` | `String` | — The URL for the public work request form |
| `serviceAreasEnabled` | `Boolean!` | — Whether service areas are enabled |
| `successMessageDescription` | `String` | — The description of the success message |
| `successMessageTitle` | `String` | — The title of the success message |
| `successUrl` | `String` | — The URL of the success page |

---

## `RequestSettingsConnection`

The connection type for RequestSettings.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestSettingsEdge!]` | — A list of edges. |
| `nodes` | `[RequestSettings!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestSettingsEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `RequestSettings!` | — The item at the end of the edge. |

---

## `RequestUnarchivePayload`

Autogenerated return type of RequestUnarchive.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `request` | `Request` | — The archived request |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to unarchive the request |

---

## `RequestedWorkObjectUnionConnection`

The connection type for RequestedWorkObjectUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[RequestedWorkObjectUnionEdge!]` | — A list of edges. |
| `nodes` | `[RequestedWorkObjectUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `RequestedWorkObjectUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `RequestedWorkObjectUnion!` | — The item at the end of the edge. |

---

## `ReservedFundsBalanceTransaction`

A Reserved Funds Payout Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `ScheduledItemInterfaceConnection`

The connection type for ScheduledItemInterface.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[ScheduledItemInterfaceEdge!]` | — A list of edges. |
| `nodes` | `[ScheduledItemInterface!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `ScheduledItemInterfaceEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `ScheduledItemInterface!` | — The item at the end of the edge. |

---

## `SourceAttribution`

Source attribution for an object

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `displayLeadSource` | `String` | — The lead source value, consistently formatted regardless of the source type |
| `metadata` | `JSON` | — Metadata about the source attribution |
| `source` | `SourceAttributionSource` | — The source of the object, present if there is an associated object |
| `sourceText` | `String!` | — The source of the object in plain text, not required if there is an associated object |

---

## `SupplierInvoiceBatch`

A batch of uploaded supplier invoices

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the batch was created |
| `errorMessage` | `String` | — Error details if the batch failed |
| `id` | `EncodedId!` | — The unique identifier |
| `status` | `String!` | — Current processing status of the batch |
| `supplierInvoiceDocuments` | `SupplierInvoiceDocumentConnection!` | — Documents belonging to this batch |
| `updatedAt` | `ISO8601DateTime!` | — When the batch was last updated |

---

## `SupplierInvoiceBatchConnection`

The connection type for SupplierInvoiceBatch.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[SupplierInvoiceBatchEdge!]` | — A list of edges. |
| `nodes` | `[SupplierInvoiceBatch!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `SupplierInvoiceBatchEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `SupplierInvoiceBatch!` | — The item at the end of the edge. |

---

## `SupplierInvoiceDocument`

An individual supplier invoice document extracted from a batch

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `ISO8601DateTime!` | — When the document was created |
| `errorMessage` | `String` | — Error details if the document failed |
| `extractedDate` | `ISO8601Date` | — Invoice date extracted from the PDF |
| `extractedInvoiceId` | `String` | — Invoice ID extracted from the PDF |
| `extractedPoNumber` | `String` | — PO number extracted from the PDF |
| `extractedSubtotal` | `Float` | — Subtotal extracted from the PDF |
| `id` | `EncodedId!` | — The unique identifier |
| `status` | `String!` | — Current processing status |
| `updatedAt` | `ISO8601DateTime!` | — When the document was last updated |

---

## `SupplierInvoiceDocumentConnection`

The connection type for SupplierInvoiceDocument.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[SupplierInvoiceDocumentEdge!]` | — A list of edges. |
| `nodes` | `[SupplierInvoiceDocument!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `SupplierInvoiceDocumentEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `SupplierInvoiceDocument!` | — The item at the end of the edge. |

---

## `SupplierInvoiceUploadPayload`

Autogenerated return type of SupplierInvoiceUpload.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `batch` | `SupplierInvoiceBatch` | — The created supplier invoice batch |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered during upload |

---

## `Tag`

A tag that a Service Provider can add to a client

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `EncodedId!` | — The unique identifier |
| `label` | `String!` | — A label for tag |

---

## `TagConnection`

The connection type for Tag.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TagEdge!]` | — A list of edges. |
| `nodes` | `[Tag!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TagEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Tag!` | — The item at the end of the edge. |

---

## `Task`

A task represents each time a Service Provider has scheduled client meetings, administrative duties, etc.

**Implements:** `ScheduledItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `allDay` | `Boolean!` | — Indicates whether the scheduled item is for a full day |
| `assignedUsers` | `UserConnection` | — Users assigned to the scheduled item |
| `client` | `Client` | — The client for the task |
| `createdBy` | `User` | — The user that created this scheduled item |
| `duration` | `Int` | — Minute duration between start and end time. |
| `endAt` | `ISO8601DateTime` | — End date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `id` | `EncodedId!` | — The unique identifier |
| `instructions` | `String` | — The instructions for the task |
| `isComplete` | `Boolean!` | — Whether the task has been completed |
| `isDefaultTitle` | `Boolean!` | — Indicates whether the title is the default |
| `isRecurring` | `Boolean!` | — Indicates if the task is part of a recurring chain |
| `overrideOrder` | `Int` | — An override for ordering anytime and unscheduled items |
| `property` | `Property` | — The property for the task |
| `recurrenceSchedule` | `RecurrenceSchedule` | — Recurrence details |
| `routingOrder` | `Int` | — The order in which the scheduled item should be routed |
| `startAt` | `ISO8601DateTime` | — Start date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `teamReminderOffset` | `Minutes` | — Offset in minutes from the time of the scheduled item to notify the team |
| `title` | `String` | — The title of the scheduled item |

---

## `TaskConnection`

The connection type for Task.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TaskEdge!]` | — A list of edges. |
| `nodes` | `[Task!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TaskCreatePayload`

Autogenerated return type of TaskCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `task` | `Task` | — The created task |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered in creating task |

---

## `TaskDeletePayload`

Autogenerated return type of TaskDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedTasks` | `[Task!]!` | — The tasks that were deleted |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems editing the completed |

---

## `TaskEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Task!` | — The item at the end of the edge. |

---

## `TaskEditPayload`

Autogenerated return type of TaskEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `task` | `Task` | — The edited task |
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems updating the task |

---

## `TaxCreatePayload`

Autogenerated return type of TaxCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `tax` | `TaxRateBase` | — The created tax |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered in creating tax |

---

## `TaxDetails`

The tax rate and amount details.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `totalTaxAmount` | `Float!` | — The total tax amount on the invoice or quote. |
| `totalTaxRate` | `TaxRateBase!` | — The total tax rate on the invoice or quote from a tax group or a simple tax rate. |

---

## `TaxGroupCreatePayload`

Autogenerated return type of TaxGroupCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `taxGroup` | `TaxRate` | — The created tax group |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered in creating tax group |

---

## `TaxRate`

The tax rate type which may contain other tax rates

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `components` | `[TaxRateBase!]` | — A list of tax rate's associated with the tax group |
| `default` | `Boolean!` | — Is this tax rate the default? |
| `description` | `String` | — The internal description of the tax rate. |
| `id` | `EncodedId!` | — The unique identifier |
| `label` | `String!` | — A string containing the names and rates of component tax rates. |
| `name` | `String!` | — The name of the tax rate. |
| `qboTaxType` | `String` | — The type of qbo sync. |
| `tax` | `Float!` | — The tax %. |

---

## `TaxRateBase`

The base type of a simple tax rate

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `default` | `Boolean!` | — Is this tax rate the default? |
| `description` | `String` | — The internal description of the tax rate. |
| `id` | `EncodedId!` | — The unique identifier |
| `label` | `String!` | — A string containing the names and rates of component tax rates. |
| `name` | `String!` | — The name of the tax rate. |
| `qboTaxType` | `String` | — The type of qbo sync. |
| `tax` | `Float!` | — The tax %. |

---

## `TaxRateConnection`

The connection type for TaxRate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TaxRateEdge!]` | — A list of edges. |
| `nodes` | `[TaxRate!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TaxRateEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `TaxRate!` | — The item at the end of the edge. |

---

## `TimeSheetEntry`

Time Sheet Entry

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `approved` | `Boolean!` | — Indicates whether the time sheet entry is approved. |
| `approvedBy` | `User` | — User that approved this time sheet entry. |
| `client` | `Client` | — The client associated with the job linked to the time sheet entry |
| `createdAt` | `ISO8601DateTime!` | — The time the time sheet was created |
| `duration` | `Seconds!` | ⚠️ *deprecated* — Duration of the time sheet entry in seconds. |
| `endAt` | `ISO8601DateTime` | — Date and time the time sheet entry was completed (resolves to nil for time sheets without a time range). |
| `finalDuration` | `Seconds!` | — Duration of a stopped time sheet entry (resolves to 0 for ticking entries). |
| `id` | `EncodedId!` | — The unique identifier |
| `job` | `Job` | — Job linked to the timer. |
| `label` | `String` | — Label on the time sheet entry |
| `labourRate` | `Float` | — Labour rate associated with this time sheet entry. |
| `note` | `String` | — Note attached. |
| `paidBy` | `User` | — User that marked this time sheet entry as paid. |
| `startAt` | `ISO8601DateTime!` | — Date and time the time sheet entry was started. |
| `ticking` | `Boolean!` | — Flag indicating whether the timer is actively running or not. |
| `updatedAt` | `ISO8601DateTime!` | — The last time the time sheet was updated |
| `user` | `User` | — User the time sheet entry belongs to. |
| `visit` | `Visit` | — Visit linked to the time sheet entry. |
| `visitDurationTotal` | `Int!` | — Total duration in seconds the user worked on the related visit. |

---

## `TimeSheetEntryConnection`

The connection type for TimeSheetEntry.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TimeSheetEntryEdge!]` | — A list of edges. |
| `nodes` | `[TimeSheetEntry!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TimeSheetEntryEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `TimeSheetEntry!` | — The item at the end of the edge. |

---

## `TimeSheetEntryGroup`

A grouping of time sheet entries by job or label (no association)

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `byJob` | `Job` | — The job this group is associated with, if group type is JOB |
| `id` | `EncodedId!` | — The unique identifier |
| `name` | `String!` | — Display name for this group (e.g., job name or label) |
| `timeSheetsByDay` | `TimeSheetUserDayConnection!` | — Per-day breakdown of time sheet entries for this group |
| `totalDuration` | `Seconds!` | — Total duration in seconds for all entries in this group |

---

## `TimeSheetEntryGroupConnection`

The connection type for TimeSheetEntryGroup.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TimeSheetEntryGroupEdge!]` | — A list of edges. |
| `nodes` | `[TimeSheetEntryGroup!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TimeSheetEntryGroupEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `TimeSheetEntryGroup!` | — The item at the end of the edge. |

---

## `TimeSheetUserDay`

Time sheet data for a single user on a specific day

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `date` | `ISO8601Date!` | — The calendar date represented by this day |
| `entries` | `TimeSheetEntryConnection!` | — The individual time sheet entries for this user on this day |
| `hoursStatus` | `TimeSheetStatus!` | — Status, derived from this day's time sheet entries (e.g., abnormally high) |
| `id` | `EncodedId!` | — The unique identifier |
| `totalDuration` | `Seconds!` | — Total duration in seconds for this user on this day |

---

## `TimeSheetUserDayConnection`

The connection type for TimeSheetUserDay.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[TimeSheetUserDayEdge!]` | — A list of edges. |
| `nodes` | `[TimeSheetUserDay!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `TimeSheetUserDayEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `TimeSheetUserDay!` | — The item at the end of the edge. |

---

## `UnknownBalanceTransaction`

A Unknown Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `UpdateFutureVisitsPayload`

Autogenerated return type of UpdateFutureVisits.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `success` | `Boolean` | — Whether the update operation was successfully queued |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when queueing the update operation |

---

## `User`

A user belongs to an account and generally completes work for clients

**Implements:** `UserInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `account` | `Account` | — The parent account for the user |
| `address` | `UserAddress` | — The address of the user |
| `apps` | `ApplicationConnection!` | — List of apps user has connected |
| `assignedColor` | `String` | — The color assigned to the user |
| `assignedVehicle` | `Vehicle` | — The vehicle assigned to the user |
| `availableForScheduling` | `Boolean!` | — Whether the user is available for scheduling |
| `createdAt` | `ISO8601DateTime!` | — The time the user was created |
| `customFields` | `[CustomFieldUnion!]!` | — The custom fields set for this object |
| `email` | `UserEmail!` | — The email address of the user |
| `firstDayOfTheWeek` | `UserFirstDayOfTheWeekEnum!` | — The first day of the week of the user's account |
| `franchiseTokenLastFour` | `String` | — Returns the last four characters of the franchise access token for the user if one exists |
| `id` | `EncodedId!` | — The unique identifier |
| `isAccountAdmin` | `Boolean!` | — Is the user an administrator on their account |
| `isAccountOwner` | `Boolean!` | — Is the user the owner of their account |
| `isCurrentUser` | `Boolean!` | — Is this the authenticated user querying |
| `lastLoginAt` | `ISO8601DateTime` | — The date the user logged in last |
| `name` | `Name!` | — The name of the user |
| `phone` | `UserPhone` | — The phone of the user |
| `status` | `UserStatusEnum!` | — The status of the user |
| `timeSheetsByDay` | `TimeSheetUserDayConnection!` | — Per-day breakdown of time sheet entries for a user |
| `timezone` | `Timezone` | — The timezone of the user's account |
| `uuid` | `String!` | — The uuid of the user |

---

## `UserAddress`

The address of a user

**Implements:** `AddressInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `city` | `String` | — The city of the address |
| `coordinates` | `GeoPoint` | — The point coordinates of the address if it has been geo-coded |
| `country` | `String` | — The country of the address |
| `geoStatus` | `GeoStatus` | — The status of geo-locating the coordinates for an address |
| `name` | `String` | — The name of the property for the address |
| `postalCode` | `String` | — The postal code of the address |
| `province` | `String` | — The province of the address |
| `street` | `String!` | — The street address |
| `street1` | `String` | — The first line of the street address |
| `street2` | `String` | — The second line of the street address |

---

## `UserConnection`

The connection type for User.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[UserEdge!]` | — A list of edges. |
| `nodes` | `[User!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `UserEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `User!` | — The item at the end of the edge. |

---

## `UserEditPayload`

Autogenerated return type of UserEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `user` | `User` | — The modified user |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the user |

---

## `UserEmail`

The email address of a user

**Implements:** `EmailInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `isValid` | `Boolean!` | — Is the email address valid |
| `raw` | `String!` | — The email address as stored (may be standard or what was entered by user) |

---

## `UserPhone`

The phone number of a user

**Implements:** `PhoneNumberInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `areaCode` | `String` | — The area code of the phone number |
| `countryCode` | `String` | — The country code of the  |
| `friendly` | `String` | — A user friendly representation of the phone number |
| `isValid` | `Boolean!` | — Is the phone number valid |
| `raw` | `String!` | — The phone number as stored (may be standard or what was entered by user) |

---

## `ValueCount`

The number of values per object that belong to a custom field configuration

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `clients` | `Int!` | — Number of clients with a custom field value for the configuration |
| `invoices` | `Int!` | — Number of invoices with a custom field value for the configuration |
| `jobs` | `Int!` | — Number of jobs with a custom field value for the configuration |
| `productsAndServices` | `Int!` | — Number of products and services with a custom field value for the configuration |
| `properties` | `Int!` | — Number of properties with a custom field value for the configuration |
| `quotes` | `Int!` | — Number of quotes with a custom field value for the configuration |
| `users` | `Int!` | — Number of users with a custom field value for the configuration |

---

## `Vehicle`

A vehicle

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assignedUsers` | `UserConnection!` | — The users assigned to the vehicle. |
| `createdAt` | `ISO8601DateTime!` | — The timestamp when the vehicle record was created. |
| `externalUrl` | `String` | — A URL to an external resource with more information about the vehicle. |
| `iconColor` | `String!` | — The color code representing the vehicle's icon in the user interface. |
| `id` | `EncodedId!` | — The unique identifier |
| `licensePlate` | `String` | — The vehicle's license plate number. |
| `liveState` | `LiveState` | — The live state of the vehicle. |
| `make` | `String!` | — The manufacturer or brand of the vehicle. |
| `model` | `String!` | — The specific model designation of the vehicle. |
| `name` | `String!` | — A user-defined name or identifier for the vehicle. |
| `updatedAt` | `ISO8601DateTime!` | — The timestamp when the vehicle record was last updated. |
| `vin` | `String` | — The Vehicle Identification Number (VIN) of the vehicle. |
| `year` | `Int!` | — The production year of the vehicle. |

---

## `VehicleConnection`

The connection type for Vehicle.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[VehicleEdge!]` | — A list of edges. |
| `nodes` | `[Vehicle!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `VehicleCreatePayload`

Autogenerated return type of VehicleCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when creating the vehicle |
| `vehicle` | `Vehicle` | — The newly created vehicle |

---

## `VehicleDeletePayload`

Autogenerated return type of VehicleDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to delete the vehicle |
| `vehicle` | `Vehicle` | — The deleted vehicle |

---

## `VehicleEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Vehicle!` | — The item at the end of the edge. |

---

## `VehiclesUpdatePayload`

Autogenerated return type of VehiclesUpdate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when updating the vehicle |
| `vehicles` | `[Vehicle!]` | — The updated vehicle |

---

## `VenmoPaymentRecord`

A venmo payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the Venmo payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---

## `Visit`

A visit that represents each time a Service Provider goes to a client property to complete work

**Implements:** `ScheduledItemInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `actionsUponComplete` | `[VisitActionUponComplete!]!` | — The actions available after completing the visit |
| `allDay` | `Boolean!` | — Indicates whether the scheduled item is for a full day |
| `arrivalWindow` | `ArrivalWindow` | — The time window during which the SP can arrive at the visit |
| `assignedUsers` | `UserConnection` | — Users assigned to the scheduled item |
| `client` | `Client!` | — The Client for the visit |
| `clientConfirmed` | `Boolean!` | — Whether the client has confirmed this visit |
| `completedAt` | `ISO8601DateTime` | — The time that the visit was completed. |
| `completedBy` | `String` | — The name of the user or system that completed the visit. |
| `createdAt` | `ISO8601DateTime!` | — The time that the visit was created. |
| `createdBy` | `User` | — The user that created this scheduled item |
| `duration` | `Int` | — Minute duration between start and end time. |
| `endAt` | `ISO8601DateTime` | — End date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `id` | `EncodedId!` | — The unique identifier |
| `incompleteJobFormsCount` | `Int!` | — The number of incomplete job form submissions for this visit |
| `instructions` | `String` | — The instructions for the visit |
| `invoice` | `Invoice` | — The invoice for the visit |
| `isComplete` | `Boolean!` | — Whether the visit has been completed |
| `isDefaultTitle` | `Boolean!` | — Indicates whether the title is the default |
| `isLastScheduledVisit` | `Boolean!` | — Whether the visit is the last visit for the associated job. |
| `job` | `Job!` | — The Job the visit is associated with |
| `lineItems` | `JobLineItemConnection!` | — A list of line items for the visit |
| `notes` | `JobNoteUnionConnection` | — The notes attached to the associated job |
| `overrideOrder` | `Int` | — An override for ordering anytime and unscheduled items |
| `property` | `Property!` | — The property for the visit |
| `routingOrder` | `Int` | — The order in which the scheduled item should be routed |
| `startAt` | `ISO8601DateTime` | — Start date and time of the scheduled item. An unscheduled visit is represented by both startAt and endAt being null |
| `teamReminderOffset` | `Minutes` | — Offset in minutes from the time of the scheduled item to notify the team |
| `time` | `ISO8601DateTime` | ⚠️ *deprecated* — The time of the visit |
| `timeSheetEntries` | `TimeSheetEntryConnection` | — A list of all timesheet entries for this visit |
| `title` | `String` | — The title of the scheduled item |
| `visitStatus` | `VisitStatusTypeEnum!` | — The status of the visit |

---

## `VisitCompletePayload`

Autogenerated return type of VisitComplete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems modifying the visit |
| `visit` | `Visit` | — The modified visit |

---

## `VisitConnection`

The connection type for Visit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[VisitEdge!]` | — A list of edges. |
| `nodes` | `[Visit!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `VisitCreateLineItemsPayload`

Autogenerated return type of VisitCreateLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the visit line items |
| `visit` | `Visit` | — The modified visit |

---

## `VisitCreatePayload`

Autogenerated return type of VisitCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `createdVisits` | `[Visit!]!` | — The visits which have been created successfully |
| `job` | `Job!` | — The job modified when creating visits |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the job |

---

## `VisitDeleteLineItemsPayload`

Autogenerated return type of VisitDeleteLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the visit line items |
| `visit` | `Visit` | — The modified visit |

---

## `VisitDeletePayload`

Autogenerated return type of VisitDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to delete the visit |
| `visits` | `[Visit!]` | — The deleted visit |

---

## `VisitEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `Visit!` | — The item at the end of the edge. |

---

## `VisitEditAssignedUsersPayload`

Autogenerated return type of VisitEditAssignedUsers.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems updating the visit. |
| `visit` | `Visit` | — The edited visit. |

---

## `VisitEditLineItemsPayload`

Autogenerated return type of VisitEditLineItems.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when modifying the visit line items |
| `visit` | `Visit` | — The modified visit |

---

## `VisitEditPayload`

Autogenerated return type of VisitEdit.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems updating the visit. |
| `visit` | `Visit` | — The edited visit. |

---

## `VisitEditSchedulePayload`

Autogenerated return type of VisitEditSchedule.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered when trying to edit the visit schedule |
| `visit` | `Visit` | — The updated visit |

---

## `VisitSchedule`

Visit schedule detailed information

**Implements:** `ScheduleDetailsInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `assignedTo` | `UserConnection!` | — Users assigned at time of job creation. This may differ from users assigned to the job's visits |
| `endDate` | `ISO8601DateTime` | — End date of the schedule |
| `endTime` | `ISO8601DateTime` | — Daily end time |
| `recurrenceSchedule` | `RecurrenceSchedule` | — Recurrence details |
| `startDate` | `ISO8601DateTime` | — Start date of the schedule |
| `startTime` | `ISO8601DateTime` | — Daily start time |

---

## `VisitUncompletePayload`

Autogenerated return type of VisitUncomplete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors if there are problems modifying the visit |
| `visit` | `Visit` | — The modified visit |

---

## `VisitsInfo`

Information about visits on a job

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `futureCount` | `Int!` | — The total of incomplete scheduled and unscheduled visits |
| `incompleteTotal` | `Int!` | — The total number of incomplete visits |
| `mostRecentVisitStartAt` | `ISO8601DateTime` | — Start timestamp of the most recent visit up to the visitsScheduledBetween.before threshold (or current time if not set) for this job |
| `pastCount` | `Int!` | — The number of past incomplete visits on the job up until the end of the current day |
| `scheduledCount` | `Int!` | — The number of scheduled visits that are incomplete |
| `unscheduledCount` | `Int!` | — The number of unscheduled visits |

---

## `WebHookPayload`

The payload sent to apps which subscribe to a webhook; everything is selected in this type

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `accountId` | `EncodedId!` | — The unique identifier of the account which triggered the event |
| `appId` | `String!` | — The app id that should receive the web hook event |
| `itemId` | `EncodedId!` | — The unique identifier of the object which triggered the event |
| `occuredAt` | `ISO8601DateTime!` | — The time the event occurred at |
| `topic` | `WebHookTopicEnum!` | — The topic of the web hook event, in the form of `{OBJECT}_{EVENT}` |

---

## `WebhookEndpoint`

A representation of a webhook endpoint

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `account` | `Account!` | — The account the webhook endpoint is attached to |
| `app` | `Application!` | — The app that created the webhook endpoint |
| `createdAt` | `ISO8601DateTime!` | — When the webhook endpoint was created |
| `id` | `EncodedId!` | — The unique identifier |
| `topic` | `WebHookTopicEnum!` | — The topic of the webhook endpoint |
| `updatedAt` | `ISO8601DateTime!` | — When the webhook endpoint was updated |
| `url` | `String!` | — URL to be notified at when an event for the topic occurs |

---

## `WebhookEndpointCreatePayload`

Autogenerated return type of WebhookEndpointCreate.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `userErrors` | `[MutationErrors!]!` | — Errors encountered in creating the webhook endpoint |
| `webhookEndpoint` | `WebhookEndpoint` | — The created webhook endpoint |

---

## `WebhookEndpointDeletePayload`

Autogenerated return type of WebhookEndpointDelete.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `deletedWebhookEndpoints` | `[WebhookEndpoint!]` | — The webhook endpoints that have successfully been deleted |
| `userErrors` | `[MutationErrors!]!` | — Errors encountered while deleting the webhook endpoints |

---

## `WonDisputeBalanceTransaction`

A Won Dispute Balance Transaction

**Implements:** `BalanceTransactionInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `created` | `ISO8601DateTime!` | — The date the balance transaction was created |
| `currency` | `String!` | — The type of currency used |
| `feeAmount` | `Int!` | — The balance transaction fee amount in cents |
| `grossAmount` | `Int!` | — The balance transaction gross amount in cents |
| `id` | `EncodedId!` | — The unique identifier |
| `netAmount` | `Int!` | — The balance transaction net amount in cents |
| `type` | `BalanceTransaction` | — The balance transaction type |

---

## `WorkItem`

The collection of attributes that represent a Work Item

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `defaultUnitCost` | `Float!` | ⚠️ *deprecated* — A Work Item has a default price |
| `description` | `String` | ⚠️ *deprecated* — The description of the Work Item |
| `id` | `Int!` | ⚠️ *deprecated* — The unique id of the Work Item |
| `internalUnitCost` | `Float` | ⚠️ *deprecated* — A Work Item has a default internal unit cost |
| `markup` | `Float` | ⚠️ *deprecated* — A Work Item has a default markup |
| `name` | `String!` | ⚠️ *deprecated* — The name of the Work Item |
| `qty` | `String` | ⚠️ *deprecated* — Represents the last quantity this work item had on a quote attached to the same property |
| `taxable` | `Boolean` | ⚠️ *deprecated* — A Work Item can be taxable or non-taxable |
| `visible` | `Boolean` | ⚠️ *deprecated* — A 'visible' work item will show up as an autocomplete suggestion on quotes/jobs/invoice line items |

---

## `WorkObjectUnionConnection`

The connection type for WorkObjectUnion.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `edges` | `[WorkObjectUnionEdge!]` | — A list of edges. |
| `nodes` | `[WorkObjectUnion!]!` | — A list of nodes. |
| `pageInfo` | `PageInfo!` | — Information to aid in pagination. |
| `totalCount` | `Int!` | — The total count of possible records in this list. Supports filters.
Please use with caution. Using totalCount raises the likelyhood you will be throttled
 |

---

## `WorkObjectUnionEdge`

An edge in a connection.

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `cursor` | `String!` | — A cursor for use in pagination. |
| `node` | `WorkObjectUnion!` | — The item at the end of the edge. |

---

## `ZellePaymentRecord`

A zelle payment applied to a quote or invoice

**Implements:** `PaymentRecordInterface`

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| `adjustmentType` | `IncomeAdjustmentType!` | — Type of income generating payment record |
| `allocations` | `PaymentRecordAllocationInterfaceConnection` | — The allocations associated with the payment |
| `amount` | `Float!` | — The amount applied against the quote or invoice balance (absolute value) |
| `canEdit` | `Boolean!` | — Whether the payment can be edited |
| `client` | `Client` | — The client associated with the payment |
| `confirmationNumber` | `String` | — The confirmation number of the Zelle payment |
| `details` | `String` | — Additional details about the payment |
| `entryDate` | `ISO8601DateTime!` | — The time the payment record was created |
| `id` | `EncodedId!` | — The unique identifier |
| `invoice` | `Invoice` | — The invoice associated with the payment |
| `paymentOrigin` | `PaymentOrigin` | — Where the payment originated from |
| `paymentType` | `PaymentType` | — The type of payment used, i.e cash, check, Jobber Payments... |
| `quote` | `Quote` | — The quote associated with the deposit payment |
| `rawAmount` | `Float!` | — The raw amount applied against the quote or invoice balance (preserves sign). |
| `refunds` | `PaymentRecordRefundConnection` | — Refunds associated with the payment |
| `sentAt` | `ISO8601DateTime` | — If sent, the DateTime the payment record was sent to client. |

---
