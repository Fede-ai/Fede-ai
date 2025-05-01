import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color().setRGB(0.007, 0.007, 0.007);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, 
	window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.target.set(0, 0, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(light);

const capsuleGeometry = new THREE.CapsuleGeometry(0.015, 2, 8, 16);

const yAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
  color: 0x00ff00, metalness: 0, roughness: 0.5,
}));
yAxis.position.y = 1
scene.add(yAxis);

const xAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
  color: 0xff0000, metalness: 0, roughness: 0.5,
}));
xAxis.position.x = 1
xAxis.rotation.z = Math.PI / 2;
scene.add(xAxis);

const zAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
  color: 0x0000ff, metalness: 0, roughness: 0.5,
}));
zAxis.position.z = 1
zAxis.rotation.x = Math.PI / 2;
scene.add(zAxis);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const animate = () => {
  requestAnimationFrame(animate);

	light.position.set(camera.position.x, camera.position.y, camera.position.z);

  renderer.render(scene, camera);
};
animate();
