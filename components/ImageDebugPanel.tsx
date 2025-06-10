import { generateImageDebugReport, listTransactionImages } from '@/lib/utils/debugUtils';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

interface ImageDebugPanelProps {
  visible?: boolean;
  onClose?: () => void;
}

const ImageDebugPanel: React.FC<ImageDebugPanelProps> = ({ visible = false, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const report = await generateImageDebugReport();
      setDebugInfo(report);
    } catch (error) {
      setDebugInfo(`Error generating report: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const shareReport = async () => {
    if (!debugInfo) {
      Alert.alert('No Report', 'Please generate a report first.');
      return;
    }

    try {
      await Share.share({
        message: debugInfo,
        title: 'Image Debug Report',
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };  const runTests = async () => {
    Alert.alert(
      'Run Tests', 
      'This feature runs comprehensive image utility tests. Check the console for results.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Tests',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('🧪 Running basic image tests...');
              
              // Basic file system check
              const debugReport = await generateImageDebugReport();
              console.log('Generated debug report successfully');
              
              // List transaction images
              const images = await listTransactionImages();
              console.log(`Found ${images.length} transaction images`);
              
              Alert.alert('Tests Complete', `Basic tests completed. Found ${images.length} images. Check console for details.`);
            } catch (error) {
              Alert.alert('Test Failed', `Error: ${error}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const clearImageCache = async () => {
    Alert.alert(
      'Clear Image Cache',
      'This will delete all transaction images. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const images = await listTransactionImages();
              // Implementation would go here to delete images
              Alert.alert('Success', `Would delete ${images.length} images`);
            } catch (error) {
              Alert.alert('Error', `Failed to clear cache: ${error}`);
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  // Only show in development or Expo builds
  if (!__DEV__ && Constants.appOwnership !== 'expo') {
    return null;
  }

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 z-50">
      <View className="bg-gray-900 m-4 mt-16 rounded-lg p-4 flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Image Debug Panel</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-white text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={generateReport}
            disabled={loading}
            className="bg-blue-600 px-3 py-2 rounded flex-1"
          >
            <Text className="text-white text-center text-xs">
              {loading ? 'Generating...' : 'Generate Report'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={shareReport}
            disabled={!debugInfo}
            className="bg-green-600 px-3 py-2 rounded flex-1"
          >
            <Text className="text-white text-center text-xs">Share Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={runTests}
            disabled={loading}
            className="bg-purple-600 px-3 py-2 rounded flex-1"
          >
            <Text className="text-white text-center text-xs">Run Tests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearImageCache}
            className="bg-red-600 px-3 py-2 rounded flex-1"
          >
            <Text className="text-white text-center text-xs">Clear Cache</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 bg-gray-800 p-3 rounded">
          <Text className="text-green-400 font-mono text-xs">
            {debugInfo || 'No debug information generated yet. Tap "Generate Report" to start.'}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default ImageDebugPanel;
