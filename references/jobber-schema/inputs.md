# Jobber GraphQL — Input Types Reference
Total: 185 input object types
---

## `AddressAttributes`

Attributes of a property

**Fields:**
- `street1: String` (optional) — The first line of the street address
- `street2: String` (optional) — The second line of the street address
- `city: String` (optional) — The city
- `country: String` (optional) — The country
- `province: String` (optional) — The state or province
- `postalCode: String` (optional) — The zip or postal code

---

## `AppAlertEditInput`

Attributes for updating an app alert

**Fields:**
- `count: Int!` (**required**) — The new number of alerts between 0 and 100

---

## `AppointmentAllDayInput`

Input for updating schedule of an existing appointment

**Fields:**
- `startDate: ISO8601Date!` (**required**) — The new start date of the appointment
- `endDate: ISO8601Date` (optional) — The new end date of the appointment
- `timezone: Timezone!` (**required**) — The timezone for input

---

## `AppointmentEditAssignmentInput`

Input for updating the team members assigned to an existing appointment

**Fields:**
- `assignedUserIds: [EncodedId!]!` (**required**) — The ids to assign to the existing appointment

---

## `AppointmentEditCompletenessInput`

Input for updating the completeness of an existing appointment

**Fields:**
- `completed: Boolean!` (**required**) — Whether the appointment's status is complete

---

## `AppointmentEditScheduleInput`

Input for updating schedule of an existing appointment

**Fields:**
- `unschedule: True` (optional) — Unschedule the appointment
- `schedule: AppointmentScheduleInput` (optional) — Set a new date and time schedule for the appointment
- `scheduleAllDay: AppointmentAllDayInput` (optional) — Set a new all day schedule for the appointment

---

## `AppointmentScheduleInput`

Input for updating schedule of an existing appointment

**Fields:**
- `startAt: ISO8601Time!` (**required**) — The new start time of the appointment
- `endAt: ISO8601Time!` (**required**) — The new end time of the appointment
- `timezone: Timezone!` (**required**) — The timezone for input

---

## `ArrivalWindowAttributes`

Attributes used for arrival window generation

**Fields:**
- `durationInMinutes: Minutes!` (**required**) — The duration of the arrival window

---

## `AssessmentCreateInput`

Inputs for creating an assessment

**Fields:**
- `instructions: String` (optional) — The instructions for the assessment
- `schedule: ScheduledItemAttributes` (optional) — The schedule for the visit

---

## `AssessmentEditInput`

Inputs for editing an assessment

**Fields:**
- `instructions: String` (optional) — The instructions for the assessment
- `schedule: ScheduledItemAttributes` (optional) — The schedule for the assessment

---

## `CapitalLoanFilterAttributes`

Attributes for filtering capital loans

**Fields:**
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The loan's created at date to filter by
- `status: CapitalLoanStatus` (optional) — The loan's status to filter by

---

## `ClientAddressUpdateAttributes`

Attributes for updating a client address

**Fields:**
- `street1: String` (optional) — The first line of the street address
- `street2: String` (optional) — The second line of the street address
- `city: String` (optional) — The city
- `country: String` (optional) — The country
- `province: String` (optional) — The state or province
- `postalCode: String` (optional) — The zip or postal code
- `latitude: Float` (optional) — The latitude of this address
- `longitude: Float` (optional) — The longitude of this address
- `placeId: String` (optional) — The Google place_id of this address

---

## `ClientCreateInput`

Attributes for creating a new client

**Fields:**
- `title: ClientTitle` (optional) — The title of the client
- `firstName: String` (optional) — The first name of the client
- `lastName: String` (optional) — The last name of the client
- `companyName: String` (optional) — The company name of the client
- `isCompany: Boolean` (optional) — Use company name as the primary name of the client
- `receivesReminders: Boolean` (optional) — Does the client receive assessment or visit reminders
- `receivesFollowUps: Boolean` (optional) — Does the client receive job follow ups
- `receivesQuoteFollowUps: Boolean` (optional) — Does the client receive quote follow ups
- `receivesInvoiceFollowUps: Boolean` (optional) — Does the client receive invoice follow ups
- `receivesReviewRequests: Boolean` (optional) — Does the client receive review requests
- `phones: [PhoneNumberCreateAttributes!]` (optional) — The client's phone numbers
- `emails: [EmailCreateAttributes!]` (optional) — The client's email addresses
- `properties: [PropertyAttributes!]` (optional) — The client's properties
- `billingAddress: AddressAttributes` (optional) — The client's billing address
- `customFields: [CustomFieldCreateInput!]` (optional) — The client's custom fields
- `sourceAttribution: SourceAttributionAttributes` (optional) — The source of the client object
- `contacts: [ContactCreateAttributes!]` (optional) — List of contacts to add to the client

---

## `ClientCreateNoteInput`

Attributes for creating client notes

**Fields:**
- `message: String` (optional) — The message to be placed on the note
- `attachments: [NoteAttachmentAttributes!]` (optional) — List of attachments to be added to the note
- `pinned: Boolean` (optional) — Whether the note should be pinned
- `linkedTo: ClientNoteLinkInput` (optional) — Which objects this client note should be linked to

---

## `ClientDeleteNoteInput`

Attributes for deleting an existing client note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note

---

## `ClientEditInput`

Attributes for updating a client

**Fields:**
- `title: ClientTitle` (optional) — The title of the client
- `firstName: String` (optional) — The first name of the client
- `lastName: String` (optional) — The last name of the client
- `companyName: String` (optional) — The company name of the client
- `isCompany: Boolean` (optional) — Use company name as the primary name of the client
- `phonesToAdd: [PhoneNumberCreateAttributes!]` (optional) — List of phone numbers to append to the client's phones
- `phonesToEdit: [PhoneNumberUpdateAttributes!]` (optional) — List of phone numbers to be updated
- `phonesToDelete: [EncodedId!]` (optional) — List of phone numbers to delete from the client's phones
- `emailsToAdd: [EmailCreateAttributes!]` (optional) — List of emails to append to the client's email addresses
- `emailsToEdit: [EmailUpdateAttributes!]` (optional) — List of emails to be updated
- `emailsToDelete: [EncodedId!]` (optional) — List of emails to delete from the client
- `tagsToAdd: [String!]` (optional) — List of tags to append to the client's tags
- `tagsToDelete: [String!]` (optional) — List of tags to delete from the client's tags
- `billingAddress: AddressAttributes` (optional) — The client's billing address
- `customFields: [CustomFieldEditInput!]` (optional) — The client's custom fields
- `receivesReminders: Boolean` (optional) — Does the client receive assessment or visit reminders
- `receivesFollowUps: Boolean` (optional) — Does the client receive job follow ups
- `receivesQuoteFollowUps: Boolean` (optional) — Does the client receive quote follow ups
- `receivesInvoiceFollowUps: Boolean` (optional) — Does the client receive invoice follow ups
- `receivesReviewRequests: Boolean` (optional) — Does the client receive review requests
- `contactsToAdd: [ContactCreateAttributes!]` (optional) — List of contacts to append to the client
- `contactsToEdit: [ContactEditAttributes!]` (optional) — List of contacts to update
- `contactsToDelete: [EncodedId!]` (optional) — List of contacts to delete
- `propertiesToAdd: [PropertyAttributes!]` (optional) — The client's properties to add
- `propertiesToEdit: [PropertyEditAttributes!]` (optional) — The client's properties to update
- `propertiesToDelete: [EncodedId!]` (optional) — The client's properties to delete

---

## `ClientEditNoteInput`

Attributes for editing an existing client note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `linkedTo: ClientNoteLinkInput` (optional) — Which objects this note should be linked to
- `message: String` (optional) — The new message to place on the note
- `attachmentsToAdd: [NoteAttachmentAttributes!]` (optional) — List of attachments to append to the note
- `attachmentsToDelete: [EncodedId!]` (optional) — List of attachments to delete from the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `ClientFilterAttributes`

Attributes for filtering clients

**Fields:**
- `isCompany: Boolean` (optional) — Whether or not the client is a company
- `isLead: Boolean` (optional) — Whether or not the client is a lead
- `isArchived: Boolean` (optional) — Whether or not the client is archived
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The client updated at date to filter by
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The client created at date to filter by
- `tags: [String!]` (optional) — The client tags to filter by

---

## `ClientNoteLinkInput`

Attributes for linking client notes

**Fields:**
- `invoices: Boolean` (optional) — Whether the note should be linked to related invoices
- `jobs: Boolean` (optional) — Whether the note should be linked to related jobs
- `quotes: Boolean` (optional) — Whether the note should be linked to related quotes
- `requests: Boolean` (optional) — Whether the note should be linked to related requests

---

## `ClientPhoneFilterAttributes`

Attributes for filtering client phones

**Fields:**
- `smsAllowed: Boolean` (optional) — Whether or not the number is SMS enabled
- `smsStopped: Boolean` (optional) — Whether or not the number has requested to receive no more messages
- `isValidSmsPhoneNumber: Boolean` (optional) — Filter down to just numbers that are valid and can receive SMS

---

## `ClientScheduledItemsFilter`

Attributes for filtering scheduled items on a client

**Fields:**
- `scheduleItemType: ScheduledItemType` (optional) — The type of scheduled item to filter by

---

## `ClientsSortInput`

The attributes to sort on a collection of Clients

