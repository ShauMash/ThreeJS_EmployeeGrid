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
  { name: 'Bob Smith', designation: 'Product Manager', img: 'emp2.jpg', linkedin: 'https://linkedin.com/in/bobsmith' },
  { name: 'Catherine Lee', designation: 'Mobile-App Dev', img: 'emp3.jpg', linkedin: 'https://linkedin.com/in/catherinelee' },
  { name: 'Henry Zhao', designation: 'Mobile-App Dev', img: 'emp8.jpg', linkedin: 'https://linkedin.com/in/henryzhao' },
  { name: 'Isabella White', designation: 'Mobile-App Dev', img: 'emp9.jpg', linkedin: 'https://linkedin.com/in/isabellawhite' },
  { name: 'Frank Miller', designation: 'Backend Dev', img: 'emp6.jpg', linkedin: 'https://linkedin.com/in/frankmiller' },
  { name: 'Karen Gupta', designation: 'Backend Dev', img: 'emp11.jpg', linkedin: 'https://linkedin.com/in/karengupta' },
  { name: 'Grace Lin', designation: 'Frontend Developer', img: 'emp7.jpg', linkedin: 'https://linkedin.com/in/gracelin' },
  { name: 'Jack Thomas', designation: 'Business Analyst', img: 'emp10.jpg', linkedin: 'https://linkedin.com/in/jackthomas' },
  { name: 'Liam Brooks', designation: 'Business Analyst', img: 'emp12.jpg', linkedin: 'https://linkedin.com/in/liambrooks' },
  { name: 'Alice Mason Reed', designation: 'IT Support', img: 'emp13.jpg', linkedin: 'https://linkedin.com/in/alicereed' },
  { name: 'Priya Nair', designation: 'IT Support', img: 'emp16.jpg', linkedin: 'https://linkedin.com/in/priyanair' },
  { name: 'Nina Fox', designation: 'Sales', img: 'emp14.jpg', linkedin: 'https://linkedin.com/in/ninafox' },
  { name: 'Quincy Tran', designation: 'Sales', img: 'emp17.jpg', linkedin: 'https://linkedin.com/in/quincytran' },
  { name: 'Richard Branson', designation: 'Sales', img: 'emp18.jpg', linkedin: 'https://linkedin.com/in/richardburke' },
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

// Camera controls: wheel to zoom, arrow keys to pan
function CameraControls() {
  const { camera, gl } = useThree();
  const zoomSpeed = 0.02;
  const panSpeed = 0.8;

  useEffect(() => {
    const onWheel = e => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * zoomSpeed,
        20,
        80
      );
    };
    const onKey = e => {
      const { x, y } = camera.position;
      if (e.key === 'ArrowLeft') camera.position.x = x - panSpeed;
      if (e.key === 'ArrowRight') camera.position.x = x + panSpeed;
      if (e.key === 'ArrowUp') camera.position.y = y + panSpeed;
      if (e.key === 'ArrowDown') camera.position.y = y - panSpeed;
    };
    gl.domElement.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      gl.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [camera, gl]);
  return null;
}

function CurvedGrid({ groups, vOffset }) {
  const curveAngle = Math.PI / 4;       // narrower curve
  const radius = 45;                    // larger radius
  const planeW = 6, planeH = 8;         // plane size
  const rowGap = planeH * 1.2;
  const colCount = groups.length;
  const colAngleStep = curveAngle / (colCount - 1);
  const [hovered, setHovered] = useState(null);

  return (
    <group>
      {groups.map((grp, ci) => {
        const theta = -curveAngle / 2 + ci * colAngleStep;
        const x = radius * Math.sin(theta);
        const z = radius - radius * Math.cos(theta);
        return (
          <group key={grp.designation} position={[x, 0, z]} rotation={[0, -theta, 0]}>

            {/* Header above first image */}
            <Html position={[0, rowGap / 2 + 4, 0]}>
              <div className="designation-header small">{grp.designation}</div>
            </Html>

            {/* Images in column, evenly spaced */}
            {grp.emps.map((emp, ri) => {
              const y = rowGap / 2 - ri * rowGap + vOffset;
              return (
                <group key={emp.name} position={[0, y, 0.1]}
                  onPointerOver={() => setHovered(emp.name)}
                  onPointerOut={() => setHovered(null)}
                  onPointerUp={e => { e.stopPropagation(); window.open(emp.linkedin, '_blank'); }}>
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

          </group>
        );
      })}
    </group>
  );
}

export default function App() {
  const [hOffset, setHOffset] = useState(0);
  const [vOffset, setVOffset] = useState(0);
  const visibleCols = 5;  // show 5 at a time

  const groups = useMemo(() => {
    const map = {};
    employees.forEach(e => {
      map[e.designation] = map[e.designation] || [];
      map[e.designation].push(e);
    });
    return Object.entries(map)
      .map(([designation, emps]) => ({ designation, emps }));
  }, []);

  const total = groups.length;
  const visible = useMemo(
    () => Array.from({ length: visibleCols })
      .map((_, i) => groups[(hOffset + i + total) % total]),
    [groups, hOffset]
  );

  // clamp vertical so you can't scroll past first/last
  const maxRows = Math.max(...groups.map(g => g.emps.length));
  const rowGap = 8 * 1.2;
  const vMax = rowGap / 2;
  const vMin = -rowGap * (maxRows - 0.5);

  // arrow buttons
  const scrollCols = dir => setHOffset(o => (o + dir + total) % total);

  return (
    <div className="canvas-container">
      <div className="curved-plane">
        <Canvas frameloop="always" camera={{ position: [0, 2, 50], fov: 35 }}>
          <CameraControls />
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          <CurvedGrid groups={visible} vOffset={Math.max(vMin, Math.min(vMax, vOffset))} />
        </Canvas>
      </div>
      <div className="nav-buttons">
        <button className="nav-left" onClick={() => scrollCols(-1)}>←</button>
        <button className="nav-right" onClick={() => scrollCols(1)}>→</button>
      </div>
    </div>
  )
}
