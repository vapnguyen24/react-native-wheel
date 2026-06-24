export interface PhysicsConfig {
  deceleration?: number;
  minVelocity?: number;
}

export interface ResolvedPhysicsConfig {
  deceleration: number;
  minVelocity: number;
}

export function resolvePhysicsConfig(
  config?: PhysicsConfig
): ResolvedPhysicsConfig {
  return {
    deceleration: config?.deceleration ?? 0.998,
    minVelocity: config?.minVelocity ?? 0.1,
  };
}

/**
 * Convert a tangential pan velocity (px/s) at a given radius to angular
 * velocity (deg/s). The caller is responsible for extracting the tangential
 * component from the raw gesture velocity vector.
 */
export function velocityToAngularVelocity(
  panVelocity: number,
  radius: number
): number {
  'worklet';
  if (radius <= 0) return 0;
  return (panVelocity / radius) * (180 / Math.PI);
}
