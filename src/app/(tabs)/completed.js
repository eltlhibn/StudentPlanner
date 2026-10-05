/**
 * COMPLETED SCREEN ("Completed" tab)
 * -----------------------------------
 * Shows ONLY the tasks that are marked done.
 * - The trash button on a card deletes that one completed task (after a confirmation).
 * - "Delete all" in the header deletes every completed task, after a confirmation.
 * - Unticking a task's checkbox sends it back to the Tasks tab.
 */
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { CheckEmptyIcon } from '@/components/Icons';
import TaskCard from '@/components/TaskCard';
import { EmptyState, Screen } from '@/components/Common';
import { confirmDelete } from '@/utils/confirmDelete';
import { sortByDeadline } from '@/utils/deadlines';

export default function CompletedScreen() {
  const { tasks, deleteTask, clearCompletedTasks } = useApp();

  const completedTasks = sortByDeadline(tasks.filter(task => task.done));

  const handleDeleteOne = task =>
    confirmDelete('Delete Task', `Delete "${task.title}"?`, 'Delete', () => deleteTask(task.id));

  const handleDeleteAll = () =>
    confirmDelete(
      'Delete All Completed',
      `Delete all ${completedTasks.length} completed task${completedTasks.length !== 1 ? 's' : ''}? This cannot be undone.`,
      'Delete All',
      clearCompletedTasks,
    );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Tasks</Text>
        {completedTasks.length > 0 && (
          <Pressable
            onPress={handleDeleteAll}
            hitSlop={8}
            style={styles.deleteAllBtn}
            accessibilityRole="button"
          >
            <Text style={styles.deleteAllText}>Delete all</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={completedTasks}
        keyExtractor={task => task.id}
        renderItem={({ item }) => <TaskCard task={item} onDelete={() => handleDeleteOne(item)} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          completedTasks.length > 0 ? (
            <Text style={styles.count}>
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<CheckEmptyIcon />}
            title="Nothing completed yet"
            body="Tasks you tick off on the Tasks tab will show up here."
          />
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Page header: title on the left, "Delete all" on the right, on the same row.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.text,
  },
  // Normal (not absolute) so it can never overlap the title.
  deleteAllBtn: {
    paddingVertical: 6,
    paddingLeft: 12,
  },
  deleteAllText: { fontSize: 14, fontWeight: '600', color: colors.danger },
  count: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, fontSize: 12, color: colors.muted },
});