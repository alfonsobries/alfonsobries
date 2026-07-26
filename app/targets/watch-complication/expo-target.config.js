/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'watch-widget',
  name: 'RosarioComplication',
  displayName: 'Oración',
  deploymentTarget: '10.0',
  bundleIdentifier: '.watch.complication',
  colors: {
    $accent: '#ffd78b',
  },
  frameworks: ['SwiftUI', 'WidgetKit'],
};
