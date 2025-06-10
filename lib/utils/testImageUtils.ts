import { generateImageDebugReport } from '@/lib/utils/debugUtils';
import { deleteImage, saveImageToDocuments, verifyImageExists } from '@/lib/utils/imageUtils';
import * as FileSystem from 'expo-file-system';

/**
 * Test suite for image handling utilities
 * Run this in development to verify functionality
 */
export const runImageTests = async (): Promise<void> => {
  console.log('🧪 Starting Image Utility Tests...');

  try {
    // Test 1: Verify document directory access
    console.log('\n📁 Test 1: Document Directory Access');
    const docDir = FileSystem.documentDirectory;
    console.log(`Document Directory: ${docDir}`);
    
    if (!docDir) {
      throw new Error('Document directory not available');
    }

    // Test 2: Generate debug report
    console.log('\n🔍 Test 2: Debug Report Generation');
    const debugReport = await generateImageDebugReport();
    console.log('Debug report generated successfully');
    console.log('Report length:', debugReport.length, 'characters');

    // Test 3: Test file verification with non-existent file
    console.log('\n❌ Test 3: Non-existent File Verification');
    const fakeUri = `${docDir}nonexistent_file.jpg`;
    const exists = await verifyImageExists(fakeUri);
    console.log(`Non-existent file check: ${exists ? '❌ FAILED' : '✅ PASSED'}`);

    // Test 4: Create a test file and verify it
    console.log('\n📝 Test 4: Test File Creation and Verification');
    const testContent = 'This is a test file for image utilities';
    const testUri = `${docDir}test_image_utils.txt`;
    
    await FileSystem.writeAsStringAsync(testUri, testContent);
    const testExists = await verifyImageExists(testUri);
    console.log(`Test file verification: ${testExists ? '✅ PASSED' : '❌ FAILED'}`);

    // Test 5: Delete test file
    console.log('\n🗑️ Test 5: File Deletion');
    const deleteSuccess = await deleteImage(testUri);
    console.log(`File deletion: ${deleteSuccess ? '✅ PASSED' : '❌ FAILED'}`);

    // Test 6: Verify file is gone
    console.log('\n🔍 Test 6: Post-deletion Verification');
    const stillExists = await verifyImageExists(testUri);
    console.log(`Post-deletion check: ${!stillExists ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  }
};

/**
 * Test image saving with a mock image URI
 * This simulates the image picker flow
 */
export const testImageSaving = async (mockImageUri?: string): Promise<boolean> => {
  try {
    console.log('🖼️ Testing image saving functionality...');

    // Use a mock URI if none provided
    const testUri = mockImageUri || 'file:///mock/path/test_image.jpg';
    
    // This will fail for a mock URI, but we can test the error handling
    const result = await saveImageToDocuments(testUri, 'test');
    
    if (result.success) {
      console.log(`✅ Image saved successfully: ${result.uri}`);
      
      // Clean up test file
      if (result.uri) {
        await deleteImage(result.uri);
      }
      
      return true;
    } else {
      console.log(`ℹ️ Expected failure for mock URI: ${result.error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`ℹ️ Expected error for mock test: ${error}`);
    return false;
  }
};

/**
 * Test the debug logging functionality
 */
export const testDebugLogging = async (): Promise<void> => {
  console.log('📊 Testing debug logging...');
  
  const { logImageDebug } = await import('@/lib/utils/debugUtils');
  
  await logImageDebug('Test debug message');
  await logImageDebug('Test debug with URI', 'file:///test/path.jpg');
  
  console.log('✅ Debug logging test completed');
};

// Export all tests as a single function for easy execution
export const runAllImageTests = async (): Promise<void> => {
  console.log('🚀 Running Complete Image Test Suite...\n');
  
  await runImageTests();
  await testImageSaving();
  await testDebugLogging();
  
  console.log('\n🎉 All image tests completed successfully!');
};
