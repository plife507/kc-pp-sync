# Jobber GraphQL — Enums Reference
Total: 85 enum types
---

## `BalanceTransaction`

**Values:**
- `INSTANT_PAYOUT` — The Balance Transaction is of type Instant Payout
- `INSTANT_PAYOUT_FEE` — The Balance Transaction is of type Instant Payout Fee
- `PAYMENT` — The Balance Transaction is of type Payment
- `DEPOSIT` — The Balance Transaction is of type Deposit
- `DISPUTE` — The Balance Transaction is of type Deposit
- `REFUND` — The Balance Transaction is of type Refund
- `REFUND_FEE` — The Balance Transaction is of type Refund Fee
- `WON_DISPUTE` — The Balance Transaction is of type Won Dispute
- `FEE_ADJUSTMENT` — The Balance Transaction is of type Fee Adjustment
- `FINANCING_PAYOUT` — The Balance Transaction is of type Financing Payout
- `FINANCING_REPAYMENT` — The Balance Transaction is of type Financing Repayment
- `RESERVED_FUNDS` — The Balance Transaction is of type Reserved Funds
- `ADVANCE_FUNDING` — The Balance Transaction is of type Advance Funding
- `ADVANCE` — The Balance Transaction is of type Advance
- `LIEN_PAYMENT` — The Balance Transaction is of type Lien Payment
- `UNKNOWN` — The Balance Transaction is of type Unknown

---

## `BillingFrequencyEnum`

**Values:**
- `ON_COMPLETION` — Invoice the client when the job is complete
- `PERIODIC` — Invoice the client periodically based on rules
- `PER_VISIT` — Invoice the client on each visit
- `NEVER` — Never invoice the client automatically

---

## `BillingStrategy`

**Values:**
- `FIXED_PRICE` — Each invoice is for a set amount
- `VISIT_BASED` — Invoices include all the billable work on completed visits

---

## `BookingType`

The type of booking this form creates when it's submitted

**Values:**
- `NONE` — No booking; form creates a request only
- `JOB` — Form creates a job when submitted
- `ASSESSMENT` — Form creates a request with an assessment when submitted

---

## `CapitalLoanAcceptanceSource`

**Values:**
- `EMAIL` — Accepted the capital loan via e-mail
- `JOBBER_ONLINE` — Accepted the capital loan via Jobber Online

---

## `CapitalLoanStatus`

**Values:**
- `UNDELIVERED` — Offer has not been delivered to the connected account
- `ACCEPTED` — Offer has been accepted by the connected account
- `DELIVERED` — Offer has been delivered
- `FULLY_REPAID` — The offer had been repaid in full
- `PAID_OUT` — The offer has been paid out to the connected account
- `EXPIRED` — Offer has expired
- `CANCELLED` — Offer has canceled by the connected account after being accepted
- `REPLACED` — Offer has been replaced by a new offer

---

## `ClientSearchField`

Fields that can be included in a client search

**Values:**
- `NAMES` — Include client names (first_name, last_name, company_name) in search
- `EMAILS` — Include client email addresses in search
- `PRIMARY_EMAIL` — Include primary email address in search
- `PHONES` — Include client phone numbers in search
- `NOTES` — Include client notes in search
- `CUSTOM_FIELDS` — Include client custom field values in search
- `PROPERTIES` — Include client property addresses in search

---

## `ClientTitle`

**Values:**
- `MR` — The client is addressed as Mr.
- `MS` — The client is addressed as Ms.
- `MRS` — The client is addressed as Mrs.
- `MISS` — The client is addressed as Miss
- `DR` — The client is addressed as Dr.

---

## `ClientsSortKey`

The fields, or associated fields, on a collection of Clients which support sorting functionality

**Values:**
- `PRIMARY_NAME` — The field which indicates the primary name of the Client
- `UPDATED_AT` — The field which indicates when the Client was last updated at
- `FIRST_NAME` — The field which indicates the first name of the Client
- `LAST_NAME` — The field which indicates the last name of the Client

---

## `ContactsSortKey`

The fields, or associated fields, on a collection of Contacts which support sorting functionality

**Values:**
- `UPDATED_AT` — The field which indicates when the Contact was last updated at
- `FIRST_NAME` — The field which indicates the first name of the Contact
- `LAST_NAME` — The field which indicates the last name of the Contact

---

## `CostModifierTypeEnum`

**Values:**
- `Percent` — The cost modifier applies a percentage of the initial value
- `Unit` — The cost modifier applies a fixed amount to the initial value

---

## `CustomFieldAppliesTo`

