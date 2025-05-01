"use client";

/**
 * Preprocesses raw hand data into features for the ASL recognition model
 * Based on the extract_asl_features Python function converted to JavaScript
 *
 * @param {Array} handData - Flat array of 63 points (21 landmarks with x,y,z coordinates)
 * @returns {Array} - Array of 30 extracted features suitable for model input
 */
export function preprocessHandData(handData) {
  if (!handData || handData.length !== 63) {
    console.error(
      "Expected handData to be an array of 63 values (21 landmarks × 3 coordinates)"
    );
    return null;
  }

  // Reshape the flat array into 21 landmarks with 3 coordinates each
  const landmarks = [];
  for (let i = 0; i < handData.length; i += 3) {
    landmarks.push([
      handData[i], // x
      handData[i + 1], // y
      handData[i + 2], // z
    ]);
  }

  // Get reference points
  const wrist = landmarks[0];
  const palmIndices = [0, 5, 9, 13, 17]; // Wrist and base of fingers

  // Calculate palm center
  const palmCenter = palmIndices.reduce(
    (sum, idx) => {
      return [
        sum[0] + landmarks[idx][0] / palmIndices.length,
        sum[1] + landmarks[idx][1] / palmIndices.length,
        sum[2] + landmarks[idx][2] / palmIndices.length,
      ];
    },
    [0, 0, 0]
  );

  // Initialize features array (we'll convert to the correct order at the end)
  const featuresDict = {};

  // 1. Joint angles (critical for hand shape)
  // Define finger segments for angle calculation
  const fingers = [
    [
      [1, 2, 3],
      [2, 3, 4],
    ], // Thumb
    [
      [5, 6, 7],
      [6, 7, 8],
    ], // Index
    [
      [9, 10, 11],
      [10, 11, 12],
    ], // Middle
    [
      [13, 14, 15],
      [14, 15, 16],
    ], // Ring
    [
      [17, 18, 19],
      [18, 19, 20],
    ], // Pinky
  ];
  const fingerNames = ["thumb", "index", "middle", "ring", "pinky"];

  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    for (let j = 0; j < finger.length; j++) {
      const [p1, p2, p3] = finger[j];
      const jointType = j === 0 ? "knuckle" : "middle_joint";

      // Calculate angle between the two segments
      const v1 = subtractVectors(landmarks[p1], landmarks[p2]);
      const v2 = subtractVectors(landmarks[p3], landmarks[p2]);

      // Handle zero vectors
      const v1Norm = vectorNorm(v1);
      const v2Norm = vectorNorm(v2);

      if (v1Norm > 0 && v2Norm > 0) {
        const v1Normalized = [v1[0] / v1Norm, v1[1] / v1Norm, v1[2] / v1Norm];
        const v2Normalized = [v2[0] / v2Norm, v2[1] / v2Norm, v2[2] / v2Norm];

        const dotProduct = Math.min(
          1.0,
          Math.max(-1.0, dotVectors(v1Normalized, v2Normalized))
        );
        const angle = Math.acos(dotProduct);

        featuresDict[`${fingerNames[i]}_${jointType}_angle`] = angle;
      } else {
        featuresDict[`${fingerNames[i]}_${jointType}_angle`] = 0.0;
      }
    }
  }

  // 2. Fingertip distances from palm center
  const fingertips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips

  for (let i = 0; i < fingertips.length; i++) {
    const tip = fingertips[i];
    const dist = vectorNorm(subtractVectors(landmarks[tip], palmCenter));
    featuresDict[`${fingerNames[i]}_tip_to_palm_dist`] = dist;
  }

  // 3. Fingertip heights relative to wrist
  for (let i = 0; i < fingertips.length; i++) {
    const tip = fingertips[i];
    // Y-coordinate relative to wrist (height)
    const height = landmarks[tip][1] - wrist[1];
    featuresDict[`${fingerNames[i]}_height`] = height;
  }

  // 4. Key finger-to-finger distances
  // Thumb to index is particularly important for many signs
  const thumbIndexDist = vectorNorm(
    subtractVectors(landmarks[4], landmarks[8])
  );
  featuresDict["thumb_to_index_dist"] = thumbIndexDist;

  // Thumb to pinky (measures hand openness)
  const thumbPinkyDist = vectorNorm(
    subtractVectors(landmarks[4], landmarks[20])
  );
  featuresDict["thumb_to_pinky_dist"] = thumbPinkyDist;

  // 5. Hand shape features
  // Overall hand curvature
  const fingertipDists = fingertips.map((tip) =>
    vectorNorm(subtractVectors(landmarks[tip], palmCenter))
  );
  const avgFingertipDist =
    fingertipDists.reduce((sum, dist) => sum + dist, 0) / fingertips.length;
  featuresDict["hand_curvature"] = avgFingertipDist;

  // Finger spread (average distance between adjacent fingertips)
  const spreadDistances = [];
  for (let i = 0; i < fingertips.length - 1; i++) {
    const dist = vectorNorm(
      subtractVectors(landmarks[fingertips[i]], landmarks[fingertips[i + 1]])
    );
    spreadDistances.push(dist);
  }

  const fingerSpread =
    spreadDistances.reduce((sum, dist) => sum + dist, 0) /
    spreadDistances.length;
  featuresDict["finger_spread"] = fingerSpread;

  // 6. Thumb opposition (important for many ASL signs)
  // Distance from thumb to base of pinky
  const thumbPinkyOpposition = vectorNorm(
    subtractVectors(landmarks[4], landmarks[17])
  );
  featuresDict["thumb_pinky_opposition"] = thumbPinkyOpposition;

  // 7. Fingertip to palm plane
  // Define palm plane using 3 points: wrist, index base, pinky base
  const v1 = subtractVectors(landmarks[5], landmarks[0]); // Vector from wrist to index base
  const v2 = subtractVectors(landmarks[17], landmarks[0]); // Vector from wrist to pinky base

  const palmNormal = crossProduct(v1, v2);
  const palmNormalNorm = vectorNorm(palmNormal);

  const palmNormalNormalized =
    palmNormalNorm > 0
      ? [
          palmNormal[0] / palmNormalNorm,
          palmNormal[1] / palmNormalNorm,
          palmNormal[2] / palmNormalNorm,
        ]
      : [0, 0, 0];

  // Calculate distances of fingertips to this plane
  for (let i = 0; i < fingertips.length; i++) {
    const tip = fingertips[i];
    // Vector from wrist to fingertip
    const vecToTip = subtractVectors(landmarks[tip], landmarks[0]);

    // Project onto palm normal
    const distToPlane = Math.abs(dotVectors(vecToTip, palmNormalNormalized));
    featuresDict[`${fingerNames[i]}_dist_to_palm_plane`] = distToPlane;
  }

  // Now convert the features dictionary to an array in a consistent order
  // (This ensures the model always gets features in the same order)
  const featureNames = [
    // Joint angles
    "thumb_knuckle_angle",
    "thumb_middle_joint_angle",
    "index_knuckle_angle",
    "index_middle_joint_angle",
    "middle_knuckle_angle",
    "middle_middle_joint_angle",
    "ring_knuckle_angle",
    "ring_middle_joint_angle",
    "pinky_knuckle_angle",
    "pinky_middle_joint_angle",

    // Distances
    "thumb_tip_to_palm_dist",
    "index_tip_to_palm_dist",
    "middle_tip_to_palm_dist",
    "ring_tip_to_palm_dist",
    "pinky_tip_to_palm_dist",

    // Heights
    "thumb_height",
    "index_height",
    "middle_height",
    "ring_height",
    "pinky_height",

    // Key distances
    "thumb_to_index_dist",
    "thumb_to_pinky_dist",

    // Hand shape
    "hand_curvature",
    "finger_spread",
    "thumb_pinky_opposition",

    // Palm plane distances
    "thumb_dist_to_palm_plane",
    "index_dist_to_palm_plane",
    "middle_dist_to_palm_plane",
    "ring_dist_to_palm_plane",
    "pinky_dist_to_palm_plane",
  ];

  // Create the features array in the correct order
  const featuresArray = featureNames.map((name) => featuresDict[name] || 0);

  return featuresArray;
}

// Vector math helper functions
function subtractVectors(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function dotVectors(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function crossProduct(v1, v2) {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
}

function vectorNorm(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/**
 * Format the extracted features for model input
 * @param {Array} features - Array of 30 extracted features
 * @returns {Array} - Properly formatted features for model input
 */
export function formatForModel(features) {
  if (!features || features.length !== 30) {
    console.error("Expected features to be an array of 30 values");
    return null;
  }

  // This function can be expanded if any additional normalization
  // or format changes are needed for the model input

  return features;
}

export default {
  preprocessHandData,
  formatForModel,
};
