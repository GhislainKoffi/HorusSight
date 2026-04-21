/**
 * In-memory store for HorusSight demo.
 * This simulates a database until a real one (SQLite/Supabase) is connected.
 */

// We use global to persist data during Next.js Hot Module Replacement in dev
const globalWithStore = global as typeof globalThis & {
  scans: any[];
  securityLogs: any[];
  users: any[];
};

// Initialize only if not already present to survive HMR
if (!globalWithStore.scans) {
  globalWithStore.scans = [];
}
if (!globalWithStore.securityLogs) {
  globalWithStore.securityLogs = [];
}
if (!globalWithStore.users) {
  globalWithStore.users = [];
}

export const scans = globalWithStore.scans;
export const securityLogs = globalWithStore.securityLogs;
export const users = globalWithStore.users;
