// 赤べこ Akabeko: the red ox folk toy from Aizu, with a head that nods on a
// spring. Hiro was born in a year of the ox (丑), so the ox is his guide
// through the village. Built from primitives and inked like the rest of the
// scene. It faces +x; the scene turns the root to set its heading.
import * as THREE from 'three';

export type BekoKit = {
	inked(geo: THREE.BufferGeometry, mat: THREE.Material, w?: number): THREE.Mesh;
	red: THREE.Material;
	ink: THREE.Material;
	gold: THREE.Material;
	white: THREE.Material;
};

export type BekoPose = {
	time: number;
	stride: number; // 0 = still, 1 = full walk
	nod: number; // 0..1, a burst of nodding (after a click)
	hop: number; // 0..1, one small jump
};

export type Beko = { root: THREE.Group; update(dt: number, pose: BekoPose): void };

export function createBeko(kit: BekoKit): Beko {
	const { inked, red, ink, gold, white } = kit;
	const root = new THREE.Group();
	const body = new THREE.Group(); // bobs while walking
	body.position.y = 0.46;
	root.add(body);

	// A round, toy-like barrel of a body.
	const torso = inked(new THREE.CapsuleGeometry(0.25, 0.42, 6, 16), red, 0.024);
	torso.rotation.z = Math.PI / 2;
	torso.scale.set(0.95, 1, 1.05);
	body.add(torso);

	// Black spots with gold rims on both flanks and on the back.
	const spot = (x: number, y: number, z: number, r: number, face: THREE.Vector3) => {
		const g = new THREE.Group();
		const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 20), ink);
		const rim = new THREE.Mesh(new THREE.RingGeometry(r, r * 1.3, 20), gold);
		rim.position.z = -0.002;
		g.add(disc, rim);
		g.position.set(x, y, z);
		g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face);
		body.add(g);
	};
	for (const s of [1, -1]) {
		spot(-0.12, 0.04, 0.262 * s, 0.07, new THREE.Vector3(0, 0, s));
		spot(0.14, -0.04, 0.262 * s, 0.05, new THREE.Vector3(0, 0, s));
	}
	spot(-0.02, 0.25, 0, 0.06, new THREE.Vector3(0, 1, 0));

	// Gold collar where the head meets the body.
	const collar = inked(new THREE.TorusGeometry(0.17, 0.035, 8, 22), gold, 0.012);
	collar.position.set(0.33, 0.04, 0);
	collar.rotation.y = Math.PI / 2;
	body.add(collar);

	// The head hangs from a "spring" at the neck, so it can nod.
	const neck = new THREE.Group();
	neck.position.set(0.36, 0.08, 0);
	body.add(neck);
	const head = new THREE.Group();
	head.position.set(0.19, 0.03, 0);
	head.scale.setScalar(1.25); // the toy's head is big for its body
	neck.add(head);
	const skull = inked(new THREE.SphereGeometry(0.17, 18, 14), red, 0.02);
	skull.scale.set(1.15, 0.95, 1.05);
	head.add(skull);
	const muzzle = inked(new THREE.CylinderGeometry(0.11, 0.12, 0.12, 14), red, 0.016);
	muzzle.rotation.z = -Math.PI / 2;
	muzzle.position.set(0.17, -0.05, 0);
	head.add(muzzle);
	for (const s of [1, -1]) {
		const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), ink);
		nostril.position.set(0.235, -0.04, 0.045 * s);
		head.add(nostril);
		const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), white);
		eyeWhite.position.set(0.09, 0.05, 0.13 * s);
		head.add(eyeWhite);
		const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), ink);
		pupil.position.set(0.115, 0.05, 0.148 * s);
		head.add(pupil);
		const horn = inked(new THREE.ConeGeometry(0.03, 0.12, 8), ink, 0.008);
		horn.position.set(-0.03, 0.16, 0.08 * s);
		horn.rotation.x = 0.55 * s;
		head.add(horn);
		const ear = inked(new THREE.SphereGeometry(0.05, 10, 8), red, 0.01);
		ear.scale.set(0.7, 0.45, 1.2);
		ear.position.set(-0.04, 0.07, 0.19 * s);
		head.add(ear);
	}
	// A gold mark on the forehead, like the painted toys.
	const brow = new THREE.Mesh(new THREE.CircleGeometry(0.035, 14), gold);
	brow.position.set(0.17, 0.09, 0);
	brow.rotation.y = Math.PI / 2;
	brow.rotation.x = -0.4;
	head.add(brow);

	// Tail with an ink tuft.
	const tail = new THREE.Group();
	tail.position.set(-0.45, 0.06, 0);
	body.add(tail);
	const tailRope = new THREE.Mesh(
		new THREE.CylinderGeometry(0.015, 0.015, 0.26, 6).translate(0, -0.13, 0),
		red
	);
	const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), ink);
	tuft.scale.set(1, 1.6, 1);
	tuft.position.y = -0.28;
	tail.add(tailRope, tuft);
	tail.rotation.z = -0.35;

	// Four short, sturdy legs with ink hooves.
	const legs: THREE.Group[] = [];
	for (const [x, z] of [
		[0.2, 0.13],
		[0.2, -0.13],
		[-0.2, 0.13],
		[-0.2, -0.13]
	]) {
		const hip = new THREE.Group();
		hip.position.set(x, -0.12, z);
		const leg = inked(
			new THREE.CylinderGeometry(0.055, 0.05, 0.3, 10).translate(0, -0.15, 0),
			red,
			0.014
		);
		const hoof = new THREE.Mesh(
			new THREE.CylinderGeometry(0.055, 0.058, 0.06, 10).translate(0, -0.32, 0),
			ink
		);
		hip.add(leg, hoof);
		body.add(hip);
		legs.push(hip);
	}

	let phase = 0;
	let nodPhase = 0;
	return {
		root,
		update(dt, pose) {
			phase += dt * 9 * pose.stride;
			const swing = Math.sin(phase) * 0.45 * pose.stride;
			// A walk: diagonal pairs move together.
			legs[0].rotation.z = swing;
			legs[3].rotation.z = swing;
			legs[1].rotation.z = -swing;
			legs[2].rotation.z = -swing;

			const hop = Math.sin(Math.PI * pose.hop);
			body.position.y = 0.46 + Math.abs(Math.sin(phase)) * 0.03 * pose.stride + hop * 0.3;
			body.rotation.x = Math.sin(phase) * 0.04 * pose.stride; // a toy's sway

			// The akabeko's nod: always a little, more as it walks, a lot after a click.
			nodPhase += dt * (5 + 7 * pose.nod);
			const amount = 0.06 + 0.06 * pose.stride + 0.32 * pose.nod;
			neck.rotation.z = Math.sin(nodPhase) * amount - 0.05;
			neck.rotation.y = Math.sin(pose.time * 0.7) * 0.12 * (1 - pose.stride);
			tail.rotation.x = Math.sin(pose.time * 3.1) * 0.25;
		}
	};
}
