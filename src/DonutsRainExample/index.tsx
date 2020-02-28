import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import Stats from 'stats.js';
import * as THREE from 'three';

const HEX_BASE = 16;
const MAX_DECIMAL_COLOR = 16777215;

type TVoidCallback = () => void;

type TControls = {
  startAnimation: TVoidCallback;
  stopAnimation: TVoidCallback;
};

type TDonut = {
  geometry: THREE.TorusGeometry;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
  speed: number;
};

const createDonut = (scene: THREE.Scene): TDonut => {
  const size = Math.random() * 0.1 + 0.1;
  const color = parseInt((Math.random() * MAX_DECIMAL_COLOR).toString(HEX_BASE).substr(-6), HEX_BASE);
  const xPosition = Math.random() * 16 - 8;

  const geometry = new THREE.TorusGeometry(size, size / 2, 15, 15, Math.PI * 2);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  const speed = Math.random() * 0.03 + 0.01;

  mesh.position.x = xPosition;
  mesh.position.y = 4;
  scene.add(mesh);

  return { geometry, material, mesh, speed };
};

const disposeDonut = (donut: TDonut, scene: THREE.Scene): void => {
  scene.remove(donut.mesh);
  donut.geometry.dispose();
  donut.material.dispose();
};

const animateDonut = (donut: TDonut): void => {
  donut.mesh.position.y -= donut.speed;
  donut.mesh.rotation.x += 0.01;
  donut.mesh.rotation.y += 0.03;
  donut.mesh.rotation.z += 0.02;
};

const Canvas: FunctionComponent<{}> = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const controls = useRef<TControls | null>(null);
  const [isAnimating, setAnimating] = useState(true);

  useEffect((): TVoidCallback => {
    const donuts: TDonut[] = [];
    let width = canvas.current ? canvas.current.clientWidth : 0;
    let height = canvas.current ? canvas.current.clientHeight : 0;
    let frameId: number | null;

    const stats = new Stats();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    stats.showPanel(0);
    camera.position.z = 5;
    renderer.setClearColor('#000000');
    renderer.setSize(width, height);

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
      if (Math.random() <= 0.015) donuts.push(createDonut(scene));

      donuts.forEach((donut: TDonut, index: number): void => {
        if (donut.mesh.position.y >= -4) animateDonut(donut);
        else {
          disposeDonut(donut, scene);
          donuts.splice(index, 1);
        }
      });

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

      donuts.forEach((donut: TDonut): void => disposeDonut(donut, scene));
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
