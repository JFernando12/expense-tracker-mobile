import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { TranslationKey } from "@/lib/i18n/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { router } from "expo-router";
import React from "react";
import {
    Image,
    ImagePropsBase,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Header = ({ title }: { title: TranslationKey }) => {
  const { userLocal } = useGlobalContext();
  const { t } = useTranslation();

  const initials = userLocal?.name
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-white text-2xl font-bold">{t(`${title}`)}</Text>
      <TouchableOpacity
        onPress={() => router.push("/(root)/(tabs)/profile")}
        className="size-10 rounded-full overflow-hidden bg-accent-200 flex items-center justify-center"
      >
        {userLocal?.isLoggedIn && userLocal?.name ? (
          <Text
            className="text-white text-lg font-bold"
            style={{ includeFontPadding: false }}
          >
            {initials}
          </Text>
        ) : (
          <Image
            source={images.avatar as ImagePropsBase}
            className="size-5"
            tintColor="white"
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;