**Values:**
- `ALL_PROPERTIES` — Attach custom field to all properties on account
- `ALL_CLIENTS` — Attach custom field to all clients on account
- `ALL_QUOTES` — Attach custom field to all quotes on account
- `ALL_JOBS` — Attach custom field to all jobs on account
- `ALL_INVOICES` — Attach custom field to all invoices on account
- `ALL_PRODUCTS_AND_SERVICES` — Attach custom field to all product or services on account
- `TEAM` — Attach custom field to a team

---

## `CustomFieldConfigurationValueType`

**Values:**
- `TEXT` — The value type for a text custom field configuration
- `LINK` — The value type for a link custom field configuration
- `AREA` — The value type for an area custom field configuration
- `TRUE_FALSE` — The value type for a true false custom field configuration
- `NUMERIC` — The value type for an numeric custom field configuration
- `DROPDOWN` — The value type for a dropdown custom field configuration

---

## `CustomFieldConfigurationsSortKey`

The fields, or associated fields, on a collection of custom field configurations which support sorting functionality

**Values:**
- `SORT_ORDER` — Sort by the position of the custom field configurations
- `CREATED_AT` — The field which indicates when the CustomFieldConfiguration was created

---

## `DevicePlatform`

The device platform for terminal payments

**Values:**
- `ANDROID` — Android device platform
- `IOS` — iOS device platform

---

## `DurationUnit`

The unit to calculate the duration

**Values:**
- `DAYS` — Days
- `WEEKS` — Weeks
- `MONTHS` — Months
- `YEARS` — Years

---

## `EfficientSchedulingType`

How to handle buffer time between appointments

**Values:**
- `NONE` — No time restrictions
- `BUFFER_TIME` — Use a fixed buffer time between appointments
- `DRIVE_TIME` — Use a buffer time based on a client's location and the drive time to their location from other appointments

---

## `EmailDescription`

**Values:**
- `MAIN` — The email is of type Main
- `WORK` — The email is of type Work
- `PERSONAL` — The email is of type Personal
- `OTHER` — The email is of type Other

---

## `EmailTypes`

The types of emails that we can currently accept

**Values:**
- `INVOICE_SENT`
- `BALANCE_ADJUSTMENT_RECEIPT_SENT`
- `QUOTE_SENT`
- `JOB_FORM_SENT`
- `JOB_FORM_SUBMISSION_SENT`
- `JOB_BOOKING_CONFIRMATION`
- `FOLLOW_UP_SENT`
- `ASSESSMENT_BOOKED`
- `CLIENT`
- `REQUEST_CARD_ON_FILE`
- `SIGNED_DOCUMENT_SENT`
- `STATEMENT_SENT`
- `VISIT_REMINDER`
- `ASSESSMENT_REMINDER`
- `CLIENT_HUB_LOGIN_LINK`

---

## `ExpensesSortKey`

The fields on a collection of expenses which support sorting functionality

**Values:**
- `CREATED_AT` — The field which indicates when the expense was created at
- `UPDATED_AT` — The field which indicates when the expense was last updated at
- `DATE` — The field which indicates the date the expense was filed for

---

## `GeoStatus`

The status of geo-locating the coordinates for an address

**Values:**
- `NOT_STARTED` — Not started
- `PROCESSING` — Processing
- `FOUND` — Found
- `NOT_FOUND` — Not found
- `MANUAL_OVERRIDE` — Manual override
- `FOUND_ALTERNATE` — Found alternate

---

## `IncomeAdjustmentType`

**Values:**
- `INVOICE` — Is an invoice
- `REFUND` — Is a refund
- `CORRECTION` — Is a correction
- `INITIAL_BALANCE` — Is an initial balance
- `FAILED_ACH_PAYMENT` — Is a failed ACH payment
- `PAYMENT` — Is a payment
- `DEPOSIT` — Is a deposit
- `BAD_DEBT` — Represents the amount that has been marked bad debt

---

## `IncompleteVisitDecisionEnum`

**Values:**
- `DESTROY_ALL` — destroy all incomplete visits from the job
- `COMPLETE_PAST_DESTROY_FUTURE` — complete all past incomplete visits up to those due by the end of the current day, destroy all incomplete future visits

---

## `Industry`

