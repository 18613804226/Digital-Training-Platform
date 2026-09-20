// src/shims-three.d.ts
declare module 'three/examples/jsm/renderers/CSS2DRenderer' {
  export * from 'three/examples/jsm/renderers/CSS2DRenderer';
  export {
    CSS2DObject,
    CSS2DRenderer,
  } from 'three/examples/jsm/renderers/CSS2DRenderer';
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';

  class OrbitControls extends EventDispatcher {
    [x: string]: number;
    dampingFactor: number;
    enabled: boolean;
    enableDamping: boolean;
    constructor(object: Camera, domElement?: HTMLElement);
    dispose(): void;
    update(): void;
    // 可简化为 any，但建议保留基本结构
  }
  export { OrbitControls };
}
