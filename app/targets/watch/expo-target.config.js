/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'watch',
  name: 'RosarioWatch',
  displayName: 'Rosario',
  deploymentTarget: '10.0',
  bundleIdentifier: '.watch',
  icon: './assets/icon.png',
  colors: {
    $accent: '#ffd78b',
  },
  frameworks: ['SwiftUI', 'AVFoundation'],
};
