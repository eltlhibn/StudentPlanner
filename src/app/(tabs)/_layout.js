/**
 * BOTTOM TAB BAR LAYOUT
 * ----------------------
 * Defines the three tabs at the bottom of the screen: Tasks, Add Task and Completed.
 * Each <Tabs.Screen name="..."> below corresponds to a file inside this same app/(tabs)/ folder
 * (this is how expo-router turns files into navigable screens automatically):
 *   index.js     -> Tasks
 *   add-task.js  -> Add Task
 *   completed.js -> Completed
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { colors } from '@/constants/theme';
import { AddTaskIcon, CompletedIcon, TasksIcon } from '@/components/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Tasks', tabBarIcon: ({ color }) => <TasksIcon color={color} /> }}
      />
      <Tabs.Screen
        name="add-task"
        options={{ title: 'Add Task', tabBarIcon: ({ color }) => <AddTaskIcon color={color} /> }}
      />
      <Tabs.Screen
        name="completed"
        options={{ title: 'Completed', tabBarIcon: ({ color }) => <CompletedIcon color={color} /> }}
      />
    </Tabs>
  );
}
