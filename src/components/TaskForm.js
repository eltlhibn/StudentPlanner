import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PRIORITIES, PRIORITY_STYLES, colors } from '@/constants/theme';
import { Field, FormHeader, Screen } from '@/components/Common';
import { CalendarIcon } from '@/components/Icons';
import { formatDate, parseDueDate } from '@/utils/deadlines';

/**
 * SHARED TASK FORM (used by Add Task and Edit Task)
 * -----------------------------------------------
 * Fields: Title, Subject (plain text), Priority, Deadline, Description.
 *
 * It has two looks, picked by whether `onCancel` is passed:
 *  - Edit (modal):  pass `onCancel`  -> Cancel · Title · Save bar at the top.
 *  - Add Task (tab): no `onCancel`   -> page title at the top and an "Add Task" button at the bottom.
 *
 * The form starts empty on Add Task (the student must pick a priority) and pre-filled on
 * Edit Task (it receives `initial`). The Add Task tab re-mounts the form (via `key`) to clear it.
 */
export default function TaskForm({ heading, initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  // One state variable per text field: this is what makes them controlled inputs.
  const [title, setTitle] = useState(initial?.title || '');
  const [subject, setSubject] = useState(initial?.subject || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  // Priority starts EMPTY so no badge is highlighted before the student chooses one.
  // On Edit Task `initial.priority` is used instead, so the saved badge comes back.
  const [priority, setPriority] = useState(initial?.priority || '');

  // Is the calendar popup open? (false = closed)
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isModal = typeof onCancel === 'function';

  /**
   * VALIDATION
   * Returns one message for every required field that is still empty, or {} when all
   * of them are filled in. It runs on every render, so a message disappears the moment
   * the student fills that field in.
   */
  function findMissingFields() {
    const missing = {};
    if (!title.trim()) missing.title = 'Please enter a title.';
    if (!priority) missing.priority = 'Please choose High, Medium or Low.';
    if (!dueDate.trim()) missing.dueDate = 'Please enter or pick a deadline.';
    return missing;
  }

  const missing = findMissingFields();

  // Nothing missing -> both Save buttons unlock.
  const canSave = Object.keys(missing).length === 0;

  /**
   * The calendar opens on the date already typed (an old task may say "Thursday, Dec 5"),
   * or on today for a new task.
   */
  const calendarDate = parseDueDate(dueDate) || new Date();

  function handleDatePicked(event, selectedDate) {
    setShowDatePicker(false); // close the popup (Android closes the dialog itself)
    if (selectedDate) setDueDate(formatDate(selectedDate)); // save it as "2026-12-05"
  }

  function handleSave() {
    if (!canSave) return; // belt and braces: the buttons are disabled anyway
    onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      priority,
      dueDate: dueDate.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Screen edges={isModal ? ['top', 'bottom'] : ['top']}>
      {isModal ? (
        <FormHeader title={heading} onCancel={onCancel} onSave={handleSave} saveDisabled={!canSave} />
      ) : (
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>{heading}</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Every field is wrapped in its own View; the space between fields comes
              from the `gap` on styles.content, the space inside a field from the label. */}

          <View>
            <Text style={styles.label}>Title</Text>
            <Field
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              style={styles.input}
            />
            {missing.title ? <Text style={styles.error}>{missing.title}</Text> : null}
          </View>

          <View>
            <Text style={styles.label}>Subject</Text>
            <Field
              placeholder="e.g. Mobile Programming"
              value={subject}
              onChangeText={setSubject}
              returnKeyType="next"
              style={styles.input}
            />
          </View>

          <View>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(name => {
                const badgeColors = PRIORITY_STYLES[name];
                const isSelected = priority === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setPriority(name)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.priorityBtn,
                      { backgroundColor: badgeColors.bg },
                      // Only the tapped badge gets the colored border (the "selected" look).
                      isSelected && { borderColor: badgeColors.text },
                    ]}
                  >
                    <Text style={[styles.priorityText, { color: badgeColors.text }]}>{name}</Text>
                  </Pressable>
                );
              })}
            </View>
            {missing.priority ? <Text style={styles.error}>{missing.priority}</Text> : null}
          </View>

          <View>
            <Text style={styles.label}>Deadline</Text>
            {/* Type a date, or tap the calendar button to pick one. */}
            <View style={styles.dateRow}>
              <Field
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                autoCapitalize="none"
                style={[styles.input, styles.dateInput]}
              />
              {/* The picker library has no web version, so this button is phones only. */}
              {Platform.OS !== 'web' && (
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Pick a deadline from the calendar"
                >
                  <CalendarIcon />
                </Pressable>
              )}
            </View>
            {missing.dueDate ? <Text style={styles.error}>{missing.dueDate}</Text> : null}
          </View>

          <View>
            <Text style={styles.label}>Description</Text>
            <Field
              placeholder="Add notes or instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </View>

          {!isModal && (
            <Pressable
              style={[styles.submitBtn, !canSave && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text style={styles.submitText}>{submitLabel}</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CALENDAR POPUP
          Android opens its own calendar dialog and closes it by itself, so we only hide it.
          iOS shows a small wheel, so we put it in this popup with a Done button. */}
      {showDatePicker && Platform.OS !== 'web' && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.pickerBackdrop} onPress={() => setShowDatePicker(false)}>
            <View style={styles.pickerBox}>
              <DateTimePicker
                value={calendarDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={handleDatePicked}
                onDismiss={() => setShowDatePicker(false)}
              />
              <Pressable
                style={styles.pickerDone}
                onPress={() => setShowDatePicker(false)}
                accessibilityRole="button"
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Page title (Add Task tab): left-aligned, same style as the other tab headers.
  pageHeader: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.text,
  },

  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 14 },

  // Small uppercase label above each field (TITLE, SUBJECT, PRIORITY, ...).
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  // Compact inputs: extends the shared `Field` input style (white card, light border).
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  // Description stays taller than the other fields.
  textArea: { minHeight: 88, textAlignVertical: 'top' },

  // Red message shown under a required field that was left empty.
  error: { fontSize: 12, color: colors.danger, marginTop: 6 },

  // Deadline: the text box plus the calendar button sitting next to it.
  dateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dateInput: { flex: 1 },
  dateButton: {
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  // Priority pills: equal width, tinted background, selected one gets a colored border.
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityText: { fontSize: 14, fontWeight: '600' },

  submitBtn: {
    marginTop: 6,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  // The button is dimmed while a required field is still empty.
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { color: colors.white, fontSize: 15, fontWeight: '600' },

  // Calendar popup: dimmed screen behind, white card with the picker in it.
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    gap: 4,
    alignSelf: 'stretch',
  },
  pickerDone: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 14 },
  pickerDoneText: { fontSize: 16, fontWeight: '600', color: colors.primary },
});