import { getStorageType } from '../storageType';
import { focusCycleStorage } from './focusCycleStorage';
import { checklistStorage } from './checklistStorage';
import { linkStorage } from './linkStorage';
import { conceptMapStorage } from './conceptMapStorage';
import { todoStorage } from './todoStorage';
import { retrospectiveStorage } from './retrospectiveStorage';
import { testFirebaseConnection, simpleFirebaseTest } from './firebaseUtils';

export const hybridStorage = {
  ...focusCycleStorage,
  ...checklistStorage,
  ...linkStorage,
  ...conceptMapStorage,
  ...todoStorage,
  ...retrospectiveStorage,

  getStorageInfo: () => {
    return getStorageType();
  },

  testFirebaseConnection,
  simpleFirebaseTest
};