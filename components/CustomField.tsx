import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  title,
  value,
  type,
  options = [],
  onChangeText,
}: {
  label: string;
  title?: string;
  value: string;
  type: fieldTypes;
  options?: { label: string; value: string }[];
  onChangeText: (text: string) => void;
}) => {
  return (
    <View className="py-3">
      <Text className="text-neutral-200 text-sm mb-1">{label}</Text>
      <View className="bg-primary-200 rounded-xl border border-primary-300 py-4 px-4">
        {type === fieldTypes.TEXT && (
          <TextInput
            className="text-white text-base"
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.NUMBER && (
          <TextInput
            className="text-white text-base"
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.DATE && (
          <TouchableOpacity onPress={() => console.log('Open date picker')}>
            <Text className="text-white text-base">
              {value || 'Select date'}
            </Text>
          </TouchableOpacity>
        )}
        {type === fieldTypes.SELECT && (
          <Dropdown
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 0,
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
              backgroundColor: '#2A2D3E',
            }}
            iconStyle={{
              tintColor: '#9ca3af',
            }}
            data={options}
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
              backgroundColor: '#2A2D3E',
              marginTop: 4,
              borderRadius: 8,
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
