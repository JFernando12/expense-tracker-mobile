# Hybrid Functionality Documentation

## Overview
The expense tracker app now supports both local-only usage and cloud synchronization through a hybrid provider system. Users can start using the app immediately without creating an account, and optionally sign up later to sync their data to the cloud.

## Architecture

### Key Components

1. **HybridProvider** (`lib/hybrid-provider.tsx`)
   - Manages switching between local and remote data operations
   - Provides unified interface for all CRUD operations
   - Handles data synchronization between local and remote storage

2. **LocalProvider** (`lib/local-provider.tsx`)
   - Manages local data storage using AsyncStorage
   - Provides offline-first functionality
   - Maintains data persistence across app sessions

3. **GlobalProvider** (`lib/global-provider.tsx`) 
   - Manages remote data operations with Appwrite
   - Handles authentication and user management
   - Provides cloud storage and sync capabilities

## User Flows

### Flow 1: New User (Local First)
1. User opens app → Automatically starts in local mode
2. User creates wallets and transactions → Saved locally
3. User optionally signs up/logs in → Local data syncs to cloud
4. User can now access data from multiple devices

### Flow 2: Existing User
1. User opens app and logs in → Uses cloud data
2. User creates/modifies data → Automatically saved to cloud
3. Data available across all user's devices

### Flow 3: Offline Usage
1. User uses app without internet → Local mode active
2. User creates/modifies data → Saved locally  
3. User connects to internet and logs in → Local data syncs to cloud

## Synchronization Process

The sync functionality includes:

### Wallet Synchronization
- Maps local wallet IDs to remote wallet IDs
- Avoids creating duplicates by checking existing wallets
- Maintains relationship integrity for associated transactions

### Transaction Synchronization  
- Maps transactions to correct remote wallets using ID mapping
- Matches categories by name to avoid duplicates
- Preserves transaction metadata (date, amount, description, type)

### ID Mapping System
- Uses `Map<string, string>` to track local-to-remote ID relationships
- Ensures transaction-wallet relationships remain intact after sync
- Prevents duplicate data creation during sync operations

## Key Features

### Seamless Mode Switching
- Automatic detection of authentication state
- Transparent switching between local and remote operations
- No user intervention required for mode changes

### Data Persistence
- Local data remains available even after sync to cloud
- Users can work offline and sync when connectivity is restored
- No data loss during mode transitions

### Error Handling
- Comprehensive error handling for sync operations
- User-friendly error messages
- Graceful fallback to local mode if remote operations fail

### Loading States
- Visual feedback during sync operations
- Loading indicators for long-running operations
- Clear user messaging about current operation status

## Technical Implementation

### Context Hierarchy
```
HybridProvider
├── GlobalProvider (Remote operations)
└── LocalProvider (Local operations)
    └── HybridDataProvider (Mode selection)
```

### Mode Selection Logic
```typescript
const isOnlineMode = !isLoggedIn || !isConnected;
```

### Sync Algorithm
1. Fetch all local wallets and transactions
2. Filter out already-synced data (items with non-local IDs)
3. Create wallets on remote server
4. Build ID mapping (local ID → remote ID)
5. Sync transactions using mapped wallet IDs
6. Match categories by name to avoid duplicates
7. Update user interface with synced data

## Usage in Components

### Basic Operations
```typescript
const { wallets, addWallet, transactions, addTransaction } = useGlobalContext();

// These work the same regardless of local or remote mode
await addWallet({ name: "My Wallet", initialBalance: 1000 });
await addTransaction({ walletId, amount: 50, description: "Coffee" });
```

### Sync Operations
```typescript
const { syncWithAppwrite, isOnlineMode } = useGlobalContext();

if (isOnlineMode && isLoggedIn) {
  await syncWithAppwrite(); // Sync local data to cloud
}
```

## Benefits

1. **Immediate Usability**: Users can start using the app instantly
2. **No Forced Registration**: Optional account creation
3. **Offline Capability**: Full functionality without internet
4. **Data Security**: Local data with optional cloud backup
5. **Seamless Experience**: Transparent mode switching
6. **Cross-Device Sync**: Access data from multiple devices after login

## Testing

Test the following scenarios:
1. Create data locally without logging in
2. Log in and verify data syncs to cloud
3. Create data while logged in (should save to cloud)
4. Log out and verify local mode still works
5. Test offline usage and subsequent sync

## Future Enhancements

Potential improvements:
1. Conflict resolution for data modified on multiple devices
2. Incremental sync for large datasets
3. Offline queue for pending operations
4. Data compression for faster sync
5. Selective sync options for users
