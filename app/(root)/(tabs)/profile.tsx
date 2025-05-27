import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SectionButton = ({
  children,
  onPress,
  icon,
  className = 'bg-gray-800 p-3 rounded-lg mb-2',
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: React.ReactNode;
  className?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-2">{icon}</View>}
        <Text className="text-white text-lg">{children}</Text>
      </View>
    </TouchableOpacity>
  );
}

const sections = [
  {
    title: 'Edit Profile',
    onPress: () => console.log('Edit Profile Pressed'),
  },
  {
    title: 'Settings',
    onPress: () => console.log('Settings Pressed'),
  },
  {
    title: 'Privacy Policy',
    onPress: () => console.log('Privacy Policy Pressed'),
  },
  {
    title: 'Logout',
    onPress: () => console.log('Logout Pressed'),
  },
];

const profile = () => {
  return (
    <SafeAreaView className="p-5 bg-black h-full">
      <View className="flex-row items-center justify-center mb-5">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>
      <View className="flex-col items-center justify-center mb-10">
        <View className='w-32 h-32 rounded-full bg-white flex items-center justify-center'>
          <Image 
            source={require('../../../assets/images/react-logo.png')}
            resizeMode='contain'
            className='w-28 h-28 rounded-full'
          />
        </View>
        <View className='mt-5 flex-col items-center justify-center'>
          <Text className="text-white text-2xl font-bold">Fernando Castrejon</Text>
          <Text className="text-gray-400">fernandocastrejonh@gmail.com</Text>
        </View>
      </View>
      <View>
        {sections.map((section, index) => (
          <SectionButton
            key={index}
            onPress={section.onPress}
            className="bg-gray-800 p-3 rounded-lg mb-2"
          >
            {section.title}
          </SectionButton>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default profile;
