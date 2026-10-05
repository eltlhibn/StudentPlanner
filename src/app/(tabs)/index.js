/**
 * TASKS SCREEN ("Tasks" tab / home screen)
 * ------------------------------------------
 * This is the first thing the user sees. It lists all tasks that are NOT done yet
 * (finished tasks live in the Completed tab; ticking a task's checkbox moves it there).
 * - Tasks always come out sorted by nearest deadline (see utils/deadlines.js -> sortByDeadline),
 *   so the closest-due task is always first.
 * - The search box filters the list by task title or subject text.
 * - Tapping a task opens its detail page (app/task/[taskId].js).
 * - New tasks are added from the "Add Task" tab.
 */
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useApp } from '@/state/AppContext';
import { ClipboardEmptyIcon, SearchIcon } from '@/components/Icons';
import TaskCard from '@/components/TaskCard';
import { EmptyState, Screen } from '@/components/Common';
import { sortByDeadline } from '@/utils/deadlines';

export default function TasksScreen() {
  const { tasks } = useApp();
  const [search, setSearch] = useState('');

  // Today's date, shown as "FRIDAY, OCTOBER 2".
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();

  // Keep only the open tasks that match the search text (title or subject),
  // then sort them so the nearest deadline comes first.
  const openTasks = tasks.filter(task => !task.done);
  const searchText = search.trim().toLowerCase();
  const matchingTasks = openTasks.filter(
    task =>
      task.title.toLowerCase().includes(searchText) ||
      (task.subject || '').toLowerCase().includes(searchText),
  );
  const visibleTasks = sortByDeadline(matchingTasks);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>

      {/* FlatList = the scrollable list of task cards. It builds one TaskCard for each item in `data`. */}
      <FlatList
        style={{ flex: 1 }}
        data={visibleTasks}
        keyExtractor={task => task.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Shown above the cards: date and search box.
        ListHeaderComponent={
          <>
            <View style={styles.dateRow}>
              <View>
                <Text style={styles.dateLabel}>
                  {dayName}, {dateStr}
                </Text>
                <Text style={styles.dateTitle}>Today's Schedule</Text>
              </View>
              <Text style={styles.taskCount}>
                {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''} planned
              </Text>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <SearchIcon size={15} color={colors.faint} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tasks or subjects..."
                  placeholderTextColor={colors.faint}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                />
              </View>
            </View>
          </>
        }
        // Shown when there are no cards to display.
        ListEmptyComponent={
          <EmptyState
            icon={<ClipboardEmptyIcon />}
            title={openTasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
            body={
              openTasks.length === 0
                ? 'Open the Add Task tab to add your first task.'
                : 'Try a different search.'
            }
          />
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Page header: left-aligned, lines up with the search bar and cards (20px side padding).
  header: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateLabel: { fontSize: 11, color: colors.muted, fontWeight: '500', letterSpacing: 0.5 },
  dateTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 2 },
  taskCount: { fontSize: 12, color: colors.muted },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
});