**Values:**
- `APPLIANCE_REPAIR` — Appliance Repair
- `ARBORIST_TREE_CARE` — Arborist / Tree Care
- `BIN_CLEANING` — Bin Cleaning
- `CARPET_CLEANING` — Carpet Cleaning
- `COMMERCIAL_CLEANING` — Commercial Cleaning
- `COMPUTERS_IT` — Computers & IT
- `CONSTRUCTION_CONTRACTING` — Construction & Contracting
- `ELECTRICAL_CONTRACTOR` — Electrical Contractor
- `FLOORING_SERVICE` — Flooring Service
- `HANDYMAN` — Handyman
- `HOME_THEATER` — Home Theater
- `HVAC` — HVAC
- `JUNK_REMOVAL` — Junk Removal
- `LANDSCAPING_CONTRACTOR` — Landscaping Contractor
- `LAWN_CARE_LAWN_MAINTENANCE` — Lawn Care & Lawn Maintenance
- `LOCKSMITH` — Locksmith
- `MECHANICAL_SERVICE` — Mechanical Service
- `OTHER` — Other
- `PAINTING` — Painting
- `PEST_CONTROL` — Pest Control
- `PLUMBING` — Plumbing
- `POOL_AND_SPA_SERVICE` — Pool and Spa Service
- `PRESSURE_WASHING_SERVICE` — Pressure Washing Service
- `RENOVATIONS` — Renovations
- `RESIDENTIAL_CLEANING` — Residential Cleaning
- `ROOFING_SERVICE` — Roofing Service
- `SECURITY_AND_ALARM` — Security and Alarm
- `SNOW_REMOVAL` — Snow Removal
- `WINDOW_WASHING` — Window Washing

---

## `InvoiceCloseOptionsType`

Options for closing an invoice

**Values:**
- `BAD_DEBT` — Mark the invoice as bad debt
- `MARK_RECEIVED` — Mark the invoice as received without recording a payment

---

## `InvoiceOrigin`

**Values:**
- `NEW_MOBILE`
- `NEW_JOBBER_ONLINE`
- `JOB_CLOSE_MOBILE`
- `JOB_CLOSE_JOBBER_ONLINE`
- `VISIT_CLOSE_MOBILE`
- `VISIT_CLOSE_JOBBER_ONLINE`
- `BATCH_INVOICE`
- `AUTOMATIC_PAYMENT`
- `WISETACK`
- `QUOTE_CONVERT_MOBILE`
- `MODULAR_ONBOARDING_MOBILE`
- `INTEGRATIONS`
- `IMPORT`

---

## `InvoiceSortKey`

The fields, or associated fields, on a collection of invoices which support sorting functionality

**Values:**
- `INVOICE_NUMBER` — The field which shows the invoice number
- `INVOICE_STATUS` — The field which shows the invoice status
- `CLIENT_PRIMARY_NAME` — The field which shows the client last name or company name associated to the invoice
- `CLIENT_FIRST_NAME` — The field which shows the client first name associated to the invoice
- `CLIENT_LAST_NAME` — The field which shows the client last name associated to the invoice
- `CREATED_AT` — The field which shows the date the invoice was created
- `UPDATED_AT` — The field which shows the date the invoice was last updated
- `ISSUED_DATE` — The field which shows the date the invoice was issued
- `RECEIVED_DATE` — The field which shows the date the invoice was marked paid
- `DUE_DATE` — The field which shows the date the invoice is due
- `INVOICE_TIP_TOTAL` — The field which shows the total tips paid to the invoice
- `INVOICE_TOTAL` — The field which shows the total of the invoice
- `INVOICE_BALANCE` — The field which shows the outstanding balance of the invoice
- `INVOICE_TAX_PERCENT` — The field which shows the tax percent of the invoice
- `INVOICE_TAX_AMOUNT` — The field which shows the tax amount of the invoice
- `INVOICE_DEPOSIT_AMOUNT` — The field which shows the deposit amount paid to the invoice
- `INVOICE_DISCOUNT_AMOUNT` — The field which shows the discount amount on the invoice
- `INVOICE_STATUS_AND_DUE_DATE_AND_NUMBER` — The field which shows the invoice status

---

## `InvoiceStatusTypeEnum`

**Values:**
- `draft` — draft
- `awaiting_payment` — awaiting_payment
- `paid` — paid
- `past_due` — past_due
- `bad_debt` — bad_debt
- `sent_not_due` — Status for invoices that are awaiting payment but are not yet due.

---

## `JobSortKey`

The fields, or associated fields, on a collection of jobs which support sorting functionality

**Values:**
- `CLIENT_FIRST_NAME` — The field which shows the client first name associated to the job
- `CLIENT_PRIMARY_NAME` — The field which shows the client primary name
- `UPDATED_AT` — The field which indicates when the job was last updated at
- `JOB_NUMBER` — The field which shows the job number
- `TOTAL_COST` — The field which indicates the total cost
- `JOB_STATUS` — The field which indicates the job status
- `SCHEDULE` — The next visit date of the job
- `VISIT_START_DATE` — The most recent visit start date for the job

