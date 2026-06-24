'use strict';
const React = require('react');
const { View } = require('react-native');

const make =
  (name) =>
  ({ children, ...rest }) =>
    React.createElement(View, { testID: name }, children ?? null);

const Canvas = make('Canvas');
const Group = make('Group');
const Path = () => null;
const SkText = () => null;
const SkImage = () => null;

const matchFont = () => ({
  measureText: (text) => ({
    width: typeof text === 'string' ? text.length * 8 : 0,
  }),
});
const useImage = () => null;

module.exports = {
  __esModule: true,
  Canvas,
  Group,
  Path,
  Text: SkText,
  Image: SkImage,
  matchFont,
  useImage,
};
