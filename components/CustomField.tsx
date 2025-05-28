import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

enum fieldTypes {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
}

export const transactionTypes = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

const CustomField = ({
  label,
  value,
  type,
  onChangeText,
}: {
  label: string;
  value: string;
  type: fieldTypes;
  onChangeText: (text: string) => void;
}) => {
  return (
    <View className="py-3 px-4">
      <Text className="text-gray-400 text-sm mb-1">{label}</Text>
      <View className="bg-gray-800 rounded-lg border border-gray-700 py-4 px-2">
        {type === fieldTypes.TEXT && (
          <TextInput
            className="text-white"
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.NUMBER && (
          <TextInput
            className="text-white"
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.DATE && (
          <TouchableOpacity onPress={() => console.log('Open date picker')}>
            <Text className="text-white">{value || 'Select date'}</Text>
          </TouchableOpacity>
        )}
        {type === fieldTypes.SELECT && (
          <Dropdown
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 4,
            }}
            activeColor={'#0061FF'}
            itemTextStyle={{
              color: '#ffffff',
              fontSize: 16,
              paddingVertical: 8,
            }}
            selectedTextStyle={{
              color: '#ffffff',
              fontSize: 16,
            }}
            itemContainerStyle={{
              backgroundColor: '#1f2937',
            }}
            iconStyle={{
              tintColor: '#9ca3af',
            }}
            data={transactionTypes}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholderStyle={{
              color: '#9ca3af',
              fontSize: 16,
            }}
            placeholder="Select option"
            value={value}
            containerStyle={{
              backgroundColor: '#1f2937',
              marginTop: 4,
            }}
            onChange={(item) => {
              onChangeText(item.value);
            }}
          />
        )}
      </View>
    </View>
  );
};

export default CustomField;