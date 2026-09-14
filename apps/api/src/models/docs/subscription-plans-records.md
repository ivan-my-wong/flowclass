# Subscription Plans Records

## Overview

The subscription system allows institutions to select, purchase, and manage their subscription plans. Each subscription record logs the details of the plans chosen, the features enabled, and the pricing for a given period. This enables flexible, auditable, and extensible management of institution subscriptions.

## Entity: `SubscriptionPlanRecordsEntity`

This entity represents a record of an institution's subscription, including all selected options and calculated prices for a given period.

### Key Fields

- **planIds** (`number[]`): Array of plan IDs selected for this subscription period.
- **institutionId** (`number`): The institution that owns this subscription.
- **purchaseDate** (`Date`): When the subscription was purchased.
- **expiryDate** (`Date`): When the subscription expires.
- **baseUserQuantity** (`number`): Number of base users included.
- **schoolQuantity** (`number`): Number of schools included.
- **setupFeeQuantity** (`number`): Number of setup fees applied.
- **adminQuantity** (`number`): Number of admin users included.
- **tutorQuantity** (`number`): Number of tutor users included.
- **classTypeEnable** (`number`): Number of class types included.
- **featureEnable** (`FeatureEnable`): Features enabled for this subscription (e.g., branding removal, student portal, etc.).
- **notificationChannels** (`ContactChannelEnable`): Notification channels enabled (e.g., Email, WhatsApp).
- **promotionTier** (`PromotionEnable`): Promotions and fee options enabled.
- **integration** (`IntegrationEnable`): Integrations enabled (e.g., Xero, Google Drive).
- **customerSupportTier** (`PlanTier`): Customer support tier selected.
- **totalPrice** (`number`): Total price for this subscription record.
- **institution** (`Institution`): Relation to the institution entity.

## How Subscriptions Work

### 1. SubscriptionPlan Selection

- Institutions can select one or more plans (by plan ID) for a subscription period.
- Each plan can represent a base user tier, additional features, integrations, or support levels.

### 2. Option Configuration

- For each subscription, the institution can configure:
  - Number of users, schools, admins, tutors, class types, etc.
  - Which features, notification channels, promotions, and integrations are enabled.
  - The desired customer support tier.

### 3. Price Calculation

- The system calculates the total price based on the selected plans, quantities, and enabled options.
- All pricing logic is handled in the service layer, not in the entity.

### 4. Record Creation

- When a subscription is purchased, a new `SubscriptionPlanRecordsEntity` is created with all selected options and calculated prices.
- The record includes purchase and expiry dates for tracking the subscription period.

### 5. Management & Auditing

- All subscription records are linked to the institution.
- The system can retrieve current and historical subscriptions for auditing, billing, and support.
- Subscriptions can be updated or renewed by creating new records.

## Example Workflow

1. Institution selects a plan and configures options (users, features, integrations, etc.).
2. System calculates the total price.
3. Institution confirms and purchases the subscription.
4. A new `SubscriptionPlanRecordsEntity` is created, logging all details.
5. The system uses this record to determine the institution's entitlements and access.

## Extensibility

- The entity is designed to be extensible for new features, integrations, or pricing options.
- All option fields use enums and JSONB for flexibility.

## API Endpoints

- CRUD endpoints are available for admin management of subscription records.
- See the `SubscriptionPlanRecordsController` for details.

---

For further details, see the entity definition in `src/models/subscription-plans-records.entity.ts` and the related service/controller files.