**Fields:**
- `key: ClientsSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `ContactCreateAttributes`

Attributes for creating a new contact

**Fields:**
- `firstName: String` (optional) — The first name of the contact
- `lastName: String` (optional) — The last name of the contact
- `role: String` (optional) — The role of the contact
- `title: ClientTitle` (optional) — The title of the contact
- `isBillingContact: Boolean` (optional) — Whether this contact is responsible for billing
- `receivesReminders: Boolean` (optional) — Whether this contact receives assessment or visit reminders
- `receivesFollowUps: Boolean` (optional) — Whether this contact receives job follow ups
- `receivesQuoteFollowUps: Boolean` (optional) — Whether this contact receives quote follow ups
- `receivesInvoiceFollowUps: Boolean` (optional) — Whether this contact receives invoice follow ups
- `phones: [PhoneNumberCreateAttributes!]` (optional) — List of phone numbers to append to the client's phones
- `emails: [EmailCreateAttributes!]` (optional) — List of emails to append to the client's email addresses

---

## `ContactEditAttributes`

Attributes for editing a contact

**Fields:**
- `street1: String` (optional) — The first line of the street address
- `street2: String` (optional) — The second line of the street address
- `city: String` (optional) — The city
- `country: String` (optional) — The country
- `province: String` (optional) — The state or province
- `postalCode: String` (optional) — The zip or postal code
- `latitude: Float` (optional) — The latitude of this address
- `longitude: Float` (optional) — The longitude of this address
- `placeId: String` (optional) — The Google place_id of this address
- `id: EncodedId!` (**required**) — The ID of the contact
- `firstName: String` (optional) — The first name of the contact
- `lastName: String` (optional) — The last name of the contact
- `role: String` (optional) — The role of the contact
- `title: ClientTitle` (optional) — The title of the contact
- `isBillingContact: Boolean` (optional) — Whether this contact is responsible for billing
- `receivesReminders: Boolean` (optional) — Whether this contact receives assessment or visit reminders
- `receivesFollowUps: Boolean` (optional) — Whether this contact receives job follow ups
- `receivesQuoteFollowUps: Boolean` (optional) — Whether this contact receives quote follow ups
- `receivesInvoiceFollowUps: Boolean` (optional) — Whether this contact receives invoice follow ups
- `phonesToAdd: [PhoneNumberCreateAttributes!]` (optional) — List of phone numbers to append to the client's phones
- `phonesToEdit: [PhoneNumberUpdateAttributes!]` (optional) — List of phone numbers to be updated
- `phonesToDelete: [EncodedId!]` (optional) — List of phone numbers to delete from the client's phones
- `emailsToAdd: [EmailCreateAttributes!]` (optional) — List of emails to append to the client's email addresses
- `emailsToEdit: [EmailUpdateAttributes!]` (optional) — List of emails to be updated
- `emailsToDelete: [EncodedId!]` (optional) — List of emails to delete from the client

---

## `ContactFilterInput`

Attributes for filtering contacts

**Fields:**
- `includePropertyContacts: Boolean` (optional) (default: `false`) — If true, returns both client and property level contacts.

---

## `ContactsSortInput`

The attributes to sort on a collection of Contacts

**Fields:**
- `key: ContactsSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `CostModifierAttributes`

Used to define a modifier on a cost amount (i.e. a deposit or discount) that can be either a fixed amount or a percentage amount

**Fields:**
- `rate: Float!` (**required**) — The value of the cost modifier
- `type: CostModifierTypeEnum!` (**required**) — The way to apply the cost modifier

---

## `CustomFieldConfigurationAreaDefaultValueInput`

Default value input for an area custom field configuration

**Fields:**
- `length: Float` (optional) — The default length for area custom field configuration
- `width: Float` (optional) — The default width for area custom field configuration

---

## `CustomFieldConfigurationCreateAreaInput`

Input for creating a new area custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: CustomFieldConfigurationAreaDefaultValueInput` (optional) — The default values for an area custom field configuration
- `unit: String!` (**required**) — The unit for an area custom field configuration

---

## `CustomFieldConfigurationCreateDropdownInput`

Input for creating a new dropdown custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: String` (optional) — The default value for a dropdown custom field configuration. If not supplied, first value of `dropdownOptions` will be used as the default
- `dropdownOptions: [String!]!` (**required**) — The default value for a dropdown custom field configuration

---

## `CustomFieldConfigurationCreateLinkInput`

Input for creating a new link custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: CustomFieldConfigurationLinkDefaultValueInput` (optional) — The default value for link custom fields

---

## `CustomFieldConfigurationCreateNumericInput`

Input for creating a new numeric custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: Float` (optional) — The default value for a numeric custom field configuration
- `unit: String!` (**required**) — The unit for a numeric custom field configuration

---

## `CustomFieldConfigurationCreateTextInput`

Input for creating a new text custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: String` (optional) — The default value for a text custom field

---

## `CustomFieldConfigurationCreateTrueFalseInput`

Input for creating a new True False custom field configuration

**Fields:**
- `appliesTo: CustomFieldAppliesTo!` (**required**) — What objects the custom field will be applied to
- `name: String!` (**required**) — Name for the custom field
- `transferable: Boolean!` (**required**) — Applies custom field to linked work objects
- `readOnly: Boolean!` (**required**) — Value of custom field is read-only
- `defaultValue: Boolean!` (**required**) — The default value for a True False custom field

---

## `CustomFieldConfigurationEditAreaInput`

Input for editing an existing area custom field configuration

**Fields:**
- `defaultValue: CustomFieldConfigurationAreaDefaultValueInput` (optional) — The default values for an area custom field configuration
- `unit: String` (optional) — The unit for an area custom field configuration

---

## `CustomFieldConfigurationEditDropdownInput`

Input for editing an existing dropdown custom field configuration

**Fields:**
- `defaultValue: String` (optional) — The default value for a dropdown custom field configuration. If not supplied, first value of `dropdownOptions` will be used as the default
- `dropdownOptions: [String!]` (optional) — The default value for a dropdown custom field configuration

---

## `CustomFieldConfigurationEditInput`

Input for editing a custom field configuration

**Fields:**
- `name: String` (optional) — Name for the custom field
- `valueText: CustomFieldConfigurationEditTextInput` (optional) — Default values and other attributes for link text custom field configuration
- `valueLink: CustomFieldConfigurationEditLinkInput` (optional) — Default values and other attributes for link type custom field configuration
- `valueArea: CustomFieldConfigurationEditAreaInput` (optional) — Default values and other attributes for area type custom field values
- `valueTrueFalse: CustomFieldConfigurationEditTrueFalseInput` (optional) — Default values and other attributes for true/false type custom field configuration
- `valueNumeric: CustomFieldConfigurationEditNumericInput` (optional) — Default values and other attributes for numeric type custom field configuration
- `valueDropdown: CustomFieldConfigurationEditDropdownInput` (optional) — Default values and other attributes for dropdown type custom field configuration

---

## `CustomFieldConfigurationEditLinkInput`

Input for editing an existing link custom field configuration

**Fields:**
- `defaultValue: CustomFieldConfigurationLinkDefaultValueInput` (optional) — The default value for link custom fields

---

## `CustomFieldConfigurationEditNumericInput`

Input for editing an existing numeric custom field configuration

**Fields:**
- `defaultValue: Float` (optional) — The default value for a numeric custom field configuration
- `unit: String` (optional) — The unit for a numeric custom field configuration

---

## `CustomFieldConfigurationEditTextInput`

Input for editing an existing text custom field configuration

**Fields:**
- `defaultValue: String` (optional) — The default value for a text custom field

---

## `CustomFieldConfigurationEditTrueFalseInput`

Input for editing a existing True False custom field configuration

**Fields:**
- `defaultValue: Boolean!` (**required**) — The default value for a True False custom field

---

## `CustomFieldConfigurationLinkDefaultValueInput`

Input for specifying the default value for a link custom field configuration

**Fields:**
- `text: String!` (**required**) — The default text for link custom fields
- `url: String` (optional) — The default URL for link custom fields

---

## `CustomFieldConfigurationsFilterInput`

CustomFieldConfigurations filter input

**Fields:**
- `appliesTo: CustomFieldAppliesTo` (optional) — The object the CustomFieldConfigurations apply to
- `valueType: CustomFieldConfigurationValueType` (optional) — The type of CustomFieldConfiguration
- `createdByThisApp: Boolean` (optional) — Only include configurations created by the current app

---

## `CustomFieldConfigurationsSortInput`

The attributes to sort on a collection of custom field configurations

**Fields:**
- `key: CustomFieldConfigurationsSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `CustomFieldCreateInput`

Attributes for creating custom fields. Exactly one of the values (or both valueAreaLength and valueAreaWidth) must be provided and it (they) must match the correct type.

**Fields:**
- `customFieldConfigurationId: EncodedId` (optional) — The ID of the custom field configuration being changed
- `valueText: String` (optional) — The text value to set
- `valueLink: CustomFieldValueLinkInput` (optional) — Attributes for link type custom field values
- `valueArea: CustomFieldValueAreaInput` (optional) — Attributes for area type custom field values
- `valueTrueFalse: Boolean` (optional) — The true/false value to set
- `valueNumeric: Float` (optional) — The numeric value to set
- `valueDropdown: String` (optional) — The dropdown value to set

---

## `CustomFieldEditInput`

Attributes for updating custom fields

**Fields:**
- `customFieldConfigurationId: EncodedId` (optional) — The ID of the custom field configuration being changed
- `valueText: String` (optional) — The text value to set
- `valueLink: CustomFieldValueLinkInput` (optional) — Attributes for link type custom field values
- `valueArea: CustomFieldValueAreaInput` (optional) — Attributes for area type custom field values
- `valueTrueFalse: Boolean` (optional) — The true/false value to set
- `valueNumeric: Float` (optional) — The numeric value to set
- `valueDropdown: String` (optional) — The dropdown value to set
- `id: EncodedId` (optional) — The ID of the custom field value being changed

---

## `CustomFieldValueAreaInput`

Attributes for area type custom field values

**Fields:**
- `length: Float` (optional) — The length value to set
- `width: Float` (optional) — The width value to set

---

## `CustomFieldValueLinkInput`

Attributes for link type custom field values

**Fields:**
- `text: String` (optional) — The link label text value to set
- `url: String` (optional) — The url value to set

---

## `DateRange`