---

## `JobStatusTypeEnum`

**Values:**
- `requires_invoicing` — Jobs that are in requires invoicing status have an overdue invoice reminder. This is a prompt to create an invoice for this job.
- `archived` — These are closed jobs that no longer need to be invoiced. These are the jobs that you are done with.
- `late` — Active jobs with a visit pass but was not marked complete.
- `today` — Active jobs with a visit today.
- `upcoming` — Active jobs with a visit in the future (after today).
- `action_required` — These are jobs that are still active, but they have no more upcoming visits. You can think of action required like being 'on hold'. Action required is a prompt to either schedule more visits or close the job.
- `on_hold` —  These are jobs that are still active, but they have no more upcoming visits. You can think of action required like being 'action required'. On hold is a prompt to either schedule more visits or close the job. (alias for action_required)
- `unscheduled` — These are jobs that have visits created, but the visits have been set up to be scheduled later.
- `active` — Active jobs are the jobs in progress (the job is not closed). This includes other statuses (late, today, upcoming, ...).
- `expiring_within_30_days` — Active jobs that are expiring within 30 days.

---

## `JobTypeTypeEnum`

**Values:**
- `ONE_OFF` — A one-off job
- `RECURRING` — A job with a recurring schedule

---

## `JobberPaymentTransactionStatus`

**Values:**
- `IN_DISPUTE` — Payment is in dispute
- `PENDING` — Payment is pending
- `REFUNDED` — Payment has been refunded
- `PARTIALLY_REFUNDED` — Payment has been partially refunded
- `FAILED` — Payment has failed
- `DISPUTED` — Payment has been disputed
- `SUCCEEDED` — Payment has processed successfully

---

## `NoteAttachmentsSortableFieldsEnum`

The fields on note attachments which support sorting functionality

**Values:**
- `CREATED_AT` — Sort by the created at date
- `WORKFLOW_ORDER` — Sort by the workflow object order (Client, Request, Quote, Job, Invoice)

---

## `NoteFileStatusEnum`

**Values:**
- `PROCESSING` — The note file is being processed
- `READY` — The note file is has processed and is available

---

## `NotesSortableFields`

The fields on a collection of notes which support sorting functionality

**Values:**
- `CREATED_AT` — The field which indicates when the note was created at

---

## `PaymentMethodSource`

Vault origins available for saved jobber payment cards

**Values:**
- `CREDIT_CARD` — A credit card payment method
- `BANK_ACCOUNT` — A bank account payment method

---

## `PaymentOrigin`

Where the payment originated from

**Values:**
- `SWIPE_ORIGIN` — Payment from a swipe device i.e Square
- `MOBILE_ORIGIN` — DEPRECATED payment from a mobile device
- `CLIENT_ONLINE_ORIGIN` — An account's client paid through the web app (e.g. by clicking the invoice in the email)
- `SYSTEM_GENERATED` — Payment created from an automated job (e.g. automatic payments)
- `TERMINAL_ORIGIN` — Payment from physical card reader (Stripe Terminal, including Tap-on-Mobile; only for Jobber Payments)
- `EWALLET_ORIGIN` — Payment from Google Pay or Apple Pay
- `TAP_TO_PAY` — Payment from a tap-to-pay device
- `CARD_READER` — Payment from a card reader
- `UNKNOWN_ORIGIN` — Default value
- `EMPLOYEE_ONLINE_ORIGIN` — Employee paid through the web app
- `API_ORIGIN` — Payment came through Jobber's API (e.g. Jobber's mobile app)

---

## `PaymentRecordSortKey`

The fields on a payment record which support sorting functionality

**Values:**
- `ENTRY_DATE` — The field which indicates the entry date of the payment record
- `CREATED_AT` — The field which indicates when the payment record was created in the system
- `UPDATED_AT` — The field which indicates when the payment record was last updated
- `LIST_ORDER` — Sort using the list_order logic: Initial Balance last, then by entry date (day precision), then by created_at. Direction parameter is ignored.

---

## `PaymentType`

The type of payment used, i.e cash, check, Jobber Payments...

