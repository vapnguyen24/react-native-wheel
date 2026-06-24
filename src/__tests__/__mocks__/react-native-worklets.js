'use strict';
const NOOP = () => {};
const ID = (v) => v;

const RuntimeKind = { ReactNative: 0, UI: 1 };

module.exports = {
  __esModule: true,
  RuntimeKind,
  WorkletsModule: {},
  // Called from Reanimated source via our moduleNameMapper
  createSerializable: ID,
  isWorkletFunction: () => false,
  makeShareable: ID,
  makeShareableCloneRecursive: ID,
  serializableMappingCache: new Map(),
  runOnUISync: (fn) => fn(),
  scheduleOnRN: (fn, ...args) => {
    if (typeof fn === 'function') fn(...args);
  },
  scheduleOnUI: (fn, ...args) => {
    if (typeof fn === 'function') fn(...args);
  },
  runOnJS: (fn) => fn,
  runOnUI:
    (fn) =>
    (...args) =>
      fn(...args),
  callMicrotasks: NOOP,
};
