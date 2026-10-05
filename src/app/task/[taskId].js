/**
 * TASK DETAIL SCREEN (opened by tapping any task card)
 * ---------------------------------------------------------------
 * Shows everything about one task: subject, priority, due date and notes.
 * - The task can still be marked done/undone from its checkbox on the
 *   task list (TaskCard) — there's no separate complete button on this screen.
 * - "Edit" opens app/edit-task/[taskId].js pre-filled with this task's data.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { BackIcon } from '@/components/Icons';
import { PriorityBadge, Screen } from '@/components/Common';
import { confirmDelete } from '@/utils/confirmDelete';
import { useSafeBack } from '@/utils/useSafeBack';

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const goBack = useSafeBack();
  const { tasks, deleteTask } = useApp();

  // The id comes from the URL, so we look the task up in the shared data.
  const task = tasks.find(item => item.id === taskId);

  if (!task) {
    return (
      <Screen>
        <Pressable onPress={goBack} style={styles.notFoundBack} accessibilityRole="button" accessibilityLabel="Back">
          <BackIcon />
        </Pressable>
        <Text style={styles.notFound}>Task not found.</Text>
      </Screen>
    );
  }

  const handleDelete = () =>
    confirmDelete('Delete Task', `Delete "${task.title}"?`, 'Delete', () => {
      goBack();
      deleteTask(task.id);
    });

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <BackIcon />
        </Pressable>
        <Text style={styles.topBarTitle}>Task</Text>
        <Pressable
          onPress={() => router.push(`/edit-task/${task.id}`)}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroMeta}>
            {task.subject ? (
              <View style={styles.subjBadge}>
                <Text style={styles.subjBadgeText}>Subject: {task.subject}</Text>
              </View>
            ) : null}
            <PriorityBadge priority={task.priority} label={`${task.priority} priority`} />
          </View>
          <Text style={styles.heroTitle}>{task.title}</Text>
          {task.dueDate ? <Text style={styles.heroSub}>Due {task.dueDate}</Text> : null}
        </View>

        {task.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        ) : null}

        <Pressable style={styles.deleteBtn} onPress={handleDelete} accessibilityRole="button">
          <Text style={styles.deleteBtnText}>Delete task</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  notFoundBack: { padding: 4, alignSelf: 'flex-start', marginLeft: 16, marginTop: 12 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  editText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  notFound: { padding: 20, color: colors.muted },
  hero: { paddingHorizontal: 20, paddingBottom: 16 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  subjBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
  },
  subjBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  heroTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 6 },
  heroSub: { fontSize: 13, color: colors.muted },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  notesText: { fontSize: 14, color: colors.textBody, lineHeight: 21 },
  deleteBtn: { marginHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  deleteBtnText: { color: colors.danger, fontSize: 14, fontWeight: '500' },
});