// App.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import './App.css';

//Dummy list of employees
const employees = [
  { name: 'Alice Johnson', designation: 'Frontend Developer', img: 'emp1.jpg', linkedin: 'https://linkedin.com/in/alicejohnson' },
  { name: 'David Kim', designation: 'Frontend Developer', img: 'emp4.jpg', linkedin: 'https://linkedin.com/in/davidkim' },
  { name: 'Eva Patel', designation: 'Frontend Developer', img: 'emp5.jpg', linkedin: 'https://linkedin.com/in/evapatel' },
  { name: 'Bob Smith', designation: 'Frontend Developer', img: 'emp2.jpg', linkedin: 'https://linkedin.com/in/bobsmith' },
  { name: 'Catherine Lee', designation: 'Mobile-App Dev', img: 'emp3.jpg', linkedin: 'https://linkedin.com/in/catherinelee' },
  { name: 'Henry Zhao', designation: 'Mobile-App Dev', img: 'emp8.jpg', linkedin: 'https://linkedin.com/in/henryzhao' },
  { name: 'Isabella White', designation: 'Frontend Developer', img: 'emp9.jpg', linkedin: 'https://linkedin.com/in/isabellawhite' },
  { name: 'Frank Miller', designation: 'Backend Dev', img: 'emp6.jpg', linkedin: 'https://linkedin.com/in/frankmiller' },
  { name: 'Karen Gupta', designation: 'Backend Dev', img: 'emp11.jpg', linkedin: 'https://linkedin.com/in/karengupta' },
  { name: 'Grace Lin', designation: 'Frontend Developer', img: 'emp7.jpg', linkedin: 'https://linkedin.com/in/gracelin' },
  { name: 'Jack Thomas', designation: 'Business Analyst', img: 'emp10.jpg', linkedin: 'https://linkedin.com/in/jackthomas' },
  { name: 'Liam Brooks', designation: 'Business Analyst', img: 'emp12.jpg', linkedin: 'https://linkedin.com/in/liambrooks' },
  { name: 'Alice Mason Reed', designation: 'IT Support', img: 'emp13.jpg', linkedin: 'https://linkedin.com/in/alicereed' },
  { name: 'Priya Nair', designation: 'IT Support', img: 'emp16.jpg', linkedin: 'https://linkedin.com/in/priyanair' },
  { name: 'Nina Fox', designation: 'Sales', img: 'emp14.jpg', linkedin: 'https://linkedin.com/in/ninafox' },
  { name: 'Quincy Tran', designation: 'Sales', img: 'emp17.jpg', linkedin: 'https://linkedin.com/in/quincytran' },
  { name: 'Richard Branson', designation: 'Backend Dev', img: 'emp18.jpg', linkedin: 'https://linkedin.com/in/richardburke' },
  { name: 'Sam Wilson', designation: 'Marketing Head', img: 'emp19.jpg', linkedin: 'https://linkedin.com/in/samwilson' },
  { name: 'Mac Chapman', designation: 'CEO', img: 'emp20.jpg', linkedin: 'https://linkedin.com/in/mac-chapman-54811161/' },
  { name: 'Priyanka Bose', designation: 'CTO', img: 'emp15.jpg', linkedin: 'https://linkedin.com/in/priyankabose' },
];

// Preload textures
const textureCache = new Map();
employees.forEach(emp => {
  const tex = new THREE.TextureLoader().load(emp.img);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(emp.img, tex);
});

function CameraControls() {
  const { camera, gl } = useThree();
  const zoomSpeed = 0.02;

  useEffect(() => {
    const onWheel = e => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * zoomSpeed,
        20,
        80
      );
    };
    gl.domElement.addEventListener('wheel', onWheel, { passive: false });
    return () => gl.domElement.removeEventListener('wheel', onWheel);
  }, [camera, gl]);
  return null;
}

function CurvedGrid({ group }) {
  const curveAngle = Math.PI / 6;
  const radius = 45;
  const planeW = 6, planeH = 8;
  const rowGap = planeH * 1.3;
  const colGap = planeW * 1.5;
  const [hovered, setHovered] = useState(null);

  const gridCols = 3;
  const emps = group.emps;
  const total = emps.length;
  const rows = Math.ceil(total / gridCols);

  return (
    <group>
      {emps.map((emp, index) => {
        const row = Math.floor(index / gridCols);
        const col = index % gridCols;

        const xOffset = (col - (gridCols - 1) / 2) * colGap;
        const yOffset = -row * rowGap;

        // For 1 employee: center it
        let x = 0;
        if (total === 1) {
          x = 0;
        } else {
          x = xOffset;
        }

        // Calculate rotation to curve around the center
        const theta = Math.asin(x / radius);
        const z = radius - radius * Math.cos(theta);
        const y = yOffset;

        return (
          <group
            key={emp.name}
            position={[radius * Math.sin(theta), y, z]}
            rotation={[0, -theta, 0]}
            onPointerOver={() => setHovered(emp.name)}
            onPointerOut={() => setHovered(null)}
            onPointerUp={e => {
              e.stopPropagation();
              window.open(emp.linkedin, '_blank');
            }}
          >
            <mesh>
              <planeGeometry args={[planeW + 0.4, planeH + 0.4]} />
              <meshBasicMaterial color="#F47C20" />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <planeGeometry args={[planeW, planeH]} />
              <meshBasicMaterial map={textureCache.get(emp.img)} />
            </mesh>
            {hovered === emp.name && (
              <Html position={[0, -planeH / 2 - 1.5, 0]} center>
                <div className="name-tooltip">{emp.name}</div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Designation heading stays fixed relative to first image row */}
      <Html position={[0, rowGap * (rows / 2 + 0.3), 0]}>
        <div className="designation-header small">{group.designation}</div>
      </Html>
    </group>
  );
}


export default function App() {
  const [index, setIndex] = useState(0);

  const groups = useMemo(() => {
    const map = {};
    employees.forEach(e => {
      map[e.designation] = map[e.designation] || [];
      map[e.designation].push(e);
    });
    return Object.entries(map).map(([designation, emps]) => ({ designation, emps }));
  }, []);

  const total = groups.length;

  const scrollDesignation = dir => setIndex(prev => (prev + dir + total) % total);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'ArrowLeft') scrollDesignation(-1);
      if (e.key === 'ArrowRight') scrollDesignation(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  return (
    <div className="canvas-container">
      <div className="curved-plane">
        <Canvas frameloop="always" camera={{ position: [0, 2, 50], fov: 35 }}>
          <CameraControls />
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          <CurvedGrid group={groups[index]} />
        </Canvas>
      </div>
      <div className="nav-buttons">
        <button className="nav-left" onClick={() => scrollDesignation(-1)}>←</button>
        <button className="nav-right" onClick={() => scrollDesignation(1)}>→</button>
      </div>
    </div>
  );
}