Date range for filtering

**Fields:**
- `startAt: ISO8601DateTime!` (**required**) — The start timestamp filter
- `endAt: ISO8601DateTime!` (**required**) — The end timestamp filter

---

## `DiscountInput`

Attributes for creating and editing a discount

**Fields:**
- `discountRate: Float` (optional) — The discount rate of the invoice
- `discountType: CostModifierTypeEnum` (optional) — The discount type of the invoice

---

## `EmailCreateAttributes`

Attributes of an email address

**Fields:**
- `description: EmailDescription` (optional) — The email address type.
- `address: String` (optional) — The email address as stored.
- `primary: Boolean` (optional) — Is this the primary email address?

---

## `EmailFilterInput`

Attributes for filtering emails

**Fields:**
- `includeSecondaryContacts: Boolean` (optional) — Whether to include emails attached to secondary contacts
- `propertyIds: [EncodedId!]` (optional) — The properties to filter emails by. This filter has no effect without include_secondary_contacts set to true

---

## `EmailUpdateAttributes`

Attributes of an email address

**Fields:**
- `description: EmailDescription` (optional) — The email address type.
- `address: String` (optional) — The email address as stored.
- `primary: Boolean` (optional) — Is this the primary email address?
- `id: EncodedId!` (**required**) — The id of the email address being changed.

---

## `EventCreateInput`

Input for creating a new event

**Fields:**
- `title: String!` (**required**) — Title of the event
- `description: String` (optional) — Details to describe the event
- `startAt: ISO8601DateTime!` (**required**) — When the event starts
- `endAt: ISO8601DateTime` (optional) — When the event ends
- `allDay: Boolean` (optional) — Indicates whether this is an all day event
- `recurrenceRule: ICalendarRule` (optional) — The ICalendarRecurrenceRule that will be used for scheduling events

---

## `ExpenseCreateInput`

Attributes for creating a new expense

**Fields:**
- `title: String!` (**required**) — The title of the expense
- `description: String` (optional) — Details about the expense
- `date: ISO8601DateTime!` (**required**) — When the expense was incurred
- `total: Float` (optional) — The total cost of the expense
- `reimbursableToId: EncodedId` (optional) — The user to be reimbursed
- `accountingCodeId: EncodedId` (optional) — Accounting code for this expense
- `linkedJobId: EncodedId` (optional) — The associated job
- `receiptUrl: String` (optional) — The URL for the receipt
- `receiptSignedBlobId: EncodedId` (optional) — The signed blob ID from ActiveStorage for an already uploaded file. Takes precedence over receipt_url if both provided.

---

## `ExpenseEditInput`

Input for modifying an existing expense

**Fields:**
- `title: String` (optional) — The title of the expense item
- `accountingCodeId: EncodedId` (optional) — The associated accounting code of the expense
- `reimbursableToId: EncodedId` (optional) — The user to be reimbursed
- `description: String` (optional) — The description of the expense
- `receiptUrl: String` (optional) — The image url with receipt of the expense
- `date: ISO8601DateTime` (optional) — The date the expense was incurred
- `total: Float` (optional) — The total cost of the expense
- `receiptSignedBlobId: EncodedId` (optional) — The signed blob ID from ActiveStorage for an already uploaded file. Takes precedence over receipt_url if both provided.

---

## `ExpenseFilterAttributes`

Attributes for filtering expenses

**Fields:**
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The expenses created_at date to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The expenses updated_at date to filter by
- `date: Iso8601DateTimeRangeInput` (optional) — The expenses date it was submitted for to filter by
- `enteredById: EncodedId` (optional) — The ID of the user who entered the expense
- `reimbursableToId: EncodedId` (optional) — The ID of the user who the expense should be reimbursed to

---

## `ExpensesSortInput`

The attributes to sort on a collection of expenses

**Fields:**
- `key: ExpensesSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `FileAttachmentAttributes`

Uploadable file attachment from amazon s3. If s3_key, and signed_blob_id are passed in, signed_blob_id will take precedence

**Fields:**
- `id: ID` (optional) — The id of the file attachment
- `fileName: String!` (**required**) — The name of the file
- `contentType: String!` (**required**) — The type of file
- `fileSize: Int!` (**required**) — The size of file
- `fileableType: String!` (**required**) — The jobber object type of the parent
- `fileableId: ID` (optional) — The jobber object id of the parent
- `s3Key: String` (optional) — The associated key in amazon s3
- `signedBlobId: EncodedId` (optional) — The signed blob ID from ActiveStorage for an already uploaded file. Takes precedence over S3 key when present.

---

## `FloatRangeInput`

Select a range of Float, use either `eq` or `min` and `max`, but not both. `min` or `max` can be `null` when used together to expand the range infinitely

**Fields:**
- `min: Float` (optional) — The minimum Float to select
- `max: Float` (optional) — The maximum Float to select
- `eq: Float` (optional) — The exact Float to select

---

## `FormAttachmentInput`

Attributes for attaching or detaching forms

**Fields:**
- `formIds: [EncodedId!]!` (**required**) — Form id

---

## `FormInput`

Input for a form

**Fields:**
- `sections: [FormSectionInput!]!` (**required**) — Sections of the form (1+ required)

---

## `FormItemInput`

Input for a question and answer form item within a section

**Fields:**
- `label: String!` (**required**) — Question for the form item
- `answerText: String` (optional) — Answer when question type is text

---

## `FormSectionInput`

Input for a form section

**Fields:**
- `label: String!` (**required**) — Label for the section
- `items: [FormItemInput!]!` (**required**) — Items in the section (1+ required)

---

## `GPSPositionInput`

Input type for latitude and longitude of a vehicle

**Fields:**
- `latitude: Float!` (**required**) — The latitude of the vehicle's position
- `longitude: Float!` (**required**) — The longitude of the vehicle's position
- `timestamp: ISO8601DateTime!` (**required**) — The timestamp for the last data refresh

---

## `IntRangeInput`

Select a range of Integer, use either `eq` or `min` and `max`, but not both. `min` or `max` can be `null` when used together to expand the range infinitely

**Fields:**
- `min: Int` (optional) — The minimum Int to select
- `max: Int` (optional) — The maximum Int to select
- `eq: Int` (optional) — The exact Int to select

---

## `InvoiceClientViewOptionsInput`

Input arguments for a client's view option settings for an invoice

**Fields:**
- `showLineItemQty: Boolean` (optional) — Setting to show the client invoice line item quantities
- `showLineItemUnitCosts: Boolean` (optional) — Setting to show the client invoice line item unit costs
- `showLineItemTotalCosts: Boolean` (optional) — Setting to show the client invoice line item total costs
- `showAccountBalance: Boolean` (optional) — Setting to show the account balance
- `showLateStamp: Boolean` (optional) — Setting to show the late stamp

---

## `InvoiceCloseInput`

Input for closing an invoice

**Fields:**
- `closeOption: InvoiceCloseOptionsType!` (**required**) — Option to close the invoice

---

## `InvoiceCreateInput`

Attributes for creating a new invoice

**Fields:**
- `message: String` (optional) — The message on the invoice
- `subject: String` (optional) — The subject line of the invoice
- `contractDisclaimer: String` (optional) — The contract disclaimer for the invoice
- `allowClientHubCreditCardPayments: Boolean` (optional) — Whether credit card payments are allowed on the invoice
- `allowClientHubAchPayments: Boolean` (optional) — Whether ach payments are allowed on the invoice
- `allowReviewRequest: Boolean` (optional) — Toggle whether to send a review request SMS
- `allowPartialPayments: Boolean` (optional) — Whether partial payments are allowed on an invoice
- `markSent: Boolean` (optional) — Mark the invoice as sent (changes status from draft to sent)
- `invoiceNumber: String` (optional) — The invoice number
- `trackingSource: String` (optional) — The tracking source
- `issuedDate: ISO8601DateTime` (optional) — The date the invoice was issued on
- `discount: DiscountInput` (optional) — The discount associated with the invoice
- `dueDetails: InvoiceDueDetails!` (**required**) — The due date and type of the invoice
- `propertyId: EncodedId` (optional) — The ID of the property for the invoice. Can only be provided for invoices without jobs.
- `jobId: EncodedId` (optional) — The unique identifier of the job to create an invoice from
- `visitIds: [EncodedId!]` (optional) — The unique identifier of the visits to create an invoice from
- `clientId: EncodedId!` (**required**) — The ID of the client the invoice is made for
- `tax: TaxInputType!` (**required**) — The tax associated with the invoice
- `depositIds: [EncodedId!]` (optional) — A list of unique identifiers of the deposits associated with the job to create an invoice from
- `salespersonId: EncodedId` (optional) — The salesperson for this invoice
- `referralIncentiveId: EncodedId` (optional) — The referral incentive ID to apply to the invoice
- `scheduledInvoiceId: EncodedId` (optional) — The scheduled invoice ID to apply to the invoice
- `jobIds: [EncodedId!]` (optional) — The unique identifier of the jobs to be associated with this invoice
- `lineItems: [InvoiceCreationLineItemInput!]!` (**required**) — The line items associated with the invoice
- `customFields: [CustomFieldCreateInput!]` (optional) — List of custom fields to add
- `clientViewOptions: InvoiceClientViewOptionsInput` (optional) — Per-invoice client view settings
- `notes: [InvoiceCreateNoteInput!]` (optional) — The notes to be added to the invoice

---

## `InvoiceCreateNoteInput`

Attributes for creating invoice notes

**Fields:**
- `message: String` (optional) — The message to be placed on the note
- `attachments: [NoteAttachmentAttributes!]` (optional) — List of attachments to be added to the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `InvoiceCreationLineItemInput`

Input for creating a new line item on a new invoice

**Fields:**
- `name: String!` (**required**) — The name of the line item
- `category: ProductsAndServicesCategory` (optional) — The type of line item
- `cost: Float` (optional) — The total cost of the line item (not cost per unit)
- `description: String` (optional) — The description of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `date: ISO8601DateTime` (optional) — The service date of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `jobLineItemId: EncodedId` (optional) — The unique ID of the job line item to be linked to the invoice line item

---

## `InvoiceDueDetails`

When the full payment of the invoice is due

**Fields:**
- `dueDate: ISO8601DateTime` (optional) — The date the invoice is due on
- `invoiceNet: Int` (optional) — The amount of days the invoice is due after it was issued

---

## `InvoiceEditInput`

Attributes for editing an invoice

**Fields:**
- `message: String` (optional) — The message on the invoice
- `propertyId: EncodedId` (optional) — The ID of the property for the invoice. Can only be set for invoices without jobs.
- `taxRateId: EncodedId` (optional) — The id of tax on the invoice
- `discount: DiscountInput` (optional) — The discount applied to this invoice. To remove the discount, set the rate to 0.
- `allowClientHubCreditCardPayments: Boolean` (optional) — Whether to allow credit card payments or not
- `allowClientHubAchPayments: Boolean` (optional) — Whether to allow ach payments or not
- `invoiceNumber: String` (optional) — The invoice number
- `issuedDate: ISO8601DateTime` (optional) — The date the invoice was issued on
- `dueDetails: InvoiceDueDetails` (optional) — The due date and net of the invoice
- `subject: String` (optional) — The subject of the invoice
- `contractDisclaimer: String` (optional) — The contract disclaimer for the invoice
- `customFields: [CustomFieldEditInput!]` (optional) — List of custom fields to modify or add
- `allowReviewRequest: Boolean` (optional) — Toggle whether to send a review request SMS
- `salespersonId: EncodedId` (optional) — The salesperson for this invoice
- `allowPartialPayments: Boolean` (optional) — Whether partial payments are allowed on an invoice
- `clientViewOptions: InvoiceClientViewOptionsInput` (optional) — Per-invoice client view settings

---

## `InvoiceEditNoteInput`

Attributes for editing an existing invoice note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `message: String` (optional) — The new message to place on the note
- `attachmentsToAdd: [NoteAttachmentAttributes!]` (optional) — List of attachments to append to the note
- `attachmentsToDelete: [EncodedId!]` (optional) — List of attachments to delete from the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `InvoiceFilterAttributes`

Attributes for filtering invoices

**Fields:**
- `clientId: EncodedId` (optional) — The encoded id of the client to filter by
- `invoiceNumber: EncodedId` (optional) — The invoice number to filter by
- `total: FloatRangeInput` (optional) — The total to filter by
- `issuedDate: Iso8601DateTimeRangeInput` (optional) — The issued date to filter by
- `dueDate: Iso8601DateTimeRangeInput` (optional) — The due date to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The updated date to filter by
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The created date filter by
- `status: InvoiceStatusTypeEnum` (optional) — The status to filter by
- `excludeOrigin: [InvoiceOrigin!]` (optional) — An array of origin(s) of the invoice to exclude

---

## `InvoiceSortInput`

The attributes to sort on a collection of invoices

**Fields:**
- `key: InvoiceSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `Iso8601DateTimeRangeInput`

