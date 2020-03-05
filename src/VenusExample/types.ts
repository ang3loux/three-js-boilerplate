export type TVoidCallback = () => void;

export type TControls = {
  startAnimation: TVoidCallback;
  stopAnimation: TVoidCallback;
};

export type TFigure<T> = {
  geometry: T;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
};

export type TVenus = {
  planet: TFigure<THREE.SphereGeometry>;
  rings: TFigure<THREE.TorusGeometry>[];
  speed: number;
};

export type TPosition = { x: number; y: number; z: number };

export type TDependencies = {
  scene: THREE.Scene;
  initialPosition: TPosition;
};