**Values:**
- `CASH` — Paid with cash
- `CHEQUE` — Paid with check
- `CREDIT_CARD` — Paid with credit or debit card (outside of Jobber)
- `BANK_TRANSFER` — Paid with a bank transfer
- `MONEY_ORDER` — Paid with a money order
- `OTHER` — Paid with a method not listed
- `ZELLE` — Paid with zelle
- `CASH_APP` — Paid with cash app
- `PAYPAL` — Paid with paypal
- `VENMO` — Paid with venmo
- `E_TRANSFER` — Paid with e-transfer
- `ACH_BANK_PAYMENT` — Paid with ACH bank payment
- `JOBBER_PAYMENTS` — Paid with Jobber Payments
- `EPAYMENT` — Paid with one of our payment integration providers
- `CONSUMER_FINANCING` — Paid with consumer financing i.e Wisetack

---

## `Payout`

**Values:**
- `BANK_ACCOUNT` — The payout is of type Bank Account
- `CARD` — The payout is of type Card

---

## `PayoutMethod`

**Values:**
- `INSTANT` — The payout is of method instant
- `STANDARD` — The payout is of method standard

---

## `PayoutSortKey`

The fields, or associated fields, on a collection of invoices which support sorting functionality

**Values:**
- `NET_AMOUNT` — The amount of the payout
- `ARRIVAL_DATE` — The date the payout is expected to arrive

---

## `PayoutStatus`

**Values:**
- `PAID` — The payout status is Paid
- `IN_TRANSIT` — The payout status is In Transit
- `PENDING` — The payout status is Pending
- `FAILED` — The payout status is Failed
- `CANCELED` — The payout status is Canceled

---

## `PermissionAreaFilterEnum`

**Values:**
- `CHEMICAL_TREATMENTS`
- `CLIENTS`
- `BOOKKEEPING`
- `BUNKER`
- `CLIENTS_INDEX`
- `EXPENSES`
- `FORMS_AND_CHECKLISTS`
- `INVOICES`
- `INVOICES_INDEX`
- `CLIENT_MEDIA`
- `CLIENT_NOTES`
- `JOB_NOTES`
- `INVOICE_NOTES`
- `QUOTE_NOTES`
- `WORK_REQUEST_NOTES`
- `PRICING`
- `JOB_COSTING`
- `WORK_REQUESTS`
- `WORK_REQUESTS_INDEX`
- `QUOTES`
- `QUOTES_INDEX`
- `REPORTS`
- `TIME_SHEETS`
- `TO_DOS`
- `WORK_ORDERS`
- `WORK_ORDERS_INDEX`
- `TWO_WAY_SMS`
- `ACCOUNT`
- `WEBSITE`
- `MARKETING_SUITE`
- `SALES_PIPELINE`

---

## `PermissionLevelFilterEnum`

**Values:**
- `NONE` — No permission granted
- `READ` — View
- `CREATE` — View and create
- `WRITE` — View, create, and edit
- `MANAGE` — Highest permission level without becoming an admin
- `DELETE` — View, create, edit, and delete
- `FULL` — All permissions

---

## `PhoneNumberDescription`

**Values:**
- `MAIN` — The phone number is of type Main
- `WORK` — The phone number is of type Work
- `MOBILE` — The phone number is of type Mobile
- `HOME` — The phone number is of type Home
- `FAX` — The phone number is of type Fax
- `OTHER` — The phone number is of type Other

---

## `Processor`

The processor that performed the work on the object

**Values:**
- `TASK` — Object was processed by a Task

---

## `ProductsAndServicesCategory`

**Values:**
- `PRODUCT` — The item is of type Product
- `SERVICE` — The item is of type Service

---

## `ProductsAndServicesSortKey`

The fields, on a collection of ProductsAndServices which support sorting functionality

**Values:**
- `NAME` — The product or service name
- `CATEGORY` — The product or service category

---

## `QuoteJobsSortKey`

The fields on which quote jobs support sorting functionality

**Values:**
- `UPDATED_AT` — Time the Job was updated at

---

## `QuoteStatusTypeEnum`

**Values:**
- `draft` — The default state of a quote
- `awaiting_response` — The state when the quote is sent to a client
- `archived` — The state when a quote is archived
- `approved` — The state when a quote is approved by a client
- `converted` — The state when a quote is converted to a job
- `changes_requested` — The state when a client request changes to the quote

---

## `QuoteTransitionOnCreate`

Valid quote status transitions available when creating a quote

**Values:**
- `AWAITING_RESPONSE` — Transition the quote to awaiting response (sent to client)

---

## `QuotesSortKey`

The fields, or associated fields, on a collection of quotes which support sorting functionality

