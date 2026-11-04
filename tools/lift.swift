import Foundation
import Vision
import CoreImage

// Usage: lift <input.jpg> <output.png>
let args = CommandLine.arguments
guard args.count == 3, let ci = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else { print("usage: lift in out"); exit(1) }
let handler = VNImageRequestHandler(ciImage: ci)
let req = VNGenerateForegroundInstanceMaskRequest()
do {
  try handler.perform([req])
  guard let r = req.results?.first, !r.allInstances.isEmpty else { print("NO SUBJECT \(args[1])"); exit(2) }
  let buf = try r.generateMaskedImage(ofInstances: r.allInstances, from: handler, croppedToInstancesExtent: true)
  let out = CIImage(cvPixelBuffer: buf)
  try CIContext().writePNGRepresentation(of: out, to: URL(fileURLWithPath: args[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
  print("ok \(args[2]) instances=\(r.allInstances.count)")
} catch { print("ERR \(error)"); exit(3) }
