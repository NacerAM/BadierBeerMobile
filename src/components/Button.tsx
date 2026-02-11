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
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, variant === "secondary" && styles.textSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontWeight: "600",
    color: "#1A1A1A",
  },
  textSecondary: {
    color: colors.primaryDark,
  },
  disabled: {
    opacity: 0.5,
  },
});
