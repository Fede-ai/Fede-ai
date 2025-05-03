import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const b = 20 / 255;
scene.background = new THREE.Color().setRGB(b, b, b);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, 
	window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(2.8, 2.8, 2.8);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.target.set(0, 0, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(light);

const axisGeometry = new THREE.CapsuleGeometry(0.014, 2, 8, 16);

const yAxis = new THREE.Mesh(axisGeometry, new THREE.MeshStandardMaterial({
	color: 0x00ff00, metalness: 0, roughness: 0.8,
}));
yAxis.position.y = 1
yAxis.rotation.y = Math.PI / 2;
scene.add(yAxis);
	
const xAxis = new THREE.Mesh(axisGeometry, new THREE.MeshStandardMaterial({
	color: 0xff0000, metalness: 0, roughness: 0.8,
}));
xAxis.position.x = 1
xAxis.rotation.z = Math.PI / 2;
scene.add(xAxis);
	
const zAxis = new THREE.Mesh(axisGeometry, new THREE.MeshStandardMaterial({
	color: 0x0000ff, metalness: 0, roughness: 0.8,
}));
zAxis.position.z = 1
zAxis.rotation.x = Math.PI / 2;
scene.add(zAxis);

for (let i = 0; i < 8; i++) {
	const capsuleGeometry = new THREE.CapsuleGeometry(0.014, 2/15, 8, 16);

	const yAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
		color: 0x00ff00, metalness: 0, roughness: 0.8,
	}));
	yAxis.position.y = - 1/15 - i*4/15; 
	yAxis.rotation.y = Math.PI / 2;
	scene.add(yAxis);
	
	const xAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
		color: 0xff0000, metalness: 0, roughness: 0.8,
	}));
	xAxis.position.x = - 1/15 - i*4/15;
	xAxis.rotation.z = Math.PI / 2;
	scene.add(xAxis);
	
	const zAxis = new THREE.Mesh(capsuleGeometry, new THREE.MeshStandardMaterial({
		color: 0x0000ff, metalness: 0, roughness: 0.8,
	}));
	zAxis.position.z = - 1/15 - i*4/15;
	zAxis.rotation.x = Math.PI / 2;
	scene.add(zAxis);
}

const coneMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
	metalness: 0.7, 
	roughness: 2
})

const ang1 = (40) / 180 * Math.PI;
const cone1Geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang1), 
	1.5 * Math.cos(ang1), 64, 1, true, 0, Math.PI * 2);
const cone1Material = new THREE.MeshStandardMaterial({...coneMaterial});
cone1Material.color = new THREE.Color(0x5555ff);
const cone1 = new THREE.Mesh(cone1Geometry, cone1Material);
cone1.rotation.x = - Math.PI / 2;
cone1.position.z = 1.5 / 2 * Math.cos(ang1);
scene.add(cone1);
	
const ang2 = (40) / 180 * Math.PI;
const cone2Geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang2), 
	1.5 * Math.cos(ang2), 64, 1, true, 0, Math.PI * 2);
const cone2Material = new THREE.MeshStandardMaterial({...coneMaterial});
cone2Material.color = new THREE.Color(0xff5555);
const cone2 = new THREE.Mesh(cone2Geometry, cone2Material);
cone2.rotation.z = Math.PI / 2;
cone2.position.x = 1.5 / 2 * Math.cos(ang2);
scene.add(cone2);

const geometry = new THREE.CapsuleGeometry(0.014, 1.5, 8, 16); 
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const vec1 = new THREE.Mesh(geometry, material);
const vec2 = new THREE.Mesh(geometry, material);
scene.add(vec1);
scene.add(vec2);

const alpha = document.getElementById('alpha');
const beta = document.getElementById('beta');
const updateVectors = () => {
	const aLabel = document.getElementById('alphaValue');
	aLabel.textContent = "Value of Alpha: " + alpha.value + "°";

	const bLabel = document.getElementById('betaValue');
	bLabel.textContent = "Value of Beta: " + beta.value + "°";

	let a = (alpha.value) / 180 * Math.PI;
	let b = (beta.value) / 180 * Math.PI;
	let g = Math.acos(Math.sqrt(1 - Math.cos(a)**2 - Math.cos(b)**2));
	let r = Math.round(g * 180000 / Math.PI) / 1000
	document.getElementById('gammaValue').textContent = "Value of Gamma: ± " + r + "°";
		
	const up = new THREE.Vector3(0, 1, 0);

	const t1 = new THREE.Vector3(Math.cos(b), Math.cos(g), Math.cos(a));
	vec1.position.copy(t1.multiplyScalar(0.75));
	vec1.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, t1.normalize()));

	const t2 = new THREE.Vector3(Math.cos(b), -Math.cos(g), Math.cos(a));
	vec2.position.copy(t2.multiplyScalar(0.75));
	vec2.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, t2.normalize()));
}
updateVectors();

alpha.addEventListener('input', () => {
	let ang = (alpha.value) / 180 * Math.PI;
	if (ang <= Math.PI / 2) {
		cone1.geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang), 
			1.5 * Math.cos(ang), 64, 1, true, 0, Math.PI * 2);
		cone1.rotation.z = 0;
		cone1.position.z = 1.5 / 2 * Math.cos(ang);
	}
	else {
		ang = Math.PI - ang;
		cone1.geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang), 
			1.5 * Math.cos(ang), 64, 1, true, 0, Math.PI * 2);
		cone1.rotation.z = Math.PI;
		cone1.position.z = -1.5 / 2 * Math.cos(ang);
	}
	updateVectors();
});
beta.addEventListener('input', () => {
	let ang = (beta.value) / 180 * Math.PI;
	if (ang <= Math.PI / 2) {
		cone2.geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang), 
			1.5 * Math.cos(ang), 64, 1, true, 0, Math.PI * 2);
		cone2.rotation.y = 0;
		cone2.position.x = 1.5 / 2 * Math.cos(ang);
	}
	else {
		ang = Math.PI - ang;
		cone2.geometry = new THREE.ConeGeometry(1.5 * Math.sin(ang), 
			1.5 * Math.cos(ang), 64, 1, true, 0, Math.PI * 2);
		cone2.rotation.y = Math.PI;
		cone2.position.x = -1.5 / 2 * Math.cos(ang);
	}
	updateVectors();
});

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
