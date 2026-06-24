'use strict';
const React = require('react');
const { View } = require('react-native');

const GestureDetector = ({ children }) => children ?? null;
GestureDetector.displayName = 'GestureDetector';

const GestureHandlerRootView = ({ children, ...rest }) =>
  React.createElement(View, rest, children);

const usePanGesture = (_config) => ({
  enabled: true,
  handlers: {},
  simultaneousHandlers: [],
});

class PanGesture {}

module.exports = {
  __esModule: true,
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  PanGesture,
};
