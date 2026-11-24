Pod::Spec.new do |s|
  s.name           = 'StickerMaker'
  s.version        = '1.0.0'
  s.summary        = 'Turns a photo into an outlined sticker'
  s.description    = 'Lifts the subject out of a photo with Vision and outlines it in white.'
  s.author         = 'Alfonso Bribiesca'
  s.homepage       = 'https://alfonsobries.com'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.license        = 'MIT'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.frameworks = 'Vision', 'CoreImage'
end
