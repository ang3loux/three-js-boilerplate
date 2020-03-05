import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import Stats from 'stats.js';
import * as THREE from 'three';
import { TControls, TVoidCallback, TFigure, TPosition, TDependencies } from './types';
import { randomInRange } from '../utils';

class Venus {
  readonly MIN_SPEED = 0.005;
  readonly MAX_SPEED = 0.01;
  readonly MIN_Y = -2;
  readonly MAX_Y = 2;

  private scene: THREE.Scene;
  private planet: TFigure<THREE.SphereGeometry>;
  private rings: TFigure<THREE.TorusGeometry>[];
  private speed: number;
  private direction: 'up' | 'down';

  constructor({ scene, initialPosition }: TDependencies) {
    this.scene = scene;
    this.planet = this.createPlanet(initialPosition);
    this.rings = [1, 1.5, 2.2].map((size: number) => this.createRing(size, initialPosition));
    this.speed = randomInRange(this.MIN_SPEED, this.MAX_SPEED);
    this.direction = 'down';
  }

  private createPlanet(position: TPosition): TFigure<THREE.SphereGeometry> {
    const geometry = new THREE.SphereGeometry(0.5, 15, 15, 0, Math.PI, 0, Math.PI * 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x8f43ba, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;

    mesh.rotation.x = Math.PI * 0.58;
    mesh.rotation.y = Math.PI * 0.05;

    this.scene.add(mesh);

    return { geometry, material, mesh };
  }

  private createRing(size: number, position: TPosition): TFigure<THREE.TorusGeometry> {
    const geometry = new THREE.TorusGeometry(0.7 * size, 0.1 * size, 2, 30, Math.PI * 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xbb34ba, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;

    mesh.rotation.x = Math.PI * 0.58;
    mesh.rotation.y = Math.PI * 0.05;

    this.scene.add(mesh);

    return { geometry, material, mesh };
  }

  private disposePlanet(): void {
    this.scene.remove(this.planet.mesh);
    this.planet.geometry.dispose();
    this.planet.material.dispose();
  }

  private disposeRings(): void {
    this.rings.forEach((ring: TFigure<THREE.TorusGeometry>) => {
      this.scene.remove(ring.mesh);
      ring.geometry.dispose();
      ring.material.dispose();
    });
  }

  disposeVenus(): void {
    this.disposePlanet();
    this.disposeRings();
  }

  private rotateVenus(): void {
    this.planet.mesh.rotation.z += this.speed;
    this.rings[0].mesh.rotation.z += this.speed / 2;
    this.rings[1].mesh.rotation.z += this.speed / 4;
    this.rings[2].mesh.rotation.z += this.speed / 6;
  }

  animateVenus(): void {
    const movement = this.speed * (this.direction === 'up' ? 1 : -1);

    this.rings[2].mesh.position.y = this.rings[1].mesh.position.y;
    this.rings[1].mesh.position.y = this.rings[0].mesh.position.y;
    this.rings[0].mesh.position.y = this.planet.mesh.position.y;
    this.planet.mesh.position.y += movement;

    if (this.planet.mesh.position.y > this.MAX_Y) this.direction = 'down';
    if (this.planet.mesh.position.y < this.MIN_Y) this.direction = 'up';

    this.rotateVenus();
  }
}

const Canvas: FunctionComponent<{}> = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const controls = useRef<TControls | null>(null);
  const [isAnimating, setAnimating] = useState(true);

  useEffect((): TVoidCallback => {
    let width = canvas.current ? canvas.current.clientWidth : 0;
    let height = canvas.current ? canvas.current.clientHeight : 0;
    let frameId: number | null;

    const stats = new Stats();
    stats.showPanel(0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor('#000000');
    renderer.setSize(width, height);

    const venus = new Venus({ scene, initialPosition: { x: 0, y: 0, z: 0 } });

    const renderScene = (): void => {
      renderer.render(scene, camera);
    };

    const handleResize = (): void => {
      width = canvas.current ? canvas.current.clientWidth : 0;
      height = canvas.current ? canvas.current.clientHeight : 0;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderScene();
    };

    const renderLoop = (): void => {
      stats.begin();

      venus.animateVenus();

      renderScene();
      stats.end();
      frameId = window.requestAnimationFrame(renderLoop);
    };

    const startAnimation = (): void => {
      if (!frameId) frameId = window.requestAnimationFrame(renderLoop);
    };

    const stopAnimation = (): void => {
      if (!!frameId) window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    if (canvas.current) {
      canvas.current.appendChild(renderer.domElement);
      canvas.current.appendChild(stats.dom);
    }

    window.addEventListener('resize', handleResize);
    startAnimation();

    controls.current = { startAnimation, stopAnimation };

    return (): void => {
      const _canvas = canvas;

      stopAnimation();
      window.removeEventListener('resize', handleResize);
      if (_canvas.current) _canvas.current.removeChild(renderer.domElement);

      venus.disposeVenus();
    };
  }, []);

  useEffect((): void => {
    if (controls.current) {
      if (isAnimating) controls.current.startAnimation();
      else controls.current.stopAnimation();
    }
  }, [isAnimating]);

  return <div className="w-full h-full" ref={canvas} onClick={(): void => setAnimating(!isAnimating)} />;
};

export default Canvas;
