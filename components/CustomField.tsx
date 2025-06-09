import { useTranslation } from "@/lib/i18n/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

enum fieldTypes {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
}

export const transactionTypes = [
  { label: "transactions.expense", value: "expense" },
  { label: "transactions.income", value: "income" },
];

interface DropdownOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const CustomField = ({
  label,
  title,
  value,
  type,
  options = [],
  placeholder,
  onChangeText,
}: {
  label: string;
  title?: string;
  value: string;
  type: fieldTypes;
  options?: DropdownOption[];
  placeholder?: string;
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
            placeholder={placeholder}
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.NUMBER && (
          <TextInput
            className="text-white px-4"
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor="gray"
          />
        )}
        {type === fieldTypes.DATE && (
          <TouchableOpacity onPress={() => console.log("Open date picker")}>
            <Text className="text-white text-base">
              {value || t("fields.selectDate")}
            </Text>
          </TouchableOpacity>
        )}
        {type === fieldTypes.SELECT && (
          <Dropdown
            style={{
              backgroundColor: "transparent",
              paddingVertical: 0,
              paddingHorizontal: 12,
              borderWidth: 0,
            }}
            activeColor={"#666876"}
            selectedTextStyle={{
              color: "white",
            }}
            itemTextStyle={{
              color: "white",
              fontSize: 14,
            }}
            itemContainerStyle={{
              backgroundColor: "transparent",
              borderBottomWidth: 1,
              borderRadius: 10,
            }}
            data={options.map((option) => ({
              ...option,
              label: option.label.includes(".")
                ? t(option.label as any)
                : option.label,
            }))}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={t("fields.selectOption")}
            placeholderStyle={{
              color: "white",
              fontSize: 14,
            }}
            value={value}
            containerStyle={{
              backgroundColor: "#2A2D3E",
              borderWidth: 0,
              borderRadius: 10,
              top: 24,
              borderColor: "white",
              shadowColor: "black",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 15,
              elevation: 5,
            }}
            renderItem={(item) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                }}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color="white"
                    style={{ marginRight: 12 }}
                  />
                )}
                <Text style={{ color: "white", fontSize: 14 }}>
                  {item.label}
                </Text>
              </View>
            )}
            renderLeftIcon={() => {
              const selectedOption = options.find((opt) => opt.value === value);
              return selectedOption?.icon ? (
                <Ionicons
                  name={selectedOption.icon}
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              ) : null;
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
