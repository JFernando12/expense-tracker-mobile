# In-App Purchase Setup Guide

## Overview
This expense tracker app now supports In-App Purchases (IAP) for premium subscriptions using `react-native-iap`. Users can purchase monthly or yearly subscriptions to unlock cloud synchronization features.

## Product IDs
The following product IDs are configured for your app:
- **Monthly Subscription**: `com.jfernando2012.expensetracker.monthly`
- **Yearly Subscription**: `com.jfernando2012.expensetracker.yearly`

## Apple App Store Connect Setup

### 1. Create In-App Purchase Products
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → Features → In-App Purchases
3. Create two new Auto-Renewable Subscriptions:

#### Monthly Subscription
- **Product ID**: `com.jfernando2012.expensetracker.monthly`
- **Reference Name**: Expense Tracker Monthly Premium
- **Subscription Group**: Premium Subscriptions
- **Subscription Duration**: 1 Month
- **Price**: Choose appropriate price point (e.g., $4.99)

#### Yearly Subscription
- **Product ID**: `com.jfernando2012.expensetracker.yearly`
- **Reference Name**: Expense Tracker Yearly Premium
- **Subscription Group**: Premium Subscriptions
- **Subscription Duration**: 1 Year
- **Price**: Choose appropriate price point (e.g., $39.99)

### 2. Subscription Groups
- Create a subscription group called "Premium Subscriptions"
- Add both monthly and yearly subscriptions to this group
- Configure subscription hierarchy (yearly should be higher level)

### 3. App Metadata
- Add subscription descriptions and terms
- Configure subscription group display name
- Set up promotional offers if desired

## Google Play Console Setup

### 1. Create Subscription Products
1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to your app → Monetization → Products → Subscriptions
3. Create two new subscriptions:

#### Monthly Subscription
- **Product ID**: `com.jfernando.expensetracker.monthly`
- **Name**: Monthly Premium
- **Description**: Premium features with monthly billing
- **Billing Period**: Monthly
- **Price**: Set appropriate price

#### Yearly Subscription
- **Product ID**: `com.jfernando2012.expensetracker.yearly`
- **Name**: Yearly Premium
- **Description**: Premium features with yearly billing (save 33%)
- **Billing Period**: Yearly
- **Price**: Set appropriate price

### 2. Subscription Group
- Create a subscription group for both products
- Configure upgrade/downgrade paths

## Implementation Features

### ✅ Implemented Features
- [x] IAP service with purchase flow
- [x] Receipt validation preparation
- [x] Local storage of subscription data
- [x] Server-side subscription sync
- [x] User interface for subscription selection
- [x] Error handling and user feedback
- [x] Purchase restoration capability
- [x] Network connectivity handling

### 🔄 Current Flow
1. User opens subscription modal
2. IAP service initializes and loads products
3. Real prices are fetched from stores and displayed
4. User selects a plan and initiates purchase
5. Store handles payment processing
6. Purchase success triggers local storage update
7. Server receives subscription data with receipt info
8. User gains access to premium features

### 🔒 Security Features
- Transaction receipts stored for verification
- Server-side validation ready for implementation
- Offline capability with sync when online
- Purchase state persistence

## Testing

### iOS Testing
1. Create sandbox test users in App Store Connect
2. Sign in with sandbox account on device
3. Test subscription purchases
4. Verify receipt validation

### Android Testing
1. Create test tracks in Google Play Console
2. Add test users to the track
3. Upload signed APK to test track
4. Test subscription functionality

## Development Notes

### Environment Setup
- Products are loaded dynamically from stores
- Fallback to default prices if IAP unavailable
- Development mode shows test alerts instead of errors

### Receipt Verification
The app stores transaction IDs and receipt data for server-side verification:
- `transactionId`: Platform-specific transaction identifier
- `originalTransactionId`: iOS original transaction ID for renewals
- Server can validate receipts with Apple/Google APIs

### Error Handling
- User cancellation is handled gracefully
- Network errors show appropriate messages
- Purchase failures are logged and reported

## Production Checklist
- [ ] Configure products in App Store Connect
- [ ] Configure products in Google Play Console
- [ ] Test with sandbox/test accounts
- [ ] Implement server-side receipt verification
- [ ] Test subscription renewal flows
- [ ] Test subscription cancellation
- [ ] Verify analytics tracking
- [ ] Submit for review

## Support Features
- Subscription status visible in profile
- Purchase history stored locally and synced
- Customer support can access transaction data
- Subscription cancellation through store settings
