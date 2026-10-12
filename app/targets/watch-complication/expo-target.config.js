/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'watch-widget',
  name: 'AlfonsoComplication',
  displayName: 'Alfonso',
  deploymentTarget: '10.0',
  bundleIdentifier: '.watch.widget',
  colors: {
    $accent: '#ffd78b',
  },
  frameworks: ['SwiftUI', 'WidgetKit'],
};
