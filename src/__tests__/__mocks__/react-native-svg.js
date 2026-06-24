'use strict';
const React = require('react');
const { Text, View } = require('react-native');

// Generic container — forwards children into a View
const makeView = (name) =>
  React.forwardRef(({ children }, ref) =>
    React.createElement(View, { testID: name, ref }, children ?? null)
  );

// Text-capable container — children may be strings
const makeText = (name) =>
  React.forwardRef(({ children }, ref) =>
    React.createElement(Text, { testID: name, ref }, children ?? null)
  );

// Leaf elements — no children expected
const makeLeaf = () => () => null;

const Svg = makeView('Svg');
Svg.displayName = 'Svg';

module.exports = Svg;
module.exports.default = Svg;
module.exports.__esModule = true;
module.exports.G = makeView('G');
module.exports.Path = makeLeaf();
module.exports.Circle = makeLeaf();
module.exports.Text = makeText('SvgText');
module.exports.Image = makeLeaf();
module.exports.ForeignObject = makeView('ForeignObject');
module.exports.Rect = makeLeaf();
module.exports.Defs = makeView('Defs');
module.exports.ClipPath = makeView('ClipPath');