Select a range of ISO8601DateTime, use either `eq` or `min` and `max`, but not both. `min` or `max` can be `null` when used together to expand the range infinitely

**Fields:**
- `before: ISO8601DateTime` (optional) — The before date in ISO8601DateTime format to select
- `after: ISO8601DateTime` (optional) — The after date in ISO8601DateTime format to select
- `eq: ISO8601DateTime` (optional) — The exact date in ISO8601DateTime format to select

---

## `JobCloseInput`

Attributes for closing a job

**Fields:**
- `modifyIncompleteVisitsBy: IncompleteVisitDecisionEnum!` (**required**) — What to do with the incomplete visits on the job

---

## `JobCreateAttributes`

Attributes for creating a new job

**Fields:**
- `propertyId: EncodedId!` (**required**) — The ID of the property of the client
- `quoteId: EncodedId` (optional) — The quote associated with the job
- `requestId: EncodedId` (optional) — The request associated with the job
- `jobFormIds: [EncodedId!]` (optional) — The job form ids associated with the job
- `salespersonId: EncodedId` (optional) — The user/employee who sold this job
- `notes: [JobCreateNoteInput!]` (optional) — The notes to be added to the job
- `title: String` (optional) — The title of the Job
- `jobNumber: Int` (optional) — The number of the job
- `instructions: String` (optional) — The instructions on a job
- `trackingOrigin: String` (optional) — The creation origin of the job
- `allowReviewRequest: Boolean` (optional) — Toggle whether to send a review request SMS
- `timeframe: TimeframeAttributes` (optional) — The date on which the job is scheduled to start, as well as its duration
- `scheduling: JobSchedulingAttributes` (optional) — Job scheduling detailed information
- `invoicing: JobInvoicingAttributes!` (**required**) — Job invoicing detailed information
- `arrivalWindow: ArrivalWindowAttributes` (optional) — Job arrival window information
- `lineItems: [JobCreateLineItemAttributes!]` (optional) — The line items associated with the job
- `customFields: [CustomFieldCreateInput!]` (optional) — List of custom fields to add

---

## `JobCreateLineItemAttributes`

Attributes for creating a new line item on a job

**Fields:**
- `name: String!` (**required**) — The name of the line item
- `description: String` (optional) — The description of the line item
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `saveToProductsAndServices: Boolean!` (**required**) — Save a copy of the new line item to products and services for future use
- `quoteLineItemId: EncodedId` (optional) — The quote line item id related to this line item
- `unitCost: Float` (optional) — The unit cost of the line item
- `unitPrice: Float!` (**required**) — The unit price of the line item
- `quantity: Float!` (**required**) — The quantity of the line item
- `sortOrder: Int` (optional) — The sort order of the line item

---

## `JobCreateLineItemsInput`

Inputs for creating a new line item on a job

**Fields:**
- `lineItems: [JobCreateLineItemAttributes!]!` (**required**) — The attributes of the created line items

---

## `JobCreateNoteInput`

Attributes for creating job notes

**Fields:**
- `message: String` (optional) — The message to be placed on the note
- `attachments: [NoteAttachmentAttributes!]` (optional) — List of attachments to be added to the note
- `pinned: Boolean` (optional) — Whether the note should be pinned
- `linkedTo: JobNoteLinkInput` (optional) — Which objects this job note should be linked to

---

## `JobDeleteLineItemsInput`

Input for removing line items on a job

**Fields:**
- `lineItemIds: [EncodedId!]!` (**required**) — The line items to delete

---

## `JobDeleteNoteInput`

Attributes for deleting an existing job note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note

---

## `JobEditInput`

Attributes for updating a job

**Fields:**
- `jobNumber: Int` (optional) — The number of the job
- `title: String` (optional) — The title of the job
- `instructions: String` (optional) — The instructions of a job and instructions on any incomplete visits
- `signature: SignatureInput` (optional) — Add a signature or modify an existing signature
- `timeframe: TimeframeAttributes` (optional) — Job Timeframe detailed information
- `scheduling: JobSchedulingAttributes` (optional) — Job scheduling detailed information
- `arrivalWindow: ArrivalWindowAttributes` (optional) — Job arrival window information
- `invoicing: JobInvoicingAttributes` (optional) — Job invoicing detailed information
- `customFields: [CustomFieldEditInput!]` (optional) — List of custom fields to modify or add
- `salespersonId: EncodedId` (optional) — The salesperson for this job
- `allowReviewRequest: Boolean` (optional) — Toggle whether to send a review request SMS
- `jobFormIds: [EncodedId!]` (optional) — The job form ids associated with the job

---

## `JobEditLineItemAttributes`

Attributes for editing a line item on a job

**Fields:**
- `lineItemId: EncodedId!` (**required**) — The unique identifier of the line item
- `name: String` (optional) — The name of the line item
- `description: String` (optional) — The description of the line item
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `unitCost: Float` (optional) — The internal unit cost of the line item.

---

## `JobEditLineItemsInput`

Input for editing line items on a job

**Fields:**
- `lineItems: [JobEditLineItemAttributes!]!` (**required**) — The attributes of the edited line items

---

## `JobEditNoteInput`

Attributes for editing an existing job note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `linkedTo: JobNoteLinkInput` (optional) — Which objects this note should be linked to
- `message: String` (optional) — The new message to place on the note
- `attachmentsToAdd: [NoteAttachmentAttributes!]` (optional) — List of attachments to append to the note
- `attachmentsToDelete: [EncodedId!]` (optional) — List of attachments to delete from the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `JobFilterAttributes`

Attributes for filtering jobs

**Fields:**
- `jobType: JobTypeTypeEnum` (optional) — The quote status to filter by
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The created date to filter by
- `startAt: Iso8601DateTimeRangeInput` (optional) — The start date to filter by
- `visitsScheduledBetween: Iso8601DateTimeRangeInput` (optional) — Filter jobs whose visit start dates fall within this window. Also used as threshold for visit-based sorting and mostRecentVisitStartAt field (uses the 'before' end of the range).
- `endAt: Iso8601DateTimeRangeInput` (optional) — The end date to filter by
- `completedAt: Iso8601DateTimeRangeInput` (optional) — The completed date to filter by
- `includeUnscheduled: Boolean` (optional) — To whether include unscheduled jobs or not
- `onlyInvoiceable: Boolean` (optional) — To only include jobs that can generate an invoice (includes jobs without line items)
- `ids: [EncodedId!]` (optional) — The ids of the job to filter by
- `status: JobStatusTypeEnum` (optional) — The status of the job to filter by

---

## `JobInvoicingAttributes`

Attributes used for invoicing generation

