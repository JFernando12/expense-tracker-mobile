import * as FileSystem from 'expo-file-system';
import { logImageDebug } from './debugUtils';

export interface ImageSaveResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Safely saves an image to the document directory with proper validation
 * @param sourceUri - The source URI of the image to save
 * @param prefix - Optional prefix for the filename (default: 'transaction')
 * @returns Promise<ImageSaveResult>
 */
export const saveImageToDocuments = async (
  sourceUri: string,
  prefix: string = 'transaction'
): Promise<ImageSaveResult> => {
  try {
    await logImageDebug(`Attempting to save image: ${sourceUri}`);
    
    const documentDirectory = FileSystem.documentDirectory;
    
    if (!documentDirectory) {
      await logImageDebug('Document directory not available');
      return {
        success: false,
        error: 'Document directory not available'
      };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fileExtension = sourceUri.split('.').pop() || 'jpg';
    const uniqueFilename = `${prefix}_${timestamp}_${random}.${fileExtension}`;
    const destUri = `${documentDirectory}${uniqueFilename}`;

    await logImageDebug(`Saving to: ${destUri}`);

    // Copy the file
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destUri,
    });

    // Verify the file was saved and is accessible
    const fileInfo = await FileSystem.getInfoAsync(destUri);
    
    if (!fileInfo.exists) {
      await logImageDebug('File verification failed - file does not exist', destUri);
      return {
        success: false,
        error: 'File was not saved properly'
      };
    }

    // Additional verification: check if file has content
    if (fileInfo.size === 0) {
      await logImageDebug('File verification failed - file is empty', destUri);
      return {
        success: false,
        error: 'Saved file is empty'
      };
    }

    await logImageDebug(`Image saved successfully: ${destUri} (${fileInfo.size} bytes)`);

    return {
      success: true,
      uri: destUri
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await logImageDebug(`Error saving image: ${errorMessage}`, sourceUri);
    console.error('Error saving image:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Verifies if an image file exists and is readable
 * @param uri - The URI of the image to verify
 * @returns Promise<boolean>
 */
export const verifyImageExists = async (uri: string): Promise<boolean> => {
  try {
    if (!uri) return false;
    
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const exists = fileInfo.exists && fileInfo.size > 0;
    
    await logImageDebug(`Image verification: ${uri} - ${exists ? 'EXISTS' : 'MISSING'}`);
    
    return exists;
  } catch (error) {
    await logImageDebug(`Error verifying image: ${uri} - ${error}`);
    console.error('Error verifying image:', error);
    return false;
  }
};

/**
 * Safely deletes an image file
 * @param uri - The URI of the image to delete
 * @returns Promise<boolean>
 */
export const deleteImage = async (uri: string): Promise<boolean> => {
  try {
    if (!uri) return true; // Nothing to delete
    
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Cleans up old transaction images that are no longer referenced
 * This can be called periodically to free up storage space
 * @param referencedUris - Array of URIs that are still being used
 * @returns Promise<number> - Number of files cleaned up
 */
export const cleanupUnusedImages = async (referencedUris: string[]): Promise<number> => {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) return 0;

    const dirInfo = await FileSystem.readDirectoryAsync(documentDirectory);
    const transactionFiles = dirInfo.filter(file => 
      file.startsWith('transaction_') && 
      (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    );

    let cleanedCount = 0;
    
    for (const file of transactionFiles) {
      const fullPath = `${documentDirectory}${file}`;
      const isReferenced = referencedUris.includes(fullPath);
      
      if (!isReferenced) {
        const deleted = await deleteImage(fullPath);
        if (deleted) cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error during cleanup:', error);
    return 0;
  }
};
