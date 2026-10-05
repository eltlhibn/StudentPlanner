import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, PRIORITY_STYLES } from '@/constants/theme';
import { CheckIcon } from '@/components/Icons';

/**
 * SHARED UI COMPONENTS
 * ---------------------
 * Small, reusable pieces used across many screens (badges, checkboxes, text inputs,
 * empty states, etc.) so we don't repeat the same styling everywhere.
 * Keeping them here means one visual fix updates every screen that uses it.
 */

/** Full-screen container that respects device safe areas. */
export function Screen({ children, edges = ['top'] }) {
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

/** Small colored pill showing a task's priority (e.g. "High"). */
export function PriorityBadge({ priority, label }) {
  // Tasks saved before priority was required may have none, so fall back to Medium.
  const value = priority || 'Medium';
  const badgeColors = PRIORITY_STYLES[value];
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
      <Text style={[styles.badgeText, { color: badgeColors.text }]}>{label ?? value}</Text>
    </View>
  );
}

/** Round checkbox used to mark a task as done. */
export function Checkbox({ checked, onPress, color = colors.primary }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.checkbox, checked && { backgroundColor: color, borderColor: color }]}
    >
      {checked ? <CheckIcon size={12} /> : null}
    </Pressable>
  );
}

/** Friendly placeholder shown when a list has nothing in it yet (e.g. "No tasks yet"). */
export function EmptyState({ icon, title, body }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

/** Text input used by the forms (the screen prints its own label above it). */
export function Field({ style, ...props }) {
  return (
    <TextInput
      placeholderTextColor={colors.faint}
      {...props}
      style={[styles.input, style]}
    />
  );
}

/** Top bar for modal forms: Cancel · Title · Save. `saveDisabled` greys Save out until the form is valid. */
export function FormHeader({ title, onCancel, onSave, saveDisabled }) {
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.checkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  empty: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  cancelText: { fontSize: 16, color: colors.muted },
  formTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  saveText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});