/**
 * APP CONTEXT — where the app's data lives
 * ------------------------------------------
 * This file holds ALL the data (the list of tasks) in one place and shares it with
 * every screen using React's Context API, so we don't have to pass props around.
 *
 * How it works:
 * 1. When the app opens, we LOAD the saved data from the phone (AsyncStorage).
 * 2. Whenever the tasks change, we SAVE them again automatically.
 * 3. Screens get the data and the add/update/delete functions by calling `useApp()`.
 *
 * Defense answers:
 *  - "Where is the data stored?"   -> AsyncStorage (saved on the phone, works offline).
 *  - "How do screens share data?"  -> Context: AppProvider wraps the app, useApp() reads it.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The single key we save our data under.
const STORAGE_KEY = 'study_tracker_data';

/**
 * The shape of our data:
 *
 *  Task = { id, title, subject, priority, dueDate, notes, done }
 *         - subject is plain text typed by the student (e.g. "Mobile Programming")
 *         - priority is 'High', 'Medium' or 'Low'
 *         - dueDate is free text like "2026-10-15" or "Thursday, Dec 5"
 *
 * Stored on the phone as:  { tasks: [...] }
 *
 * What useApp() gives each screen:
 *   tasks, ready,
 *   addTask, updateTask, deleteTask, toggleTaskDone, clearCompletedTasks
 */
const AppContext = createContext(null);

/** Builds a short unique id for a new task (time + a bit of randomness). */
function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Turns the raw saved data into a plain list of tasks.
 * It also understands data written by OLDER versions of the app, so a student never
 * loses their tasks when the app is updated:
 *  - Older saves kept the list under the name `assignments` instead of `tasks`.
 *  - Even older saves had a separate list of subjects and linked each assignment to
 *    one with `subjectId`; here that link is turned into plain subject text.
 */
function readTasks(savedData) {
  const data = savedData || {};

  // Which list did this version save?
  let savedList = [];
  if (Array.isArray(data.tasks)) savedList = data.tasks;
  else if (Array.isArray(data.assignments)) savedList = data.assignments;

  // Only needed for the very old format.
  const oldSubjects = Array.isArray(data.subjects) ? data.subjects : [];

  return savedList.map(item => {
    // Drop subjectId: today's format stores the subject as plain text.
    const { subjectId, ...task } = item;
    if (typeof task.subject === 'string') return task;

    // Find the old subject this assignment pointed at and use its name.
    const oldSubject = oldSubjects.find(subject => subject.id === subjectId);
    return { ...task, subject: (oldSubject && oldSubject.name) || '' };
  });
}

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [ready, setReady] = useState(false);

  // 1. LOAD once when the app starts.
  useEffect(() => {
    async function loadData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setTasks(readTasks(JSON.parse(saved)));
      } catch (error) {
        console.warn('Could not load saved data', error);
      }
      setReady(true);
    }
    loadData();
  }, []);

  // 2. SAVE every time the data changes (but only after loading, so we never overwrite saved data with an empty list).
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks })).catch(error =>
      console.warn('Could not save data', error),
    );
  }, [ready, tasks]);

  // 3. ACTIONS. React needs a NEW array each time (never edit the old one),
  //    so we use [...old, new] to add, .map() to update and .filter() to delete.

  function addTask(task) {
    setTasks(prev => [...prev, { ...task, id: createId() }]);
  }

  function updateTask(id, changes) {
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...changes } : task)));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(task => task.id !== id));
  }

  function toggleTaskDone(id) {
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  // Used by the Completed tab's "Delete all" button.
  function clearCompletedTasks() {
    setTasks(prev => prev.filter(task => !task.done));
  }

  return (
    <AppContext.Provider
      value={{
        tasks,
        ready,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        clearCompletedTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// The hook every screen uses:  const { tasks, addTask } = useApp();
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}