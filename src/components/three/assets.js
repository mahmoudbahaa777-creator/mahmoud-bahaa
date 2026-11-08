/*
 * 3D ASSETS — where to put real models
 * ------------------------------------
 * 1. Put licensed .glb / .gltf files in /public/models/ (e.g. /public/models/race-car.glb).
 * 2. Set the path below. Leave null to use the procedural fallback mesh.
 * 3. Tune scale / rotation / yOffset so the model sits on the ground (y = 0),
 *    is roughly 4–5 units long, and its nose points the way it drives:
 *      redbull → nose to -x (enters from the right)
 *      aston   → nose to +x (enters from the left)
 *      trophy  → upright, base at y = 0
 * Keep each file under ~3 MB (Draco/meshopt compress with `npx gltf-transform optimize`).
 * Team and league logos need written permission before they appear on a model.
 */
export const MODELS = {
  redbull: { path: null, scale: 1, rotation: [0, 0, 0], yOffset: 0 },
  aston: { path: null, scale: 1, rotation: [0, 0, 0], yOffset: 0 },
  trophy: { path: null, scale: 1, rotation: [0, 0, 0], yOffset: 0 },
}