**Fields:**
- `invoicingType: BillingStrategy!` (**required**) — The invoicing strategy selected for the job
- `invoicingSchedule: BillingFrequencyEnum!` (**required**) — The frequency in which the invoicing should be done
- `recurrence: ICalendarRule` (optional) — The ICalendarRecurrenceRule that will be used for invoicing

---

## `JobNoteLinkInput`

Attributes for linking job notes

**Fields:**
- `invoices: Boolean` (optional) — Whether the note should be linked to related invoices

---

## `JobSchedulingAttributes`

Attributes used for visit generation

**Fields:**
- `createVisits: Boolean!` (**required**) — Whether to create visits or not
- `notifyTeam: Boolean!` (**required**) — Should the team be notified?
- `assignedTo: [EncodedId!]` (optional) — List of user ids assigned to the job and any scheduled visits
- `startTime: ISO8601Time` (optional) — The start time of the visit(s)
- `endTime: ISO8601Time` (optional) — The end time of the visit(s),
- `recurrence: ICalendarRule` (optional) — The ICalendarRecurrenceRule that will be used for scheduling visits. Must be prefixed with 'RRULE:'
- `visitConfirmationStatus: Boolean` (optional) — Whether created visits are confirmed by client or not

---

## `JobberPaymentsPaymentMethodFilterAttributes`

Attributes for filtering Jobber Payments payment methods

**Fields:**
- `clientId: EncodedId!` (**required**) — The encoded id of the client to filter by

---

## `JobsSortInput`

The attributes to sort on a collection of jobs

**Fields:**
- `key: JobSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `LastSyncDateEditInput`

Attributes for editing the app's last sync date

**Fields:**
- `payroll: ISO8601DateTime!` (**required**) — Timestamp of when the last payroll sync completed

---

## `LiveStateInput`

Input type for the live state of a vehicle

**Fields:**
- `status: VehicleStatus!` (**required**) — The status of the vehicle
- `statusChangedAt: ISO8601DateTime!` (**required**) — The timestamp for when the status was last updated
- `currentPosition: GPSPositionInput!` (**required**) — The current position of the vehicle
- `speed: Float!` (**required**) — The speed of the vehicle in km/h
- `direction: Float!` (**required**) — The direction of the vehicle as a number of degrees (0-360) from north
- `fuelPercentage: Float!` (**required**) — The current fuel percentage of the vehicle, expressed as a value between 0 and 1
- `starterBatteryVoltage: Float!` (**required**) — The current starter battery voltage of the vehicle
- `dataRefreshedAt: ISO8601DateTime!` (**required**) — The timestamp for the last data refresh

---

## `LocalDateTimeAttributes`

Date and Time attributes for inputs

**Fields:**
- `date: ISO8601Date!` (**required**) — The date for input
- `time: ISO8601Time` (optional) — The time for input
- `timezone: Timezone!` (**required**) — The timezone for input

---

## `NoteAttachmentAttributes`

Attributes for a new attachment. If both url and signedBlobId are provided, signedBlobId takes precedence.

**Fields:**
- `url: String` (optional) — The URL of the attachment
- `signedBlobId: EncodedId` (optional) — The signed blob ID from ActiveStorage for an already uploaded file. Takes precedence over url if both provided.

---

## `NoteAttachmentSortAttributes`

The attributes to sort on a notes attachments

**Fields:**
- `field: NoteAttachmentsSortableFieldsEnum!` (**required**) — The field to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `NotesSortInput`

The attributes to sort on a collection of notes

**Fields:**
- `key: NotesSortableFields!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `OnMyWayTrackingLinkCreateInput`

Attributes for creating a new on my way tracking link

**Fields:**
- `onMyWayTrackingLink: Url!` (**required**) — The on my way tracking link

---

## `PaymentRecordFilterAttributes`

Attributes for filtering payment records

**Fields:**
- `entryDate: Iso8601DateTimeRangeInput` (optional) — The payment record's entry date to filter by
- `adjustmentType: IncomeAdjustmentType` (optional) — The payment record's adjustment type to filter by
- `paymentType: PaymentType` (optional) — The payment type to filter by
- `refundable: Boolean` (optional) — Whether or not the payment is refundable
- `clientId: EncodedId` (optional) — The unique identifier for a client

---

## `PaymentRecordSortAttributes`

Attributes for sorting payment records

**Fields:**
- `key: PaymentRecordSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `PayoutFilterAttributes`

Attributes for filtering payouts

**Fields:**
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The payout created at date to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The payout updated at date to filter by
- `arrivalDateRange: Iso8601DateTimeRangeInput` (optional) — The payout arrival date to filter by
- `status: PayoutStatus` (optional) — The payout status to filter by
- `payoutMethod: PayoutMethod` (optional) — The payout method to filter by

---

## `PayoutSortInput`

The options to sort payouts

**Fields:**
- `key: PayoutSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `PhoneFilterInput`

Attributes for filtering phone numbers

**Fields:**
- `includeSecondaryContacts: Boolean` (optional) — Whether to include phone numbers attached to secondary contacts. This filter has no effect without include_secondary_contacts set to true
- `propertyIds: [EncodedId!]` (optional) — The properties to filter phone numbers by. This filter has no effect without include_secondary_contacts set to true

---

## `PhoneNumberCreateAttributes`

Attributes of a phone number

**Fields:**
- `description: PhoneNumberDescription` (optional) — The phone type
- `number: String` (optional) — The phone number as stored
- `smsAllowed: Boolean` (optional) — Can the phone number receive text messages?
- `primary: Boolean` (optional) — Is this the primary phone number?

---

## `PhoneNumberUpdateAttributes`

Attributes for updating a phone number

**Fields:**
- `description: PhoneNumberDescription` (optional) — The phone type
- `number: String` (optional) — The phone number as stored
- `smsAllowed: Boolean` (optional) — Can the phone number receive text messages?
- `primary: Boolean` (optional) — Is this the primary phone number?
- `id: EncodedId!` (**required**) — The id of the phone number being changed.

---

## `ProductsAndServicesEditInput`

Attributes for updating a product or service

**Fields:**
- `description: String` (optional) — The description for the service or product
- `taxable: Boolean` (optional) — Whether the product or service will be taxable
- `markup: Float` (optional) — Whether the product or service will have a default markup
- `internalUnitCost: Float` (optional) — The default unit cost for the product or service
- `durationMinutes: Int` (optional) — Duration to complete the service in minutes
- `onlineBookingsEnabled: Boolean` (optional) — The product or service is also available as a bookable service
- `quantityRange: QuantityRangeInput` (optional) — Quantity range for the product or service when created through online booking
- `bookableType: SelfServeBooking` (optional) — The type of the product or service when created through online booking
- `name: String` (optional) — Name of the product or service item
- `defaultUnitCost: Float` (optional) — The default price for the service or product
- `visible: Boolean` (optional) — Whether the product or service will be visible
- `customFields: [CustomFieldEditInput!]` (optional) — List of custom fields to modify or add
- `category: ProductsAndServicesCategory` (optional) — Whether this item will be a product or a service

---

## `ProductsAndServicesInput`

Attributes for creating a product or service

**Fields:**
- `description: String` (optional) — The description for the service or product
- `taxable: Boolean` (optional) — Whether the product or service will be taxable
- `markup: Float` (optional) — Whether the product or service will have a default markup
- `internalUnitCost: Float` (optional) — The default unit cost for the product or service
- `durationMinutes: Int` (optional) — Duration to complete the service in minutes
- `onlineBookingsEnabled: Boolean` (optional) — The product or service is also available as a bookable service
- `quantityRange: QuantityRangeInput` (optional) — Quantity range for the product or service when created through online booking
- `bookableType: SelfServeBooking` (optional) — The type of the product or service when created through online booking
- `name: String!` (**required**) — Name of the product or service item
- `defaultUnitCost: Float!` (**required**) — The default price for the service or product
- `category: ProductsAndServicesCategory` (optional) — Whether this item will be a product or a service
- `customFields: [CustomFieldCreateInput!]` (optional) — List of custom fields to add

---

## `ProductsAndServicesSortInput`

The attributes to sort on products and services detail data

