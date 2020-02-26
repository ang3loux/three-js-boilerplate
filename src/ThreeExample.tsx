import React, { useEffect, useRef, useState, FunctionComponent } from 'react';
import * as THREE from 'three';

type TVoidCallback = () => void;

type TControls = {
  startAnimation: TVoidCallback;
  stopAnimation: TVoidCallback;
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
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const cube = new THREE.Mesh(geometry, material);

    camera.position.z = 4;
    scene.add(cube);
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
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderScene();
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = (): void => {
      if (!frameId) frameId = requestAnimationFrame(animate);
    };

    const stopAnimation = (): void => {
      if (!!frameId) cancelAnimationFrame(frameId);
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

      scene.remove(cube);
      geometry.dispose();
      material.dispose();
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
