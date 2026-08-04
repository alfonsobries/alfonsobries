import Foundation

/// The synchronized folder may keep the Resources/ hierarchy or flatten it
/// depending on how Xcode ingests it — try both.
enum WatchBundle {
    static func url(name: String, ext: String) -> URL? {
        Bundle.main.url(forResource: name, withExtension: ext)
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Resources")
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Audio")
            ?? Bundle.main.url(forResource: name, withExtension: ext, subdirectory: "Resources/Audio")
    }

    static func decode<T: Decodable>(_ type: T.Type, from name: String) -> T {
        guard let url = url(name: name, ext: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(type, from: data)
        else {
            fatalError("\(name).json missing from the watch bundle")
        }

        return decoded
    }
}
