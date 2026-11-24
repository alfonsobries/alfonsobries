import CoreImage
import CoreImage.CIFilterBuiltins
import ExpoModulesCore
import Vision

struct StickerOptions: Record {
  @Field var liftSubject: Bool = true
}

public class StickerMakerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("StickerMaker")

    AsyncFunction("makeSticker") { (uri: String, options: StickerOptions) -> [String: Any] in
      try StickerMaker().make(from: uri, liftSubject: options.liftSubject)
    }
  }
}

enum StickerMakerError: Error, CustomStringConvertible {
  case unreadableImage
  case encodingFailed

  var description: String {
    switch self {
    case .unreadableImage: return "The photo could not be read."
    case .encodingFailed: return "The sticker could not be saved."
    }
  }
}

/// Builds a die-cut sticker from a photo: Vision lifts the subject (the same
/// model as "Copy Subject" in Photos), then the outline is grown out of the
/// cutout's alpha and filled white. When there is no clear subject, or lifting
/// is off, the whole photo becomes a rounded sticker instead.
final class StickerMaker {
  /// Longest side of the stored sticker; plenty for a phone grid and a print.
  private let outputSide: CGFloat = 1024
  /// Longest side handed to Vision; larger only costs time.
  private let analysisSide: CGFloat = 2048
  private let context = CIContext(options: [.cacheIntermediates: false])

  func make(from uri: String, liftSubject: Bool) throws -> [String: Any] {
    guard let url = URL(string: uri), var photo = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) else {
      throw StickerMakerError.unreadableImage
    }

    photo = scaled(photo, toFit: analysisSide)

    var subject: CIImage?
    if liftSubject {
      subject = lift(from: photo)
    }
    let lifted = subject != nil

    let artwork = scaled(subject ?? rounded(photo), toFit: outputSide * 0.88)
    let sticker = outlined(artwork)

    let output = FileManager.default.temporaryDirectory
      .appendingPathComponent("sticker-\(UUID().uuidString).png")

    guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
      throw StickerMakerError.encodingFailed
    }
    try context.writePNGRepresentation(of: sticker, to: output, format: .RGBA8, colorSpace: colorSpace)

    return [
      "uri": output.absoluteString,
      "width": Int(sticker.extent.width),
      "height": Int(sticker.extent.height),
      "lifted": lifted,
    ]
  }

  private func lift(from photo: CIImage) -> CIImage? {
    guard #available(iOS 17.0, *) else {
      return nil
    }

    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(ciImage: photo)

    do {
      try handler.perform([request])
      guard let observation = request.results?.first, !observation.allInstances.isEmpty else {
        return nil
      }

      let buffer = try observation.generateMaskedImage(
        ofInstances: observation.allInstances,
        from: handler,
        croppedToInstancesExtent: true
      )
      let cutout = CIImage(cvPixelBuffer: buffer)

      return cutout.transformed(by: CGAffineTransform(translationX: -cutout.extent.minX, y: -cutout.extent.minY))
    } catch {
      return nil
    }
  }

  /// The whole photo with soft rounded corners, for when nothing stands out.
  private func rounded(_ photo: CIImage) -> CIImage {
    let extent = photo.extent
    let generator = CIFilter.roundedRectangleGenerator()
    generator.extent = extent
    generator.radius = Float(min(extent.width, extent.height) * 0.08)
    generator.color = .white

    guard let mask = generator.outputImage else {
      return photo
    }

    return photo.applyingFilter("CIBlendWithAlphaMask", parameters: [
      kCIInputBackgroundImageKey: CIImage.empty(),
      kCIInputMaskImageKey: mask,
    ]).cropped(to: extent)
  }

  /// Pads the artwork and lays a white outline behind it, grown from its alpha
  /// so the edge follows the subject's silhouette.
  private func outlined(_ artwork: CIImage) -> CIImage {
    let side = max(artwork.extent.width, artwork.extent.height)
    let border = max(6, (side * 0.035).rounded())
    let padding = border * 2
    let canvas = CGRect(x: 0, y: 0, width: artwork.extent.width + padding * 2, height: artwork.extent.height + padding * 2)
    let placed = artwork.transformed(by: CGAffineTransform(translationX: padding, y: padding))
    let clear = CIImage(color: .clear).cropped(to: canvas)

    // White wherever the artwork is meaningfully opaque; Vision's soft mask
    // leaves faint alpha in the background that must not grow an outline.
    let silhouette = placed
      .applyingFilter("CIColorMatrix", parameters: [
        "inputRVector": CIVector(x: 0, y: 0, z: 0, w: 0),
        "inputGVector": CIVector(x: 0, y: 0, z: 0, w: 0),
        "inputBVector": CIVector(x: 0, y: 0, z: 0, w: 0),
        "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 4),
        "inputBiasVector": CIVector(x: 1, y: 1, z: 1, w: -0.6),
      ])
      .applyingFilter("CIColorClamp")
      .composited(over: clear)
      .cropped(to: canvas)

    let grown = silhouette
      .applyingFilter("CIMorphologyMaximum", parameters: [kCIInputRadiusKey: border])
      .cropped(to: canvas)

    // Blur then re-threshold: a smooth, anti-aliased edge without a halo.
    let outline = grown
      .clampedToExtent()
      .applyingGaussianBlur(sigma: Double(border) * 0.25)
      .cropped(to: canvas)
      .applyingFilter("CIColorMatrix", parameters: [
        "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 6),
        "inputBiasVector": CIVector(x: 0, y: 0, z: 0, w: -2.5),
      ])
      .applyingFilter("CIColorClamp")
      .cropped(to: canvas)

    return placed.composited(over: outline).cropped(to: canvas)
  }

  private func scaled(_ image: CIImage, toFit side: CGFloat) -> CIImage {
    let longest = max(image.extent.width, image.extent.height)
    guard longest > side else {
      return image
    }

    let factor = side / longest
    let resized = image.transformed(by: CGAffineTransform(scaleX: factor, y: factor))

    return resized.transformed(by: CGAffineTransform(translationX: -resized.extent.minX, y: -resized.extent.minY))
  }
}