**Fields:**
- `key: ProductsAndServicesSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `ProductsFilterInput`

Attributes for filtering products

**Fields:**
- `category: [WorkItemCategoryTypeEnum!]` (optional) — The item's category
- `sort: ProductsAndServicesSortInput` (optional) — The sorting options
- `ids: [EncodedId!]` (optional) — The ids of the products and services to filter by

---

## `PropertiesFilterAttributes`

Attributes for filtering properties

**Fields:**
- `clientId: EncodedId` (optional) — The unique identifier of the client
- `primary: Boolean` (optional) — Filter by primary property: true = only primary, false = exclude primary, omit = all

---

## `PropertyAttributes`

Attributes of a property

**Fields:**
- `address: AddressAttributes!` (**required**) — The address of the property
- `contacts: [ContactCreateAttributes!]` (optional) — List of contacts to create and assign to the property
- `contactsToAssign: [EncodedId!]` (optional) — List of existing contacts to assign to the property
- `customFields: [CustomFieldCreateInput!]` (optional) — List of custom fields to add
- `taxRateId: EncodedId` (optional) — The unique identifier of the tax rate associated with the property
- `name: String` (optional) — The name of the property

---

## `PropertyContactFilterAttributes`

Attributes for filtering property contacts

**Fields:**
- `includeClientContacts: Boolean` (optional) — Whether to include client contacts

---

## `PropertyCreateInput`

Attributes for creating a new property

**Fields:**
- `properties: [PropertyAttributes!]` (optional) — The list of properties

---

## `PropertyEditAttributes`

Attributes for editing an existing property

**Fields:**
- `propertyId: EncodedId!` (**required**) — The ID of the property
- `customFields: [CustomFieldEditInput!]` (optional) — The custom fields for this property
- `contactsToAdd: [ContactCreateAttributes!]` (optional) — List of contacts to create and assign to the property
- `contactsToEdit: [ContactEditAttributes!]` (optional) — List of contacts to update and assign to the property
- `contactsToDelete: [EncodedId!]` (optional) — List of contacts to delete
- `contactsToAssign: [EncodedId!]` (optional) — List of existing contacts to assign to the property
- `contactsToRemove: [EncodedId!]` (optional) — List of existing contacts to unassign from the property
- `taxRateId: EncodedId` (optional) — The tax rate for this property
- `address: ClientAddressUpdateAttributes` (optional) — The address for this property
- `name: String` (optional) — The name of the property

---

## `PropertyEditInput`

Attributes for updating a property

**Fields:**
- `name: String` (optional) — The name of the property
- `address: AddressAttributes` (optional) — The address of the property
- `contactsToAdd: [ContactCreateAttributes!]` (optional) — List of contacts to create and assign to the property
- `contactsToEdit: [ContactEditAttributes!]` (optional) — List of contacts to update and assign to the property
- `contactsToDelete: [EncodedId!]` (optional) — List of contacts to delete
- `contactsToAssign: [EncodedId!]` (optional) — List of existing contacts to assign to the property
- `contactsToRemove: [EncodedId!]` (optional) — List of existing contacts to unassign from the property
- `customFields: [CustomFieldEditInput!]` (optional) — List of custom fields to modify or add
- `taxRateId: EncodedId` (optional) — The tax rate for this property

---

## `PropertyScheduledItemsFilter`

Attributes for filtering scheduled items on a property

**Fields:**
- `scheduleItemType: ScheduledItemType` (optional) — The type of scheduled item to filter by

---

## `QuantityRangeInput`

Defines the valid range of quantities for a product or service

**Fields:**
- `quantityEnabled: Boolean!` (**required**) — True if the quantity range will be used when choosing this product or service, false otherwise
- `minQuantity: Int` (optional) — The minimum quantity (inclusive) an SC can select when choosing this product or service
- `maxQuantity: Int` (optional) — The maximum quantity (inclusive) an SC can select when choosing this product or service

---

## `QuoteClientViewOptionsInput`

Input arguments for a client's view option settings for a quote

**Fields:**
- `showLineItemQty: Boolean!` (**required**) — Setting to show the client quote line item quantities
- `showLineItemUnitCosts: Boolean!` (**required**) — Setting to show the client quote line item unit costs
- `showLineItemTotalCosts: Boolean!` (**required**) — Setting to show the client quote line item total costs
- `showTotals: Boolean!` (**required**) — Setting to show the client quote totals

---

## `QuoteCreateAttributes`

Attributes for creating a new quote

**Fields:**
- `title: String` (optional) — The description of the quote
- `message: String` (optional) — The client message for the quote
- `quoteNumber: Int` (optional) — A non-unique number assigned to the quote by a Service Provider
- `contractDisclaimer: String` (optional) — The contract disclaimer for the quote
- `allowClientHubCreditCardPayments: Boolean` (optional) — Whether to allow credit card payments or not
- `allowClientHubAchPayments: Boolean` (optional) — Whether to allow ach payments or not
- `mandatoryPaymentMethodOnFile: Boolean` (optional) — Whether a mandatory payment method on file is required
- `deposit: CostModifierAttributes` (optional) — The required deposit on this quote
- `discount: CostModifierAttributes` (optional) — The discount applied to this quote
- `clientId: EncodedId!` (**required**) — The ID of the client the quote is made for
- `propertyId: EncodedId!` (**required**) — The ID of the property the quote is made for
- `requestId: EncodedId` (optional) — The ID of the request associated with the quote
- `taxRateId: EncodedId` (optional) — The tax rate on this quote
- `salespersonId: EncodedId` (optional) — The salesperson for this quote
- `processedBy: Processor` (optional) — The processor that processed the quote creation (e.g., 'Task')
- `lineItems: [QuoteCreateLineItemAttributes!]!` (**required**) — The line items associated with the quote
- `customFields: [CustomFieldCreateInput!]` (optional) — List of custom fields to add
- `clientViewOptions: QuoteClientViewOptionsInput` (optional) — The client view options for the quote
- `notes: [QuoteCreateNoteInput!]` (optional) — The notes to be added to the quote
- `transitionQuoteTo: QuoteTransitionOnCreate` (optional) — Transition the quote to this status after creation

---

## `QuoteCreateLineItemAttributes`

Attributes for creating a new line item in quotes

**Fields:**
- `name: String!` (**required**) — The name of the line item
- `description: String` (optional) — The description of the line item
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `saveToProductsAndServices: Boolean!` (**required**) — Save a copy of the new line item to products and services for future use
- `optional: Boolean` (optional) — Is the line item considered optional?
- `recommended: Boolean` (optional) — When the line item is optional, is it recommended (defaulting to chosen by the client)
- `textOnly: Boolean` (optional) — Is the line item text only?
- `unitCost: Float` (optional) — The unit cost of the line item, for margin purposes
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `productOrServiceId: EncodedId` (optional) — The unique identifier of the linked product or service

---

## `QuoteCreateNoteInput`

Attributes for creating a quote note

**Fields:**
- `message: String` (optional) — The message to be placed on the note
- `attachments: [NoteAttachmentAttributes!]` (optional) — List of attachments to be added to the note
- `pinned: Boolean` (optional) — Whether the note should be pinned
- `linkedTo: QuoteNoteLinkInput` (optional) — Which objects this quote note should be linked to

---

## `QuoteCreateTextLineItemAttributes`

Attributes for creating a new text line item in quotes

**Fields:**
- `name: String!` (**required**) — The name of the text line item
- `description: String` (optional) — The description of the text line item
- `category: ProductsAndServicesCategory` (optional) — The category of the text line item

---

## `QuoteEditAttributes`

Attributes for modifying an existing quote

**Fields:**
- `title: String` (optional) — The title of the quote
- `message: String` (optional) — The message for the client on the quote
- `contractDisclaimer: String` (optional) — The contract disclaimer for the quote
- `quoteNumber: String` (optional) — The non-unique number assigned to the quote
- `discount: CostModifierAttributes` (optional) — The discount applied to this quote. To remove the discount, set the rate to 0.
- `deposit: CostModifierAttributes` (optional) — The deposit required by this quote. To remove the deposit, set the rate to 0.
- `taxRateId: EncodedId` (optional) — The id of tax on the quote
- `customFields: [CustomFieldEditInput!]` (optional) — List of custom fields to modify or add
- `allowClientHubCreditCardPayments: Boolean` (optional) — Whether to allow credit card payments or not
- `allowClientHubAchPayments: Boolean` (optional) — Whether to allow ach payments or not
- `mandatoryPaymentMethodOnFile: Boolean` (optional) — Whether a mandatory payment method on file is required
- `clientViewOptions: QuoteClientViewOptionsInput` (optional) — The client view options for the quote
- `salespersonId: EncodedId` (optional) — The salesperson for this quote
- `sentAt: ISO8601DateTime` (optional) — The date and time the quote was last sent

---

## `QuoteEditLineItemAttributes`

Attributes for modifying an existing line items on an existing quote

**Fields:**
- `lineItemId: EncodedId!` (**required**) — The unique identifier of the line item
- `name: String` (optional) — The name of the line item
- `description: String` (optional) — The description of the line item
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `sortOrder: Int` (optional) — The order of the line item
- `unitCost: Float` (optional) — The unit cost of the line item.
- `optional: Boolean` (optional) — Is the line item considered optional?
- `recommended: Boolean` (optional) — When the line item is optional, is it recommended (defaulting to chosen by the client)
- `image: FileAttachmentAttributes` (optional) — The attached image to be added to the line item
- `productOrServiceId: EncodedId` (optional) — The unique identifier of the linked product or service

---

## `QuoteEditNoteInput`

Attributes for editing an existing quote note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `linkedTo: QuoteNoteLinkInput` (optional) — Which objects this note should be linked to
- `message: String` (optional) — The new message to place on the note
- `attachmentsToAdd: [NoteAttachmentAttributes!]` (optional) — List of attachments to append to the note
- `attachmentsToDelete: [EncodedId!]` (optional) — List of attachments to delete from the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `QuoteFilterAttributes`

Attributes for filtering quotes

**Fields:**
- `clientId: EncodedId` (optional) — The encoded id of the client to filter by
- `quoteNumber: IntRangeInput` (optional) — The quote number to filter by
- `status: QuoteStatusTypeEnum` (optional) — The quote status to filter by
- `cost: FloatRangeInput` (optional) — The quote cost to filter by
- `sentAt: Iso8601DateTimeRangeInput` (optional) — The quote sent at date to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The quote updated at date to filter by
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The quote created at date to filter by
- `salespersonId: EncodedId` (optional) — The encoded id of the salesperson to filter by

---

## `QuoteJobsSortInput`

The input arguments used to sort QuoteJobs

**Fields:**
- `key: QuoteJobsSortKey!` (**required**) — The field to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `QuoteLineItemFilterAttributes`

Filter options for Quote line items

**Fields:**
- `approved: Boolean` (optional) — The line items that are marked as required or optional and selected

---

## `QuoteNoteLinkInput`

Attributes for linking quote notes

**Fields:**
- `invoices: Boolean` (optional) — Whether the note should be linked to related invoices
- `jobs: Boolean` (optional) — Whether the note should be linked to related jobs

---

## `QuotesSortInput`

The attributes to sort on a collection of quotes

**Fields:**
- `key: QuotesSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `RequestCreateInput`

Input for creating a new request

**Fields:**
- `clientId: EncodedId!` (**required**) — The ID of the client associated with the request
- `propertyId: EncodedId` (optional) — The ID of the property of the client, will default to last property is not selected
- `assessment: AssessmentCreateInput` (optional) — The inputs for creating assessment
- `referringClientId: EncodedId` (optional) — The client that referred this work request, if this work request was referred
- `requestDetails: RequestDetailsInput` (optional) — Details for the new request, only to be provided by external apps
- `lineItems: [RequestCreateLineItemAttributes!]` (optional) — The attributes for creating line items
- `formIds: [EncodedId!]` (optional) — The form template ids to attach to the request
- `title: String` (optional) — The title of the request
- `salespersonId: EncodedId` (optional) — The salesperson for this request

