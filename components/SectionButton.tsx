import { Image, Text, TouchableOpacity, View } from "react-native";

const SectionButton = ({
  children,
  onPress,
  icon,
  className = 'bg-primary-300 p-4 rounded-xl mb-3',
  iconBgColor = 'bg-accent-200',
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: any;
  className?: string;
  iconBgColor?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center">
        <View
          className={`size-10 ${iconBgColor} rounded-full items-center justify-center mr-5`}
        >
          <Image source={icon} tintColor="white" className="size-5" />
        </View>
        <Text className="flex-1 text-white text-2xl font-medium">
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SectionButton;