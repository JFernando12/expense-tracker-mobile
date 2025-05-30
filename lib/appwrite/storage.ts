import { ID } from 'react-native-appwrite';
import { getCurrentUser } from './auth';
import { config, storage } from './client';

export const uploadImage = async (imageUri: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Create a file object compatible with React Native Appwrite
    const file = {
      name: `transaction_${Date.now()}.jpg`,
      type: 'image/jpeg',
      size: 0, // Size will be determined by Appwrite
      uri: imageUri,
    };

    const uploadResponse = await storage.createFile(
      config.storageBucketId,
      ID.unique(),
      file
    );

    if (!uploadResponse.$id) return null;

    return uploadResponse.$id;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const deleteImage = async (imageId: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    await storage.deleteFile(config.storageBucketId, imageId);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

export const getImageUrl = (imageId: string): string => {
  return storage.getFileView(config.storageBucketId, imageId).toString();
};
