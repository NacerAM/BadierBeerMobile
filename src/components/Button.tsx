import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  style,
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.textSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",

    shadowColor: colors.shadow as any,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },

  text: {
    fontWeight: "800",
    fontSize: 15,
    color: "#2E1A0F",
    letterSpacing: 0.3,
  
    backgroundColor: "transparent",
  },

  textSecondary: {
    color: colors.primaryDark,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.15,
  },

  disabled: {
    opacity: 0.5,
  },
});




