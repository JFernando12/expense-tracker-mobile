# Guide to Update Imports After Appwrite File Restructuring

## Overview
The `appwrite.ts` file has been restructured into multiple files for better organization and maintainability. Each file now focuses on a specific area of functionality (auth, transactions, wallets, etc.).

## New File Structure
- `/lib/appwrite/client.ts` - Core client setup and configuration
- `/lib/appwrite/auth.ts` - Authentication related functions
- `/lib/appwrite/wallets.ts` - Wallet management functions
- `/lib/appwrite/categories.ts` - Category related functions
- `/lib/appwrite/transactions.ts` - Transaction management functions
- `/lib/appwrite/storage.ts` - File upload/download functions
- `/lib/appwrite/index.ts` - Re-exports all functions for backward compatibility

## How to Update Your Imports

### Option 1: Keep Using the Single Import Path (Simplest)
For now, you can continue importing from `@/lib/appwrite` without any code changes. We've added an index.ts file that re-exports everything.

```typescript
// This still works exactly as before
import { getCurrentUser, createTransaction } from '@/lib/appwrite';
```

### Option 2: Update to More Specific Imports (Recommended)
For better code organization and faster imports, consider updating to more specific imports:

```typescript
// Auth functions
import { login, logout, register, getCurrentUser, updateUser } from '@/lib/appwrite/auth';

// Wallet functions
import { createWallet, updateWallet, getWallets, getTotalBalance } from '@/lib/appwrite/wallets';

// Transaction functions
import { 
  createTransaction, 
  updateTransaction, 
  getTransactions,
  getTransaction,
  searchTransactions,
  getTotalIncomes,
  getTotalExpenses
} from '@/lib/appwrite/transactions';

// Category functions
import { getCategories } from '@/lib/appwrite/categories';

// Storage functions
import { uploadImage, deleteImage, getImageUrl } from '@/lib/appwrite/storage';
```

## Files to Update
The following files import from the original appwrite.ts and should be updated:

1. `/app/(root)/(tabs)/profile.tsx`
2. `/app/(root)/(modals)/walletModal/[id].tsx`
3. `/app/(root)/(modals)/walletModal/create.tsx`
4. `/app/(root)/(modals)/transactionModal/[id].tsx`
5. `/app/(root)/(modals)/transactionModal/create.tsx`
6. `/app/(root)/(modals)/searchModal.tsx`
7. `/lib/global-provider.tsx`

## Benefits of This Restructuring

1. **Better Code Organization**: Each file focuses on a specific area of functionality
2. **Improved Maintainability**: Easier to find and modify specific functionality
3. **Reduced File Size**: Each file is smaller and more focused
4. **Better Type Safety**: More specific imports mean better type checking
5. **Easier Testing**: Smaller modules are easier to test in isolation