**Values:**
- `PROPERTY_STREET1` — The field which shows the first line of the street address for the property on the quote
- `CLIENT_PRIMARY_NAME` — Sort by the client's company name if the client represents a business, first name if present, or last name if present
- `CLIENT_FIRST_NAME` — Sort by the client's first name, or company name if the client represents a business
- `CLIENT_LAST_NAME` — Sort by the client's last name, or company name if the client represents a business
- `CREATED_AT` — Sort by the date the quotes were created
- `LAST_SENT_AT` — Sort by the date the quote was last sent to the client
- `LAST_CHANGES_REQUESTED_AT` — Sort by the date the quote was last sent back by the client
- `APPROVED_AT` — Sort by the last date the client approved the quote
- `CONVERTED_AT` — Sort by the last date the quote was converted to a job
- `ARCHIVED_AT` — Sort by the last date the quote was archived
- `QUOTE_NUMBER` — Sort by the quote number
- `QUOTE_STATUS` — Sort by the quote status in workflow order
- `QUOTE_TOTAL` — Sort by quote total value

---

## `RequestFormAssignment`

The places where this request form is being used

**Values:**
- `CLIENT_HUB_REQUESTS` — This form is used as the request form in client hub
- `CLIENT_HUB_BOOKINGS` — This form is used as the booking form in client hub
- `RESERVE_WITH_GOOGLE` — This form is used for reservations through Google
- `BOOKING_DEFAULT` — This form is used as the default booking form

---

## `RequestStatusTypeEnum`

**Values:**
- `new` — New
- `completed` — Completed
- `converted` — Converted
- `archived` — Archived
- `upcoming` — Upcoming
- `overdue` — Overdue
- `unscheduled` — Unscheduled
- `assessment_completed` — Assessment completed
- `today` — Today

---

## `RequestedWorkObjectsSortKey`

The fields on requested work objects which support sorting functionality

**Values:**
- `STATUS` — Sort by the selected work object's status

---

## `RequestsSortKey`

The fields, or associated fields, on a collection of Requests which support sorting functionality

**Values:**
- `TITLE` — The field which indicates the title of the Request
- `REQUESTED_AT` — The field which indicates when the Request was made
- `STATUS` — The field which indicates the status being sorted by the lifecycle of the Request
- `STATUS_AND_REQUESTED_AT` — The field which indicates being sorted first by status and then by date of request descending
- `PRIMARY_NAME` — The field which indicates the primary name of the Client
- `FIRST_NAME` — The field which indicates the first name of the Client
- `LAST_NAME` — The field which indicates the last name of the Client

---

## `ScheduledItemStatus`

**Values:**
- `ACTIVE` — A scheduled item that is active
- `COMPLETED` — A scheduled item that is completed
- `OVERDUE` — A scheduled item that is overdue
- `REMAINING` — A scheduled item that is remaining

---

## `ScheduledItemType`

**Values:**
- `BASIC_TASK` — A scheduled item that is a basic task
- `VISIT` — A scheduled item that is a visit
- `EVENT` — A scheduled item that is an event
- `ASSESSMENT` — A scheduled item that is an assessment
- `QUOTE_REMINDER` — A scheduled item that is a quote reminder
- `INVOICE_REMINDER` — A scheduled item that is an invoice reminder

---

## `ScheduledItemsSortKey`

The fields, or associated fields, on a collection of scheduled items which support sorting functionality

**Values:**
- `COMPLETED` — The completed status of the scheduled item

---

## `SchedulingAspect`

**Values:**
- `ALL` — Include scheduled and unscheduled items, assigned or unassigned, that the user is authorized to view
- `ASSIGNMENTS` — Expand results to include items assigned to any user the user is authorized to view; unassigned items are included as well
- `UNASSIGNED` — Expand scope to also return items with no assigned user if the user is authorized to view appointments assigned to others
- `UNSCHEDULED` — Also include unscheduled items
- `UNASSIGNED_ONLY` — Restrict results to unassigned items only if the user is authorized to view appointments assigned to others. This restriction takes precedence if combined with other values.

---

## `SelfServeBooking`

The type of booking to be created

**Values:**
- `WORK_ORDER` — The online booking will create a job
- `WORK_REQUEST` — The online booking will create an assessment

---

## `SortDirectionEnum`

Sort directions

**Values:**
- `ASCENDING` — Sort by ascending order
- `DESCENDING` — Sort by descending order

---

## `Source`

