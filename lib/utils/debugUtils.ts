import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export interface FileSystemDebugInfo {
  documentDirectory: string | null;
  cacheDirectory: string | null;
  bundleDirectory: string | null;
  platform: string;
  isDevice: boolean;
  appOwnership: string;
  manifest: any;
  deviceName?: string;
  totalDiskCapacity?: number;
  freeDiskStorage?: number;
}

export interface ImageDebugInfo {
  uri: string;
  exists: boolean;
  size: number;
  isDirectory: boolean;
  modificationTime: number;
  error?: string;
}

/**
 * Collects comprehensive debug information about the file system
 * This is useful for diagnosing issues in production builds
 */
export const getFileSystemDebugInfo = async (): Promise<FileSystemDebugInfo> => {
  const info: FileSystemDebugInfo = {
    documentDirectory: FileSystem.documentDirectory,
    cacheDirectory: FileSystem.cacheDirectory,
    bundleDirectory: FileSystem.bundleDirectory,
    platform: Constants.platform?.ios ? 'ios' : Constants.platform?.android ? 'android' : 'unknown',
    isDevice: Constants.isDevice,
    appOwnership: Constants.appOwnership || 'unknown',
    manifest: Constants.manifest,
  };

  try {
    // Get device storage info if available
    if (FileSystem.getTotalDiskCapacityAsync) {
      info.totalDiskCapacity = await FileSystem.getTotalDiskCapacityAsync();
    }
    if (FileSystem.getFreeDiskStorageAsync) {
      info.freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
    }
  } catch (error) {
    console.warn('Could not get storage info:', error);
  }

  return info;
};

/**
 * Gets detailed information about a specific image file
 */
export const getImageDebugInfo = async (uri: string): Promise<ImageDebugInfo> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return {
      uri,
      exists: fileInfo.exists,
      size: fileInfo.exists ? (fileInfo as any).size || 0 : 0,
      isDirectory: fileInfo.exists ? (fileInfo as any).isDirectory || false : false,
      modificationTime: fileInfo.exists ? (fileInfo as any).modificationTime || 0 : 0,
    };
  } catch (error) {
    return {
      uri,
      exists: false,
      size: 0,
      isDirectory: false,
      modificationTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Lists all transaction-related images in the document directory
 */
export const listTransactionImages = async (): Promise<string[]> => {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) return [];

    const files = await FileSystem.readDirectoryAsync(documentDirectory);
    return files.filter(file => 
      file.startsWith('transaction_') && 
      (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    );
  } catch (error) {
    console.error('Error listing transaction images:', error);
    return [];
  }
};

/**
 * Generates a comprehensive debug report for image issues
 */
export const generateImageDebugReport = async (imageUri?: string): Promise<string> => {
  const fsInfo = await getFileSystemDebugInfo();
  const imageFiles = await listTransactionImages();
  
  let report = `📱 IMAGE DEBUG REPORT\n`;
  report += `===================\n\n`;
  
  report += `🔧 SYSTEM INFO:\n`;
  report += `Platform: ${fsInfo.platform}\n`;
  report += `Is Device: ${fsInfo.isDevice}\n`;
  report += `App Ownership: ${fsInfo.appOwnership}\n`;
  report += `Document Directory: ${fsInfo.documentDirectory}\n`;
  report += `Cache Directory: ${fsInfo.cacheDirectory}\n`;
  report += `Bundle Directory: ${fsInfo.bundleDirectory}\n`;
  
  if (fsInfo.totalDiskCapacity) {
    report += `Total Disk: ${(fsInfo.totalDiskCapacity / (1024 * 1024 * 1024)).toFixed(2)} GB\n`;
  }
  if (fsInfo.freeDiskStorage) {
    report += `Free Storage: ${(fsInfo.freeDiskStorage / (1024 * 1024 * 1024)).toFixed(2)} GB\n`;
  }
  
  report += `\n📁 TRANSACTION IMAGES:\n`;
  report += `Total Files: ${imageFiles.length}\n`;
  
  for (const file of imageFiles) {
    const fullPath = `${fsInfo.documentDirectory}${file}`;
    const imageInfo = await getImageDebugInfo(fullPath);
    report += `- ${file}: ${imageInfo.exists ? 'EXISTS' : 'MISSING'} (${imageInfo.size} bytes)\n`;
  }
  
  if (imageUri) {
    report += `\n🖼️ SPECIFIC IMAGE INFO:\n`;
    const imageInfo = await getImageDebugInfo(imageUri);
    report += `URI: ${imageInfo.uri}\n`;
    report += `Exists: ${imageInfo.exists}\n`;
    report += `Size: ${imageInfo.size} bytes\n`;
    report += `Is Directory: ${imageInfo.isDirectory}\n`;
    report += `Modified: ${new Date(imageInfo.modificationTime).toISOString()}\n`;
    if (imageInfo.error) {
      report += `Error: ${imageInfo.error}\n`;
    }
  }
  
  return report;
};

/**
 * Logs debug information to console
 * Only logs in development or when explicitly enabled
 */
export const logImageDebug = async (message: string, imageUri?: string) => {
  if (__DEV__ || Constants.appOwnership === 'expo') {
    console.log(`[IMAGE DEBUG] ${message}`);
    if (imageUri) {
      const report = await generateImageDebugReport(imageUri);
      console.log(report);
    }
  }
};
