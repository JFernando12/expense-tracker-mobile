import { useTranslation } from '@/lib/i18n/useTranslation';
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
  { label: 'transactions.expense', value: 'expense' },
  { label: 'transactions.income', value: 'income' },
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
  const { t } = useTranslation();
  return (
    <View className="py-3">
      <Text className="text-neutral-200 text-sm mb-1">{label}</Text>
      <View className="bg-primary-200 rounded-xl border border-primary-300 py-4">
        {type === fieldTypes.TEXT && (
          <TextInput
            className="text-white px-4"
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.NUMBER && (
          <TextInput
            className="text-white px-4"
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.DATE && (
          <TouchableOpacity onPress={() => console.log('Open date picker')}>
            <Text className="text-white text-base">
              {value || t('fields.selectDate')}
            </Text>
          </TouchableOpacity>
        )}
        {type === fieldTypes.SELECT && (
          <Dropdown
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 0,
              paddingHorizontal: 12,
              borderWidth: 0,
            }}
            activeColor={'#666876'}
            selectedTextStyle={{
              color: 'white',
            }}
            itemTextStyle={{
              color: 'white',
              fontSize: 14,
            }}
            itemContainerStyle={{
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderRadius: 10,
            }}
            data={options.map((option) => ({
              ...option,
              label: option.label.includes('.')
                ? t(option.label as any)
                : option.label,
            }))}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={t('fields.selectOption')}
            placeholderStyle={{
              color: 'white',
              fontSize: 14,
            }}
            value={value}
            containerStyle={{
              backgroundColor: '#2A2D3E',
              borderWidth: 0,
              borderRadius: 10,
              top: 24,
              borderColor: 'white',
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 15,
              elevation: 5,
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
