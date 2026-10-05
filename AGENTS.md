# StudyTracker

React Native app built with Expo (SDK 57) and Expo Router. It is a simple student task planner: add tasks (with a plain-text subject, deadline, description and priority), tick them off and review them in a Completed list. Data is stored on-device with AsyncStorage.

## Running the app

```bash
npm install
npm start          # then scan the QR code with Expo Go, or press i / a / w
```

Requires Node 22 (see `.mise.toml`). Use the latest Expo Go from the App Store / Play Store, or press `w` to preview in a browser.

## Project structure

The app is written in plain JavaScript (`.js` files, JSX inside). All source lives in `src/`. Imports use the `@/` alias (= `src/`, set in `jsconfig.json`). **UI code = `src/app`, `src/components`, `src/styles`.**

```
src/
├─ app/                 Routes only (Expo Router: every file here is a route)
│  ├─ _layout.js        Root layout: AppProvider, waits for stored data, root Stack
│  ├─ (tabs)/           Bottom tabs
│  │  ├─ _layout.js     Tabs: Tasks, Add Task, Completed
│  │  ├─ index.js       Tasks (/)
│  │  ├─ add-task.js    Add Task
│  │  └─ completed.js   Completed Tasks
│  └─ task/
│     ├─ [taskId].js        Task details (/task/<id>)
│     └─ edit/[taskId].js   Edit task (modal, /task/edit/<id>)
├─ components/          Reusable components only (flat)
│  ├─ Common.js         Screen, Field, Checkbox, PriorityBadge, EmptyState, FormHeader
│  ├─ Icons.js          react-native-svg icons
│  ├─ TaskCard.js
│  └─ TaskForm.js       Shared by Add Task and Edit Task
├─ styles/              ALL StyleSheets, one file per component or screen (*.styles.js)
├─ constants/theme.js   Colours and priority colours
├─ state/AppContext.js  All app state + AsyncStorage persistence. Exposes useApp()
└─ utils/               createId, confirmDelete, deadlines, useSafeBack
```

Rule of thumb: components in `components/`, their styles in `styles/` (named after the component, e.g. `TaskCard.js` -> `styles/task-card.styles.js`; screens likewise, e.g. `app/(tabs)/index.js` -> `styles/tasks.styles.js`). Keep non-screen code out of `src/app`.

The data shape is `Task = { id, title, subject, priority, dueDate, notes, done }`, where `subject` is plain text. It is described at the top of `AppContext.js`. Saves from older versions (`assignments`, `subjectId`) are migrated on load.

## Conventions and gotchas

- **Styling:** React Native `StyleSheet`. Shared colours come from `src/constants/theme.js`; do not hard-code new hex values in screens.
- **Persistence:** `AppContext` loads from AsyncStorage first and only saves once `ready` is true. Do not add a save path that runs before the initial load, or stored data will be overwritten.
- **Hooks:** Never call hooks after an early return. When a screen depends on a record that may not exist (e.g. `/task/edit/[id]`), render a not-found view and mount the hook-using component only when the record exists.
- **Navigation back:** use `useSafeBack()` instead of `router.back()`, so modals opened directly (deep link, web refresh) still have somewhere to go.
- **Confirmations:** use `confirmDelete()` from `src/utils/confirmDelete.js`. `Alert.alert` does nothing on web.
- **Due dates** are free text. `src/utils/deadlines.js` parses common formats ("Dec 5", "12/5", "2026-12-05") for sorting; unparseable dates sort last.
- **Safe areas:** use `Screen` from `@/components/Common` (wraps `react-native-safe-area-context`). Do not use `SafeAreaView` from `react-native`.
- **Tabs import:** `Tabs` comes from `expo-router/js-tabs` (the `expo-router` export is deprecated in SDK 57).
- **Dependencies:** install native modules with `npx expo install <pkg>` so versions match the SDK.

## Dependencies

- Runtime: Expo SDK 57, React 19, React Native 0.86, Expo Router, react-native-svg, AsyncStorage, react-native-safe-area-context, react-native-screens.
- Web preview: react-native-web, react-dom.
