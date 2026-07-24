Pod::Spec.new do |s|
  s.name           = 'WatchBridge'
  s.version        = '1.0.0'
  s.summary        = 'Sends the auth context to the watch app'
  s.description    = 'Keeps the paired watch app able to talk to the API on its own.'
  s.author         = 'Alfonso Bribiesca'
  s.homepage       = 'https://alfonsobries.com'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.license        = 'MIT'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.frameworks = 'WatchConnectivity'
end