---

## `RequestCreateLineItemAttributes`

Attributes for creating a new line item on a request

**Fields:**
- `name: String!` (**required**) — The name of the line item
- `description: String` (optional) — The description of the line item
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `saveToProductsAndServices: Boolean!` (**required**) — Save a copy of the new line item to products and services for future use
- `unitCost: Float` (optional) — The unit cost of the line item
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `productOrServiceId: EncodedId` (optional) — The unique identifier of the linked product or service
- `sortOrder: Int` (optional) — The sort order of the line item

---

## `RequestCreateNoteInput`

Attributes for creating request notes

**Fields:**
- `message: String` (optional) — The message to be placed on the note
- `attachments: [NoteAttachmentAttributes!]` (optional) — List of attachments to be added to the note
- `pinned: Boolean` (optional) — Whether the note should be pinned
- `linkedTo: RequestNoteLinkInput` (optional) — Which objects this request note should be linked to

---

## `RequestDetailsInput`

Input for request details

**Fields:**
- `form: FormInput!` (**required**) — Form containing details

---

## `RequestEditInput`

Attributes for modifying an existing work request

**Fields:**
- `title: String` (optional) — The title of the request
- `referringClientId: EncodedId` (optional) — The client that referred this work request, if this work request was referred
- `propertyId: EncodedId` (optional) — The property of the request, must belong to the same client as the request
- `salespersonId: EncodedId` (optional) — The salesperson for this request

---

## `RequestEditLineItemAttributes`

Attributes for modifying an existing line item on a request

**Fields:**
- `lineItemId: EncodedId!` (**required**) — The unique identifier of the line item
- `name: String` (optional) — The name of the line item
- `description: String` (optional) — The description of the line item
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item
- `taxable: Boolean` (optional) — Is the line item taxable
- `category: ProductsAndServicesCategory` (optional) — The category of the line item
- `sortOrder: Int` (optional) — The order of the line item
- `unitCost: Float` (optional) — The unit cost of the line item
- `image: FileAttachmentAttributes` (optional) — The attached image to be added to the line item
- `productOrServiceId: EncodedId` (optional) — The unique identifier of the linked product or service

---

## `RequestEditNoteInput`

Attributes for editing an existing request note

**Fields:**
- `noteId: EncodedId!` (**required**) — The unique identifier of the note
- `linkedTo: RequestNoteLinkInput` (optional) — Which objects this note should be linked to
- `message: String` (optional) — The new message to place on the note
- `attachmentsToAdd: [NoteAttachmentAttributes!]` (optional) — List of attachments to append to the note
- `attachmentsToDelete: [EncodedId!]` (optional) — List of attachments to delete from the note
- `pinned: Boolean` (optional) — Whether the note should be pinned

---

## `RequestFilterAttributes`

Attributes for filtering requests

**Fields:**
- `clientId: EncodedId` (optional) — The encoded id of the client to filter by
- `propertyId: EncodedId` (optional) — The encoded id of the property to filter by
- `status: RequestStatusTypeEnum` (optional) — The status of the request to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The request updated at date to filter by
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The request updated at date to filter by

---

## `RequestNoteLinkInput`

Attributes for linking request notes

**Fields:**
- `invoices: Boolean` (optional) — Whether the note should be linked to related invoices
- `jobs: Boolean` (optional) — Whether the note should be linked to related jobs
- `quotes: Boolean` (optional) — Whether the note should be linked to related quotes

---

## `RequestSettingsFilterAttributes`

Attributes for filtering request settings

**Fields:**
- `bookingEnabled: Boolean` (optional) — Filter to only include bookable request settings

---

## `RequestedWorkObjectsFilterAttributes`

Attributes for filtering requested work objects

**Fields:**
- `types: [WorkObject!]!` (**required**) — The work object types to filter by (Request, Quote, Job, Invoice, Treatment)
- `propertyIds: [EncodedId!]` (optional) — The encoded ids of the properties to filter by

---

## `RequestedWorkObjectsSortAttributes`

Attributes for sorting requested work objects

**Fields:**
- `key: RequestedWorkObjectsSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `RequestsSortInput`

The attributes to sort on a collection of Requests

**Fields:**
- `key: RequestsSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `ScheduledItemAttributes`

Attributes for creating a scheduled item

**Fields:**
- `notifyTeam: Boolean` (optional) — Notify the assigned team
- `teamReminderOffset: Minutes` (optional) — Offset in minutes from the time of the task to notify the team
- `startAt: LocalDateTimeAttributes` (optional) — The scheduled start time
- `endAt: LocalDateTimeAttributes` (optional) — The scheduled end time
- `teamMemberIdsToAssign: [EncodedId!]` (optional) — Ids of the assigned team members

---

## `ScheduledItemsFilterAttributes`

Attributes for filtering scheduled items

**Fields:**
- `scheduleItemType: ScheduledItemType` (optional) — The type of scheduled item (Basic Tasks, Visits, Events, Assessments, Quote Reminders, and Invoice Reminders) to filter by
- `status: ScheduledItemStatus` (optional) — The status of the scheduled item to filter by
- `assignedTo: [EncodedId!]` (optional) — Filter appointments assigned to the provided user ids if the user is authorized to view appointments assigned to others
- `includeUnassigned: Boolean` (optional) (default: `false`) — Include unassigned appointments in the result if the user is authorized to view appointments assigned to others
- `includeUnscheduled: Boolean` (optional) (default: `false`) — Include unscheduled appointments in the result
- `occursWithin: DateRange!` (**required**) — Filter scheduled items that occur within the provided time range. Items with schedules overlapping with the time range are also included. Supports an endDate of up to 1.5 years after the startDate.
- `schedulingAspects: [SchedulingAspect!]` (optional) (default: `[]`) — Controls the scope of returned scheduled items. When omitted, results are limited to items assigned to the authenticated user. Provide values to broaden scope to other users, unassigned items, and/or unscheduled items if the user is authorized to do so.

---

## `ScheduledItemsSortInput`

The attributes to sort scheduled items. If not provided, the items will be sorted by startAt in ascending order.

**Fields:**
- `key: ScheduledItemsSortKey!` (**required**) — The field to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `SignatureInput`

Input for creating a signature

**Fields:**
- `rawImage: String!` (**required**) — raw base64 encoded string of the signature image

---

## `SourceAttributionAttributes`

Attributes for updating source attribution.

**Fields:**
- `sourceText: String` (optional) — The source of the object in plain text, not required if there is an associated object

---

## `TaskCreateInput`

Input for creating a new task

**Fields:**
- `title: String!` (**required**) — Title of the task
- `instructions: String` (optional) — A note to describe the task
- `startAt: ISO8601DateTime` (optional) — When the task starts
- `endAt: ISO8601DateTime` (optional) — When the task ends
- `allDay: Boolean` (optional) — Indicates whether this is an all day task
- `assignedTo: [EncodedId!]` (optional) — List of users/employees assigned to the task
- `emailAssignments: Boolean` (optional) — Whether the assigned Users are emailed about this task
- `teamReminderOffset: Minutes` (optional) — Offset in minutes from the time of the task to notify the team
- `recurrenceRule: ICalendarRule` (optional) — The ICalendarRecurrenceRule that will be used for scheduling tasks

---

## `TaskEditInput`

Attributes for updating a task

**Fields:**
- `title: String` (optional) — The title of the task
- `instructions: String` (optional) — A note to describe the task
- `startAt: ISO8601DateTime` (optional) — Start date and time of the task
- `endAt: ISO8601DateTime` (optional) — End date and time of the task
- `allDay: Boolean` (optional) — Indicates whether the task is for a full day
- `assignedTo: [EncodedId!]` (optional) — List of users assigned to the task
- `emailAssignments: Boolean` (optional) — Whether the assigned Users are emailed about this task
- `teamReminderOffset: Minutes` (optional) — Offset in minutes from the time of the task to notify the team
- `clientId: EncodedId` (optional) — The unique identifier of the client to attach to this task
- `propertyId: EncodedId` (optional) — The unique identifier of the property to attach to this task
- `recurrenceRule: ICalendarRule` (optional) — The ICalendarRecurrenceRule that will be used for scheduling tasks
- `editFutureRecurring: Boolean` (optional) (default: `false`) — Whether to edit all future instances of a recurring task, or just the given task

---

## `TaskFilterAttributes`

Filter options for Tasks

**Fields:**
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The created date filter by
- `startAt: Iso8601DateTimeRangeInput` (optional) — The start date filter by
- `endAt: Iso8601DateTimeRangeInput` (optional) — The end date filter by
- `assignedTo: EncodedId` (optional) — The Encoded ID of the assigned user to filter on. If omitted, tasks assigned to all users will be returned
- `completedAt: Iso8601DateTimeRangeInput` (optional) — The completed date filter by
- `ids: [EncodedId!]` (optional) — The IDs of the tasks to filter by

---

## `TaskSortInput`

The attributes to sort on a collection of tasks

