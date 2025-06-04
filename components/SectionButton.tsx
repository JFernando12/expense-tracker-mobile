import icons from '@/constants/icons';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SectionButton = ({
  children,
  onPress,
  icon,
  className = 'bg-secondary-100 p-5 rounded-xl mb-2',
  iconBgColor = 'bg-accent-200',
  showLoading = false,
  showArrow = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  icon?: any;
  className?: string;
  iconBgColor?: string;
  showLoading?: boolean;
  showArrow?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}) => {
  console.log('Showing toggle:', showToggle);
  return (
    <TouchableOpacity
      onPress={showToggle ? undefined : onPress}
      className={`flex-row items-center justify-between ${className}`}
      disabled={showLoading || showToggle}
      activeOpacity={showToggle ? 1 : 0.7}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`size-12 ${iconBgColor} rounded-full items-center justify-center mr-4`}
        >
          {showLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Image source={icon} tintColor="white" className="size-6" />
          )}
        </View>
        <Text className="flex-1 text-white text-lg font-medium">
          {children}
        </Text>
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: '#374151', true: '#3B82F6' }}
          thumbColor={toggleValue ? '#FFFFFF' : '#9CA3AF'}
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
        />
      ) : showArrow && !showLoading ? (
        <View className="ml-2">
          <Image
            source={icons.rightArrow as ImageSourcePropType}
            tintColor="#D1D5DB"
            className="size-4"
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default SectionButton;
