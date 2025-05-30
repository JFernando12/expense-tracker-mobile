import { Category, TransactionType } from '@/types/types';
import { Query } from 'react-native-appwrite';
import { config, databases } from './client';

export const getCategories = async ({
  type,
}: {
  type: TransactionType;
}): Promise<Category[]> => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.categoryCollectionId,
      [Query.equal('type', type)]
    );

    return (
      response?.documents?.map((category) => ({
        id: category.$id as string,
        name: category.name as string,
        icon: category.icon as string,
        type: category.type as TransactionType,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
