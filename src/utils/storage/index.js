import { getStorageType } from '../storageType';
import { focusCycleStorage } from './focusCycleStorage';
import { checklistStorage } from './checklistStorage';
import { linkStorage } from './linkStorage';
import { conceptMapStorage } from './conceptMapStorage';
import { todoStorage } from './todoStorage';
import { testFirebaseConnection, simpleFirebaseTest } from './firebaseUtils';

export const hybridStorage = {
  ...focusCycleStorage,
  ...checklistStorage,
  ...linkStorage,
  ...conceptMapStorage,
  ...todoStorage,

  getStorageInfo: () => {
    return getStorageType();
  },

  testFirebaseConnection,
  simpleFirebaseTest
};