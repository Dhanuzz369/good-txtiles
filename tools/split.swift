import Foundation
import Vision
import CoreImage
// Usage: split <input> <outprefix>  -> writes one PNG per detected instance
let a = CommandLine.arguments
let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1]))!
let h = VNImageRequestHandler(ciImage: ci)
let req = VNGenerateForegroundInstanceMaskRequest()
try! h.perform([req])
let r = req.results!.first!
for i in r.allInstances {
  let buf = try! r.generateMaskedImage(ofInstances: IndexSet(integer: i), from: h, croppedToInstancesExtent: true)
  try! CIContext().writePNGRepresentation(of: CIImage(cvPixelBuffer: buf), to: URL(fileURLWithPath: "\(a[2])_\(i).png"), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  print("instance \(i)")
}
