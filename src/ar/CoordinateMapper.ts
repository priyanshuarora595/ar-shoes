export class CoordinateMapper {
  /**
   * Maps a normalized coordinate (0 to 1) to Three.js 3D coordinates.
   *
   * @param x MediaPipe normalized X (0 = left, 1 = right)
   * @param y MediaPipe normalized Y (0 = top, 1 = bottom)
   * @param z MediaPipe depth coordinate
   * @param cameraDistance Distance from the Three.js camera to the tracking plane (typically 5)
   * @param fov Camera Field of View in degrees
   * @param aspect Camera aspect ratio (width / height)
   */
  static mapToThreeSpace(
    x: number,
    y: number,
    z: number,
    cameraDistance: number = 4.5,
    fov: number = 50,
    aspect: number = 1,
    videoAspect: number = 0.75
  ) {
    // Correct coordinates for CSS object-fit: cover cropping
    let correctedX = x;
    let correctedY = y;

    if (aspect < videoAspect) {
      // Screen is narrower than video feed (portrait crop - common on mobile)
      correctedX = (x - 0.5) * (videoAspect / aspect) + 0.5;
    } else if (aspect > videoAspect) {
      // Screen is wider than video feed (landscape crop - common on desktop)
      correctedY = (y - 0.5) * (aspect / videoAspect) + 0.5;
    }

    // 1. Convert corrected coordinates to Normalized Device Coordinates (NDC)
    // NDC x: [-1, 1], NDC y: [1, -1]
    const ndcX = correctedX * 2 - 1;
    const ndcY = -(correctedY * 2 - 1);

    // 2. Compute the viewport height and width at the target distance
    const fovRad = (fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(fovRad / 2) * cameraDistance;
    const planeWidth = planeHeight * aspect;

    // 3. Map to 3D space
    const threeX = ndcX * (planeWidth / 2);
    const threeY = ndcY * (planeHeight / 2);
    
    // MediaPipe z is normalized but centered around the hips, we scale it down 
    // and apply it as a depth offset relative to the camera plane.
    const depthOffset = z * 1.5; 
    const threeZ = -cameraDistance - depthOffset;

    return {
      x: threeX,
      y: threeY,
      z: threeZ,
    };
  }
}
