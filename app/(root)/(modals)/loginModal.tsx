import { useGlobalContext } from "@/lib/global-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { login, register } from "@/lib/services/user/user";
import Ionicons from "@expo/vector-icons/Ionicons";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const LoginModal = () => {
  const { isNetworkEnabled, refetchUserLocal } = useGlobalContext();
  const { t } = useTranslation();
  const { mode } = useLocalSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Set initial mode based on URL parameter
  useEffect(() => {
    if (mode === "register") {
      setIsLoginMode(false);
    } else {
      setIsLoginMode(true);
    }
  }, [mode]);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("common.error"), t("auth.emailAndPasswordRequired"));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t("common.error"), t("auth.invalidEmail"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({
        input: { email, password },
        networkEnabled: isNetworkEnabled,
      });
      if (!result) {
        setIsLoading(false);
        Alert.alert(t("common.error"), t("auth.loginFailed"));
        return;
      }
      await refetchUserLocal();
      router.back();
    } catch (error) {
      Alert.alert(t("common.error"), t("auth.unexpectedError"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setIsLoading(false);
      Alert.alert(t("common.error"), t("auth.completeAllFields"));
      return;
    }

    if (password.length < 8) {
      setIsLoading(false);
      Alert.alert(t("common.error"), t("auth.passwordMinLength"));
      return;
    }

    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      Alert.alert(t("common.error"), t("auth.invalidEmail"));
      return;
    }

    if (!acceptedTerms) {
      setIsLoading(false);
      Alert.alert(t("common.error"), t("auth.termsAcceptanceRequired"));
      return;
    }

    // Pendign - Show subscription modal instead of registering directly
    // setShowSubscriptionModal(true);

    // Provicional registration logic
    const result = await register({
      networkEnabled: isNetworkEnabled,
      input: {
        email: email,
        password: password,
        name: name,
      },
    });
    if (!result) {
      setIsLoading(false);
      Alert.alert(t("common.error"), t("modals.loginModal.registrationFailed"));
      return;
    }

    await refetchUserLocal();
    setIsLoading(false);
    Alert.alert(
      t("common.success"),
      t("modals.loginModal.registrationSuccess")
    );
    router.back();
  };

  return (
    <SafeAreaView className="bg-primary-100 h-full p-5">
      {/* Header with close button */}
      <View className="relative flex-row justify-center items-center mt-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 top-0"
        >
          <Ionicons name="close-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">
          {t("modals.loginModal.accessToAccount")}
        </Text>
      </View>
      {/* Cloud sync icon */}
      {/* <View className="items-center mt-3">
        <View className="size-14 bg-neutral-600 rounded-full items-center justify-center mb-4">
          <Ionicons name="cloud-done-outline" size={30} color="#fff" />
        </View>
        <Text className="text-neutral-200 text-center text-xs px-8">
          {t("modals.loginModal.cloudSyncDescription")}
        </Text>
      </View> */}
      {/* Segmented Control */}
      <View className="mt-4">
        <SegmentedControl
          values={[
            t("modals.loginModal.createNewProfile"),
            t("modals.loginModal.signIn"),
          ]}
          selectedIndex={isLoginMode ? 1 : 0}
          tintColor="#6B7280"
          fontStyle={{ color: "#fff" }}
          activeFontStyle={{ color: "#fff" }}
          onChange={(event) => {
            const selectedValue = event.nativeEvent.value;
            const newMode = selectedValue === t("modals.loginModal.signIn");
            setIsLoginMode(newMode);
            // Clear form when switching modes
            setName("");
            setEmail("");
            setPassword("");
            setAcceptedTerms(false);
            setShowPassword(false);
          }}
        />
      </View>
      {/* Form inputs */}
      <View className="flex-col gap-4 mt-4">
        {!isLoginMode && (
          <View>
            <View className="bg-primary-300 rounded-xl py-4 px-5">
              <TextInput
                className="text-white"
                placeholder={t("modals.loginModal.enterName")}
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}
        <View>
          <View className="bg-primary-300 rounded-xl py-4 px-5">
            <TextInput
              className="text-white"
              placeholder={t("modals.loginModal.enterEmail")}
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View>
          <View className="bg-primary-300 rounded-xl py-4 px-5 flex-row items-center">
            <TextInput
              className="text-white flex-1"
              placeholder={t("modals.loginModal.enterPassword")}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="ml-2"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {!isLoginMode && (
            <Text className="text-neutral-400 text-xs mt-2 px-1">
              {t("modals.loginModal.passwordRequirement")}
            </Text>
          )}
        </View>
      </View>
      {/* Terms acceptance for registration */}
      {!isLoginMode && (
        <TouchableOpacity
          className="flex-row items-start mt-6 px-1"
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View
            className={`w-5 h-5 border-2 rounded mr-3 mt-1 items-center justify-center ${
              acceptedTerms
                ? "border-accent-200 bg-accent-200"
                : "border-neutral-400"
            }`}
          >
            {acceptedTerms && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="text-neutral-400 text-sm flex-1">
            {t("modals.loginModal.termsText")}
            <Text
              className="text-accent-200 underline"
              onPress={() => setShowTermsModal(true)}
            >
              {t("modals.loginModal.termsLink")}
            </Text>
            {t("modals.loginModal.termsService")}
          </Text>
        </TouchableOpacity>
      )}
      {/* Action button */}
      <TouchableOpacity
        className="mt-8 bg-accent-200 flex-row justify-center items-center py-4 rounded-xl"
        onPress={isLoginMode ? handleLogin : handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-bold mr-2">
              {isLoginMode
                ? t("modals.loginModal.signInButton")
                : t("modals.loginModal.signUpButton")}
            </Text>
            {!isLoginMode ? (
              <Ionicons name="lock-closed-outline" size={16} color="#fff" />
            ) : (
              <Ionicons name="log-in-outline" size={16} color="#fff" />
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Terms and Conditions WebView Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">
              {t("modals.loginModal.termsOfUse")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowTermsModal(false)}
              className="p-2"
            >
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{
              uri: "https://www.privacypolicies.com/live/9d0e6784-fcc0-4314-bd3d-f85b314cc9ff",
            }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6B7280" />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginModal;