**Values:**
- `CLIENT`
- `FLAT_FILE_JOB_IMPORT`
- `GOOGLE_CALENDAR_JOB_IMPORT`
- `GQL_API`
- `HOME`
- `INTERNAL`
- `IMPORT`
- `JOB`
- `JOB_NEW`
- `JOBS_INDEX`
- `ONBOARDING`
- `ONLINE_BOOKING`
- `PROPERTY`
- `QUICK_CREATE`
- `QUOTE_CONVERT`
- `QUOTE_INDEX_CONVERT`
- `REQUEST_CONVERT`
- `REST_API`
- `SCHEDULE_DAY`
- `SCHEDULE_DAY_CALENDAR`
- `SCHEDULE_LIST`
- `SCHEDULE_MAP`
- `SCHEDULE_MONTH`
- `SCHEDULE_MONTH_CALENDAR`
- `SCHEDULE_WEEK`
- `SCHEDULE_WEEK_CALENDAR`
- `BILLING_INFO`
- `MODULAR_ONBOARDING_MOBILE`
- `QUOTE_PREFILL_MOBILE`
- `JOB_PREFILL_MOBILE`
- `INVOICE_PREFILL`
- `REACT_SCHEDULE_DAY`
- `REACT_SCHEDULE_DAY_INLINE`
- `REACT_SCHEDULE_WEEK`
- `REACT_SCHEDULE_WEEK_INLINE`

---

## `StripeCapitalLoan`

**Values:**
- `FLEX_LOAN` — Flexible repayment loan
- `FIXED_TERM_LOAN` — Fixed term loan
- `CASH_ADVANCE` — Cash advance

---

## `TaskSortableFields`

The fields on a collection of tasks which support sorting functionality

**Values:**
- `START_AT` — The field which indicates when the task starts

---

## `TaxCalculationMethodType`

**Values:**
- `EXCLUSIVE`
- `INCLUSIVE`

---

## `TerminalReader`

The terminal reader type for terminal payments

**Values:**
- `TAP_TO_PAY` — Tap to Pay terminal reader
- `CARD_READER` — Card Reader terminal

---

## `TimeSheetEntriesSortableFieldsEnum`

The fields on client notes which support sorting functionality

**Values:**
- `START_AT` — The field which indicates when the timesheet was started

---

## `TimeSheetStatus`

Status related to time sheets or their entries aggregated over a time period

**Values:**
- `NORMAL` — Total time on the time sheet is within the expected range
- `ABNORMALLY_HIGH` — Total time on the time sheet is higher than the expected range

---

## `UserFirstDayOfTheWeekEnum`

**Values:**
- `SUNDAY` — First day of the week in user's account is on Sundays (Default)
- `MONDAY` — First day of the week in user's account is on Mondays

---

## `UserStatusEnum`

**Values:**
- `ACTIVATED` — The user has been activated
- `DEACTIVATED` — The user has been deactivated
- `NOT_INVITED` — Has never been invited
- `RESEND_INVITE` — An invite has been sent, but not accepted
- `SEND_INVITE` — An invite has not been sent and can be

---

## `UsersSortKey`

The fields on a collection of users which support sorting functionality

**Values:**
- `NAME` — Sort by the user's display name

---

## `UsersStatusFilterEnum`

**Values:**
- `ACTIVATED` — Activated users
- `DEACTIVATED` — Deactivated users

---

## `VehicleStatus`

The status of a vehicle

**Values:**
- `DRIVING` — The vehicle is currently driving
- `IDLE` — The vehicle is idling
- `OFF` — The vehicle is turned off
- `SYNCING_LOCATION` — The vehicle is syncing its location
- `STATUS_UNAVAILABLE` — The status of the vehicle is unavailable

---

## `VisitActionUponComplete`

**Values:**
- `INVOICE_NOW` — The visit can be invoiced immediately
- `INVOICE_LATER` — The visit can be invoiced later
- `CLOSE_JOB` — The visit is the last on the job and can be closed
- `LEAVE_JOB_OPEN` — The visit is the last on the job and can be left open
- `CLOSE_JOB_INVOICE_NOW` — Close the job and create an invoice now
- `CLOSE_JOB_INVOICE_LATER` — Close the job and create an invoice later

---

## `VisitInvoiceStatus`

**Values:**
- `INVOICED_ONLY` — Invoiced only visit
- `UNINVOICED_ONLY` — Uninvoiced only visit

---

## `VisitLineItemQuantityFilter`

Filter options for visit line items based on quantity

**Values:**
- `ALL` — Return all line items including those with zero quantity
- `ONLY_NON_ZERO` — Return only line items with non-zero quantity

---

## `VisitStatusTypeEnum`