**Fields:**
- `key: TaskSortableFields!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `TaxCreateInput`

Input for creating a new tax

**Fields:**
- `name: String!` (**required**) — Tax name
- `rate: Float!` (**required**) — Tax rate
- `internalDescription: String` (optional) — Tax internal description
- `defaultTax: Boolean` (optional) — Make this tax the default for quotes and invoices

---

## `TaxGroupCreateInput`

Input for creating a new tax group

**Fields:**
- `name: String!` (**required**) — Tax group name
- `taxRateIds: [EncodedId!]!` (**required**) — Existing tax rates to add to the tax group
- `internalDescription: String` (optional) — Tax group internal description

---

## `TaxInputType`

The tax related inputs associated with an invoice

**Fields:**
- `taxRateId: EncodedId` (optional) — The tax id on the invoice
- `taxCalculationMethod: TaxCalculationMethodType!` (**required**) — The tax calculation method of the invoice

---

## `TimeSheetEntriesFilterAttributes`

Attributes for filtering scheduled items

**Fields:**
- `activeOnDate: ISO8601DateTime` (optional) — Timesheet entries that start after the date, end before the following day or were started on a previous day and were running on the given date
- `assignedTo: EncodedId` (optional) — ID of the user to whom the time sheet entry belongs to
- `isApproved: Boolean` (optional) — Include time sheet entries that have been approved
- `ticking: Boolean` (optional) — Include time sheet entries based on whether a timer is running
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The timesheet created at date to filter by
- `updatedAt: Iso8601DateTimeRangeInput` (optional) — The timesheet updated at date to filter by
- `currentUserOnly: Boolean` (optional) — Show timesheet entries for the current user only
- `startAt: Iso8601DateTimeRangeInput` (optional) — The timesheet start at date to filter by

---

## `TimeSheetEntriesSortAttributes`

The attributes to sort on a client's notes

**Fields:**
- `field: TimeSheetEntriesSortableFieldsEnum!` (**required**) — The field to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `TimeSheetEntryGroupsFilterAttributes`

Filter attributes for time sheet entry groups

**Fields:**
- `userId: EncodedId!` (**required**) — The user ID to get entry groups for
- `startDate: ISO8601Date!` (**required**) — Inclusive start date for the time sheet range
- `endDate: ISO8601Date!` (**required**) — Inclusive end date for the time sheet range
- `jobIds: [EncodedId!]` (optional) — Optional list of job IDs to restrict the groups to

---

## `TimeframeAttributes`

The start date and duration of the job

**Fields:**
- `startAt: ISO8601Date` (optional) — The starting date
- `durationUnits: DurationUnit` (optional) — The unit of duration
- `durationValue: Int` (optional) — The amount of durationUnits it lasts

---

## `UpdateFutureVisitsInput`

Input for updating future visits for a job

**Fields:**
- `visitId: EncodedId!` (**required**) — The ID of the reference visit
- `copyOptions: UpdateFutureVisitsOptionsInput` (optional) — Options for what to copy from the reference visit
- `dispatchRecurrenceRule: ICalendarRule` (optional) — The recurrence rule used for dispatching/scheduling new visits. If not provided, existing visit dates are kept.

---

## `UpdateFutureVisitsOptionsInput`

Options for what to copy from the reference visit when updating future visits

**Fields:**
- `time: Boolean` (optional) (default: `false`) — Whether to copy time settings from the reference visit
- `assignment: Boolean` (optional) (default: `false`) — Whether to copy assignment from the reference visit
- `override: Boolean` (optional) (default: `false`) — Whether to copy quantity overrides from the reference visit

---

## `UserEditInput`

Attributes for updating a user

**Fields:**
- `name: String` (optional) — The full name of the user

---

## `UserPermissionFilterAttributes`

Attributes for filtering by a user's permission levels

**Fields:**
- `area: PermissionAreaFilterEnum` (optional) — The permission area of Jobber.
- `level: PermissionLevelFilterEnum` (optional) — The level of permission granted.

---

## `UsersFilterAttributes`

Filter options for users.

**Fields:**
- `status: UsersStatusFilterEnum!` (**required**) — Status to filter on
- `permissions: UserPermissionFilterAttributes` (optional) — The permission levels granted for the user for different features
- `userIds: [EncodedId!]` (optional) — The user ids to filter by

---

## `UsersSortInput`

The attributes to sort on a collection of users

**Fields:**
- `key: UsersSortKey!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `VehicleCreateInput`

Attributes for creating a new vehicle

**Fields:**
- `licensePlate: String` (optional) — The license plate of the vehicle
- `name: String!` (**required**) — The name of the vehicle
- `iconColor: Color` (optional) — The color of the vehicle icon
- `vin: String` (optional) — The VIN of the vehicle
- `make: String!` (**required**) — The make of the vehicle
- `model: String!` (**required**) — The model of the vehicle
- `year: Int!` (**required**) — The year of the vehicle
- `externalUrl: Url` (optional) — The external URL to view in App of the vehicle

---

## `VehicleUpdateInput`

Attributes for updating an existing vehicle

**Fields:**
- `id: EncodedId!` (**required**) — The id of the vehicle
- `licensePlate: String` (optional) — The license plate of the vehicle
- `name: String` (optional) — The name of the vehicle
- `iconColor: Color` (optional) — The color of the vehicle icon
- `vin: String` (optional) — The VIN of the vehicle
- `make: String` (optional) — The make of the vehicle
- `model: String` (optional) — The model of the vehicle
- `year: Int` (optional) — The year of the vehicle
- `externalUrl: Url` (optional) — The external URL to view in App of the vehicle
- `assignedUserIds: [EncodedId!]` (optional) — The ids of the users assigned to the vehicle
- `liveState: LiveStateInput` (optional) — The live state of the vehicle

---

## `VisitCompleteInput`

Input for completing a visit

**Fields:**
- `completedAt: ISO8601DateTime` (optional) — The date and time when the visit was completed. Defaults to current time if not provided.

---

## `VisitCreateAttributes`

Attributes for creating a visit

**Fields:**
- `title: String` (optional) — The visit title
- `instructions: String` (optional) — The visit instructions
- `overrideOrder: Int` (optional) — An override for ordering anytime and unscheduled items
- `schedule: ScheduledItemAttributes` (optional) — The schedule for the visit

---

## `VisitCreateInput`

Inputs for creating visits for a job

**Fields:**
- `visits: [VisitCreateAttributes!]!` (**required**) — The attributes of the visits to create

---

## `VisitCreateLineItemAttributes`

Attributes for creating a new line item in visits

**Fields:**
- `name: String!` (**required**) — The name of the line item
- `description: String` (optional) — The description of the line item
- `category: ProductsAndServicesCategory` (optional) — The category of the line item. Defaults to Service.
- `unitPrice: Float!` (**required**) — The unit price of the line item
- `quantity: Float!` (**required**) — The quantity of the line item
- `taxable: Boolean` (optional) — Is the line item taxable. Defaults to true.
- `saveToProductsAndServices: Boolean!` (**required**) — Save a copy of the new line item to products and services for future use

---

## `VisitCreateLineItemInput`

Input for creating new line items in visits

**Fields:**
- `lineItems: [VisitCreateLineItemAttributes!]!` (**required**) — The line items to create

---

## `VisitDeleteLineItemsInput`

Input for deleting line items on visits

**Fields:**
- `lineItemIds: [EncodedId!]!` (**required**) — The line items to delete

---

## `VisitEditAssignedUsersInput`

Input for updating assigned to an existing visit

**Fields:**
- `assignedUserIds: [EncodedId!]!` (**required**) — The ids to the new assigned user for an existing visit

---

## `VisitEditAttributes`

Attributes for updating a visit

**Fields:**
- `instructions: String` (optional) — The instructions for the visit
- `title: String` (optional) — The title of the visit

---

## `VisitEditLineItemAttributes`

Attributes for modifying an existing line item in visits

**Fields:**
- `lineItemId: EncodedId!` (**required**) — The unique identifier of the line item
- `name: String` (optional) — The name of the line item
- `description: String` (optional) — The description of the line item
- `unitPrice: Float` (optional) — The unit price of the line item
- `quantity: Float` (optional) — The quantity of the line item

---

## `VisitEditLineItemsInput`

Input for editing new line items in visits

**Fields:**
- `lineItems: [VisitEditLineItemAttributes!]!` (**required**) — The line items to modify

---

## `VisitEditScheduleInput`

Input for updating schedule of an existing visit

**Fields:**
- `startAt: LocalDateTimeAttributes` (optional) — The new start date of the visit
- `endAt: LocalDateTimeAttributes` (optional) — The new end date of the visit

---

## `VisitFilterAttributes`

Filter options for Visit Statuses

**Fields:**
- `status: VisitStatusTypeEnum` (optional) — Filters by visit status
- `createdAt: Iso8601DateTimeRangeInput` (optional) — The created date filter by
- `startAt: Iso8601DateTimeRangeInput` (optional) — The start date filter by
- `endAt: Iso8601DateTimeRangeInput` (optional) — The end date filter by
- `completedAt: Iso8601DateTimeRangeInput` (optional) — The completed date filter by
- `invoiceStatus: VisitInvoiceStatus` (optional) — The invoice status filter by
- `onlyRelevantToBillingPeriod: Boolean` (optional) — Only shows most relevant visits to the billing period for jobs with visit based billing
- `assignedTo: EncodedId` (optional) — The Encoded ID of the assigned user to filter on. If omitted, visits assigned to all users will be returned
- `productOrServiceId: EncodedId` (optional) — The line item associated with a specific product or service to filter by
- `ids: [EncodedId!]` (optional) — The ids of the visit to filter by

---

## `VisitsSortInput`

The attributes to sort on a collection of visits

**Fields:**
- `key: VisitsSortableFields!` (**required**) — The key to sort on
- `direction: SortDirectionEnum!` (**required**) — The direction of the sort

---

## `WebhookEndpointCreateInput`

Input for creating a new webhook endpoint

**Fields:**
- `topic: WebHookTopicEnum!` (**required**) — The topic of the webhook subscription
- `url: String!` (**required**) — URL to be notified at when an event for the topic occurs

---

## `WorkObjectsFilterAttributes`

Attributes for filtering work objects

**Fields:**
- `types: [WorkObject!]` (optional) — The work object types to filter by (Request, Quote, Job, Invoice)
- `propertyIds: [EncodedId!]` (optional) — The encoded ids of the properties to filter by

---
