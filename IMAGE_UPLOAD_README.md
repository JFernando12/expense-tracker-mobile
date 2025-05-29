# Image Upload Setup for Transaction Tickets

This update adds image upload functionality to the expense tracker app, allowing users to attach receipts/tickets to their transactions.

## New Features Added

1. **Image Upload**: Users can now attach images to transactions
2. **Camera Integration**: Take photos directly from the app
3. **Gallery Access**: Select images from device gallery
4. **Image Management**: View, replace, or remove attached images
5. **Cloud Storage**: Images are stored securely using Appwrite Storage

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```
EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id_here
```

### 2. Appwrite Storage Setup

1. Go to your Appwrite Console
2. Navigate to Storage section
3. Create a new bucket for transaction images
4. Configure bucket permissions:
   - **Read**: `users` (authenticated users can read)
   - **Create**: `users` (authenticated users can upload)
   - **Update**: `users` (authenticated users can update)
   - **Delete**: `users` (authenticated users can delete)
5. Copy the bucket ID and add it to your environment variables

### 3. Database Schema Update

Add a new field to your transaction collection in Appwrite:

- **Field Name**: `image`
- **Type**: String
- **Required**: No
- **Array**: No

### 4. Permissions Setup

Ensure your device has the necessary permissions for:
- Camera access
- Photo library access

The app will automatically request these permissions when needed.

## How It Works

### Creating Transactions
1. Navigate to create new transaction
2. Fill in the required fields
3. Tap on the "Ticket/Comprobante" section
4. Choose to take a photo or select from gallery
5. The image will be uploaded to Appwrite Storage when saving

### Editing Transactions
1. Open an existing transaction for editing
2. The current image (if any) will be displayed
3. Tap to replace or remove the image
4. Changes are saved when updating the transaction

### Technical Implementation

- Images are uploaded to Appwrite Storage when creating/updating transactions
- Image URLs are stored in the transaction document
- Old images are automatically deleted when replaced or removed
- Image picker supports both camera and gallery selection
- Images are compressed for optimal storage

## File Changes Made

### Core Files Modified:
- `lib/appwrite.ts` - Added Storage integration and image upload functions
- `types/types.ts` - Updated Transaction interface to include imageUrl
- `app/(root)/(modals)/transactionModal/create.tsx` - Added image picker UI
- `app/(root)/(modals)/transactionModal/[id].tsx` - Added image editing functionality

### New Dependencies:
- `expo-image-picker` - For camera and gallery access

## Error Handling

The app includes comprehensive error handling for:
- Permission denials
- Upload failures
- Image deletion errors
- Network connectivity issues

All errors are displayed to users with appropriate Spanish messages.

## Security Considerations

- Only authenticated users can upload images
- Images are stored in a secure Appwrite bucket
- File access is controlled through Appwrite permissions
- Image URLs are only accessible to the transaction owner
