# Offline Functionality Testing Guide

This guide explains how to test the offline functionality implementation for the expense tracker mobile app.

## 🎯 Overview

The offline functionality has been implemented for wallet management with the following features:

- ✅ Local storage using AsyncStorage
- ✅ Network connectivity monitoring
- ✅ Automatic synchronization when online
- ✅ Pending changes queue for offline operations
- ✅ UI indicators for sync status and offline mode
- ✅ Conflict resolution and error handling

## 📱 Components Implemented

### Core Services
- **`walletStorage.ts`** - Local storage operations for wallets
- **`networkService.ts`** - Network connectivity monitoring
- **`walletSyncService.ts`** - Unified service handling online/offline operations

### UI Components
- **`OfflineIndicator.tsx`** - Shows when app is offline
- **`SyncStatus.tsx`** - Displays sync status and allows manual sync

### Modified Files
- **`wallets.ts`** - Updated to use sync service
- **`auth.ts`** - Clear local storage on logout
- **Root layout** - Includes offline indicator
- **Wallet and home tabs** - Include sync status components

## 🧪 Testing Instructions

### 1. Basic Offline Testing

1. **Start the app** - The app should load normally
2. **Check network indicator** - Should show online status
3. **Disable internet** - Turn off WiFi/mobile data
4. **Verify offline indicator** - Red banner should appear at top
5. **Create a wallet** - Should work and show "pending sync" status
6. **Enable internet** - Turn WiFi/mobile data back on
7. **Verify sync** - Wallet should sync automatically and status should update

### 2. Wallet Operations Testing

#### Creating Wallets Offline
```
1. Go offline (disable internet)
2. Navigate to wallet tab
3. Tap "+" to create new wallet
4. Fill in details and save
5. Wallet should be created with "pending sync" status
6. Go back online
7. Wallet should sync automatically
```

#### Updating Wallets Offline
```
1. Go offline
2. Edit an existing wallet
3. Make changes and save
4. Changes should be saved locally
5. Go back online
6. Changes should sync to server
```

#### Deleting Wallets Offline
```
1. Go offline
2. Delete a wallet
3. Wallet should be removed locally
4. Go back online
5. Deletion should sync to server
```

### 3. Sync Status Testing

#### Automatic Sync
- Network changes should trigger automatic sync
- Sync status should update in real-time
- Errors should be displayed to user

#### Manual Sync
- Tap "Sync Now" button to force sync
- Should work both online and offline
- Should show appropriate feedback

### 4. Edge Cases Testing

#### Network Interruption
```
1. Start creating a wallet online
2. Disable internet during creation
3. Complete the creation
4. Should fall back to local storage
5. Re-enable internet
6. Should sync automatically
```

#### Server Errors
```
1. Go online with pending changes
2. If server is down, sync should fail gracefully
3. Error should be shown to user
4. Retry should be available
```

#### App Restart
```
1. Create wallets offline
2. Close app completely
3. Restart app while still offline
4. Pending changes should persist
5. Go online - should sync automatically
```

## 🔍 Debugging

### Console Logs
The implementation includes comprehensive logging:
- Network status changes
- Storage operations
- Sync attempts and results
- Error conditions

### Manual Testing Script
Use the manual testing script at `scripts/manualTests.ts`:

```typescript
import manualTests from '@/scripts/manualTests';

// Run all tests
await manualTests.runAllTests();

// Or run individual tests
await manualTests.testNetworkConnectivity();
await manualTests.testOfflineWalletCreation();
await manualTests.testSyncWhenOnline();
```

### Checking Local Storage
You can inspect local storage contents:

```typescript
import { walletStorage } from '@/lib/storage/walletStorage';

// Get all local wallets
const wallets = await walletStorage.getAllWallets();
console.log('Local wallets:', wallets);

// Get pending changes
const pending = await walletStorage.getPendingChanges();
console.log('Pending changes:', pending);
```

## 📊 Expected Behavior

### Online Mode
- All operations go directly to server
- Real-time sync with backend
- No pending changes queue

### Offline Mode
- Operations save to local storage
- Changes queued for sync
- UI shows offline indicator
- Sync status shows "pending"

### Transition Online
- Automatic sync attempt
- Pending changes uploaded
- Local storage updated with server IDs
- UI updates to reflect sync status

## 🐛 Troubleshooting

### Common Issues

1. **Sync not working**
   - Check network connectivity
   - Verify server is accessible
   - Check console for error messages

2. **UI not updating**
   - Ensure components are using sync service
   - Check that network listeners are active
   - Verify state management is working

3. **Data loss**
   - Local storage should persist app restarts
   - Check AsyncStorage permissions
   - Verify logout clears storage properly

### Performance Considerations
- Local storage operations are async
- Large datasets may impact performance
- Sync operations run in background
- UI remains responsive during sync

## 🔄 Next Steps

### Extend to Other Entities
The same pattern can be applied to:
- Transactions
- Categories
- User preferences

### Enhanced Features
- Conflict resolution UI
- Bulk operations
- Data export/import
- Offline analytics

### Production Readiness
- Add comprehensive error handling
- Implement retry mechanisms
- Add data validation
- Performance optimization

## 📝 Notes

- The implementation uses a "offline-first" approach
- Data consistency is maintained through pending changes queue
- User experience remains smooth regardless of connectivity
- All operations are designed to be non-blocking
