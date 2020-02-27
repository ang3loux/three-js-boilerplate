import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import * as THREE from 'three';

type TVoidCallback = () => void;

type TControls = {
  startAnimation: TVoidCallback;
  stopAnimation: TVoidCallback;
};

type TFigure<T> = {
  geometry: T;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;
};

const createCube = (scene: THREE.Scene): TFigure<THREE.BoxGeometry> => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = -4;
  mesh.position.y = 1;
  scene.add(mesh);
  return { geometry, material, mesh };
};

const createSphere = (scene: THREE.Scene): TFigure<THREE.SphereGeometry> => {
  const geometry = new THREE.SphereGeometry(1, 15, 15, 0, Math.PI, 0, Math.PI * 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x8f43ba, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = 4;
  mesh.position.y = 1;
  scene.add(mesh);
  return { geometry, material, mesh };
};

const createTorus = (scene: THREE.Scene): TFigure<THREE.TorusGeometry> => {
  const geometry = new THREE.TorusGeometry(0.8, 0.5, 15, 15, Math.PI * 2);
  const material = new THREE.MeshBasicMaterial({ color: 0xda1531, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -1;
  scene.add(mesh);
  return { geometry, material, mesh };
};

const Canvas: FunctionComponent<{}> = () => {
  const canvas = useRef<HTMLDivElement>(null);
  const controls = useRef<TControls | null>(null);
  const [isAnimating, setAnimating] = useState(true);

  useEffect((): TVoidCallback => {
    let width = canvas.current ? canvas.current.clientWidth : 0;
    let height = canvas.current ? canvas.current.clientHeight : 0;
    let frameId: number | null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // const axes = new THREE.AxesHelper(5);

    const cube = createCube(scene);
    const sphere = createSphere(scene);
    const torus = createTorus(scene);

    camera.position.z = 5;

    // scene.add(axes);
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

    const animate = (): void => {
      cube.mesh.rotation.x += 0.01;
      cube.mesh.rotation.y += 0.03;
      cube.mesh.rotation.z += 0.02;

      sphere.mesh.rotation.x += 0.03;
      sphere.mesh.rotation.y += 0.02;
      sphere.mesh.rotation.z += 0.04;

      torus.mesh.rotation.x += 0.01;
      torus.mesh.rotation.y += 0.03;
      torus.mesh.rotation.z += 0.03;

      renderScene();
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = (): void => {
      if (!frameId) frameId = window.requestAnimationFrame(animate);
    };

    const stopAnimation = (): void => {
      if (!!frameId) window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    if (canvas.current) canvas.current.appendChild(renderer.domElement);
    window.addEventListener('resize', handleResize);
    startAnimation();

    controls.current = { startAnimation, stopAnimation };

    return (): void => {
      const _canvas = canvas;

      stopAnimation();
      window.removeEventListener('resize', handleResize);
      if (_canvas.current) _canvas.current.removeChild(renderer.domElement);

      scene.remove(cube.mesh);
      cube.geometry.dispose();
      cube.material.dispose();

      scene.remove(sphere.mesh);
      sphere.geometry.dispose();
      sphere.material.dispose();

      scene.remove(torus.mesh);
      torus.geometry.dispose();
      torus.material.dispose();
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
