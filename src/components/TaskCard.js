import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { Checkbox, PriorityBadge } from '@/components/Common';
import { TrashIcon } from '@/components/Icons';

/**
 * TASK CARD
 * ----------
 * One task shown as a card (used on the Tasks and Completed tabs).
 * - Tapping the card navigates to the full task detail screen.
 * - Tapping the round checkbox marks the task done/not done without leaving this screen.
 * - If `onDelete` is passed (Completed tab), a trash button is shown on the right.
 */
export default function TaskCard({ task, onDelete }) {
  const router = useRouter();
  const { toggleTaskDone } = useApp();

  return (
    <Pressable
      onPress={() => router.push(`/task/${task.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        task.done && styles.cardDone,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.row}>
        <Checkbox checked={task.done} onPress={() => toggleTaskDone(task.id)} />
        <View style={styles.content}>
          <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
          <PriorityBadge priority={task.priority} />
          <Text style={styles.meta}>{task.subject || 'No subject'}</Text>
          {task.dueDate ? <Text style={styles.meta}>Due {task.dueDate}</Text> : null}
        </View>
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            style={styles.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${task.title}`}
          >
            <TrashIcon />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardDone: { opacity: 0.55 },
  row: { flexDirection: 'row', gap: 12 },
  content: { flex: 1, gap: 5 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.faint },
  meta: { fontSize: 13, color: colors.muted },
  deleteBtn: { padding: 4, alignSelf: 'flex-start' },
});