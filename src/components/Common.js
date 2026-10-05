import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, PRIORITY_STYLES } from '@/constants/theme';
import { CheckIcon } from '@/components/Icons';
import { styles } from '@/styles/common.styles';

/**
 * SHARED UI COMPONENTS
 * ---------------------
 * Small, reusable pieces used across many screens (buttons, badges, form
 * fields, empty states, etc.) so we don't repeat the same styling everywhere.
 * Keeping them here means one visual fix updates every screen that uses it.
 */

/** Full-screen container that respects device safe areas. */
export function Screen({
  children,
  edges = ['top'],
  style,
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

/** Small colored pill showing a task's priority (e.g. "High"). */
export function PriorityBadge({ priority, label }) {
  const c = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Medium;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label ?? priority}</Text>
    </View>
  );
}

/** Round checkbox used to mark a task as done. */
export function Checkbox({
  checked,
  onPress,
  color = colors.primary,
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.checkbox,
        checked && { backgroundColor: color, borderColor: color },
      ]}
    >
      {checked ? <CheckIcon size={12} /> : null}
    </Pressable>
  );
}

/** Friendly placeholder shown when a list has nothing in it yet (e.g. "No tasks yet"). */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.primaryBtn} onPress={onAction} accessibilityRole="button">
          <Text style={styles.primaryBtnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Text input used by the forms. The label is optional (the placeholder can do the job). */
export function Field({ label, style, ...props }) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.faint}
        accessibilityLabel={label ?? props.placeholder}
        {...props}
        style={[styles.input, style]}
      />
    </View>
  );
}

/** Top bar for modal forms: Cancel · Title · Save. */
export function FormHeader({
  title,
  onCancel,
  onSave,
  saveDisabled,
}) {
  return (
    <View style={styles.formHeader}>
      <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button">
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Text style={styles.formTitle}>{title}</Text>
      <Pressable
        onPress={onSave}
        disabled={saveDisabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!saveDisabled }}
      >
        <Text style={[styles.saveText, saveDisabled && { opacity: 0.4 }]}>Save</Text>
      </Pressable>
    </View>
  );
}