**Values:**
- `ACTIVE` — A visit is still active
- `COMPLETED` — A visit that has been completed
- `LATE` — An incomplete visit which end time has passed
- `TODAY` — An incomplete visit that is scheduled today, which end time has not yet passed
- `UNSCHEDULED` — A visit that is unscheduled
- `UPCOMING` — An incomplete visit that is upcoming

---

## `VisitsSortableFields`

The fields on a collection of visits which support sorting functionality

**Values:**
- `CREATED_AT` — The field which indicates when the visit was created at
- `START_AT` — The field which indicates when the visit starts
- `CLIENT_PRIMARY_NAME` — The field which shows the client last name or company name associated with the visit
- `STATUS` — The field which shows the visit status priority

---

## `WebHookTopicEnum`

**Values:**
- `APP_CONNECT` — When an app connect
- `APP_DISCONNECT` — When an app connect
- `CLIENT_CREATE` — When a client is created
- `CLIENT_DESTROY` — When a client is deleted
- `CLIENT_UPDATE` — When a client is updated
- `INVOICE_CREATE` — When an invoice is created
- `INVOICE_DESTROY` — When an invoice is deleted
- `INVOICE_UPDATE` — When an invoice is updated
- `JOB_CREATE` — When a job is created
- `JOB_DESTROY` — When a job is deleted
- `JOB_UPDATE` — When a job is updated
- `JOB_CLOSED` — When a job is closed
- `PROPERTY_CREATE` — When a property is created
- `PROPERTY_DESTROY` — When a property is deleted
- `PROPERTY_UPDATE` — When a property is updated
- `QUOTE_CREATE` — When a quote is created
- `QUOTE_DESTROY` — When a quote is deleted
- `QUOTE_UPDATE` — When a quote is updated
- `QUOTE_SENT` — When a quote is sent
- `QUOTE_APPROVED` — When a quote is approved
- `REQUEST_CREATE` — When a request is created
- `REQUEST_DESTROY` — When a request is deleted
- `REQUEST_UPDATE` — When a request is updated
- `VISIT_COMPLETE` — When a visit is completed
- `VISIT_CREATE` — When a visit is created. When multiple visits are created in a recurring schedule, only the first visit will notify
- `VISIT_DESTROY` — When a visit is deleted
- `VISIT_UPDATE` — When a visit is updated
- `PRODUCT_OR_SERVICE_CREATE` — When a product or service is created
- `PRODUCT_OR_SERVICE_DESTROY` — When a product or service is deleted
- `PRODUCT_OR_SERVICE_UPDATE` — When a product or service is updated
- `PAYMENT_CREATE` — When a payment is created
- `PAYMENT_DESTROY` — When a payment is deleted
- `PAYMENT_UPDATE` — When a payment is updated
- `PAYOUT_CREATE` — When a payout is created
- `PAYOUT_DESTROY` — When a payout is deleted
- `PAYOUT_UPDATE` — When a payout is updated
- `TIMESHEET_CREATE` — When a timesheet is created
- `TIMESHEET_DESTROY` — When a timesheet is deleted
- `TIMESHEET_UPDATE` — When a timesheet is updated
- `EXPENSE_CREATE` — When an expense is created
- `EXPENSE_DESTROY` — When an expense is deleted
- `EXPENSE_UPDATE` — When an expense is updated
- `ON_MY_WAY_TRACKING_LINK_REQUEST` — When a on my way tracking link is requested
- `USER_CREATE` — When a user is created

---

## `Webhook`

**Values:**
- `APP_WEBHOOK` — When an app webhook is present
- `ACCOUNT_WEBHOOK` — When an account webhook is present

---

## `WorkItemCategoryTypeEnum`

**Values:**
- `Product` — The item is of type Product
- `Service` — The item is of type Service

---

## `WorkObject`

**Values:**
- `REQUEST` — Represents the Request type
- `QUOTE` — Represents the Quote type
- `JOB` — Represents the Job type
- `INVOICE` — Represents the Invoice type
- `TREATMENT` — Represents the Treatment type

---

## `WorkObjectSendMessageType`

**Values:**
- `QUOTE_SENT` — A sent quote
- `INVOICE_SENT` — A sent invoice
- `ON_MY_WAY` — An onMyWay message
- `JOB_BOOKING_CONFIRMATION` — A booking confirmation notification
- `ASSESSMENT_BOOKED` — A booking confirmation notification for an assessment
- `ASSESSMENT_REMINDER` — An assessment reminder
- `VISIT_REMINDER` — A visit reminder
- `REQUEST_CARD_ON_FILE` — A request for card on file

---
