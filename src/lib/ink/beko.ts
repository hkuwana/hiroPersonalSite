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
	body.position.y = 0.42;
	root.add(body);

	// A round, toy-like barrel of a body.
	const torso = inked(new THREE.CapsuleGeometry(0.28, 0.48, 6, 16), red, 0.021);
	torso.rotation.z = Math.PI / 2;
	torso.scale.set(0.92, 1, 1.12);
	body.add(torso);
	// A stronger shoulder and sweeping horns retain the red folk-toy identity.
	const shoulder = inked(new THREE.SphereGeometry(0.29, 14, 10), red, 0.018);
	shoulder.scale.set(0.8, 1.08, 1.05);
	shoulder.position.set(0.2, 0.025, 0);
	body.add(shoulder);

	// Uneven painted spots: the same ink and ochre as the village, without
	// perfectly machined circles on the handmade toy.
	const spot = (x: number, y: number, z: number, r: number, face: THREE.Vector3) => {
		const g = new THREE.Group();
		const painted = (geo: THREE.BufferGeometry) => {
			const p = geo.getAttribute('position');
			for (let i = 0; i < p.count; i++) {
				const a = Math.atan2(p.getY(i), p.getX(i));
				const wobble = 1 + Math.sin(a * 3 + x * 9) * 0.07 + Math.cos(a * 5) * 0.035;
				p.setXY(i, p.getX(i) * wobble, p.getY(i) * wobble);
			}
			return geo;
		};
		const disc = new THREE.Mesh(painted(new THREE.CircleGeometry(r, 20)), ink);
		const rim = new THREE.Mesh(painted(new THREE.RingGeometry(r, r * 1.18, 20)), gold);
		rim.position.z = -0.002;
		g.add(disc, rim);
		g.position.set(x, y, z);
		g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face);
		body.add(g);
	};
	for (const s of [1, -1]) {
		spot(-0.12, 0.04, 0.3 * s, 0.072, new THREE.Vector3(0, 0, s));
		spot(0.14, -0.04, 0.3 * s, 0.048, new THREE.Vector3(0, 0, s));
	}
	spot(-0.02, 0.267, 0, 0.06, new THREE.Vector3(0, 1, 0));

	// Gold collar where the head meets the body.
	const collar = inked(new THREE.TorusGeometry(0.18, 0.025, 8, 22), gold, 0.01);
	collar.position.set(0.33, 0.04, 0);
	collar.rotation.y = Math.PI / 2;
	body.add(collar);

	// The head hangs from a "spring" at the neck, so it can nod.
	const neck = new THREE.Group();
	neck.position.set(0.34, 0.08, 0);
	body.add(neck);
	const head = new THREE.Group();
	head.position.set(0.17, 0.03, 0);
	head.scale.setScalar(1.4);
	neck.add(head);
	const skull = inked(new THREE.SphereGeometry(0.185, 18, 14), red, 0.017);
	skull.scale.set(1.02, 1, 1.08);
	head.add(skull);
	// A broad, soft paper muzzle and small ink eyes keep the face readable at
	// village scale. No white eyeballs projecting out of the head.
	const muzzle = inked(new THREE.SphereGeometry(0.125, 16, 10), white, 0.011);
	muzzle.scale.set(0.85, 0.73, 1.1);
	muzzle.position.set(0.165, -0.058, 0);
	head.add(muzzle);
	const eyes: THREE.Mesh[] = [];
	const glints: THREE.Mesh[] = [];
	const ears: THREE.Mesh[] = [];
	for (const s of [1, -1]) {
		const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), ink);
		nostril.scale.set(0.5, 0.8, 1);
		nostril.position.set(0.257, -0.04, 0.052 * s);
		head.add(nostril);
		const eye = new THREE.Mesh(new THREE.SphereGeometry(0.029, 10, 8), ink);
		eye.scale.set(0.9, 0.85, 0.4);
		eye.position.set(0.082, 0.057, 0.177 * s);
		eye.rotation.z = -0.12;
		head.add(eye);
		eyes.push(eye);
		const glint = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), white);
		glint.position.set(0.089, 0.065, 0.188 * s);
		head.add(glint);
		glints.push(glint);
		const curve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(-0.04, 0.13, 0.11 * s),
			new THREE.Vector3(-0.055, 0.19, 0.23 * s),
			new THREE.Vector3(-0.015, 0.29, 0.29 * s),
			new THREE.Vector3(0.035, 0.36, 0.26 * s)
		]);
		const hornGeo = new THREE.TubeGeometry(curve, 12, 0.036, 6, false);
		const hornPos = hornGeo.getAttribute('position');
		for (let ring = 0; ring <= 12; ring++) {
			const center = curve.getPointAt(ring / 12);
			const taper = 1 - (ring / 12) * 0.94;
			for (let segment = 0; segment <= 6; segment++) {
				const i = ring * 7 + segment;
				hornPos.setXYZ(
					i,
					center.x + (hornPos.getX(i) - center.x) * taper,
					center.y + (hornPos.getY(i) - center.y) * taper,
					center.z + (hornPos.getZ(i) - center.z) * taper
				);
			}
		}
		hornGeo.computeVertexNormals();
		const horn = inked(hornGeo, white, 0.008);
		head.add(horn);
		const ear = inked(new THREE.SphereGeometry(0.06, 10, 8), red, 0.008);
		ear.scale.set(0.7, 0.4, 1.5);
		ear.position.set(-0.045, 0.085, 0.21 * s);
		ear.rotation.x = 0.22 * s;
		head.add(ear);
		ears.push(ear);
	}
	// A gold mark on the forehead, like the painted toys.
	const brow = new THREE.Mesh(new THREE.CircleGeometry(0.035, 14), gold);
	brow.position.set(0.17, 0.095, 0);
	brow.rotation.y = Math.PI / 2;
	brow.rotation.x = -0.4;
	head.add(brow);
	const bell = inked(new THREE.SphereGeometry(0.044, 10, 8), gold, 0.007);
	bell.position.set(0.35, -0.16, 0);
	body.add(bell);

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
		[0.2, 0.155],
		[0.2, -0.155],
		[-0.2, 0.155],
		[-0.2, -0.155]
	]) {
		const hip = new THREE.Group();
		hip.position.set(x, -0.12, z);
		const leg = inked(
			new THREE.CylinderGeometry(0.06, 0.055, 0.26, 10).translate(0, -0.13, 0),
			red,
			0.014
		);
		const hoof = new THREE.Mesh(
			new THREE.CylinderGeometry(0.06, 0.063, 0.06, 10).translate(0, -0.27, 0),
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
			phase += dt * (8 + 8 * pose.stride) * pose.stride;
			// A bounding run: forelegs reach, hindlegs follow a beat later.
			legs[0].rotation.z = Math.sin(phase) * 0.65 * pose.stride;
			legs[1].rotation.z = Math.sin(phase + 0.55) * 0.65 * pose.stride;
			legs[2].rotation.z = Math.sin(phase + 2.5) * 0.6 * pose.stride;
			legs[3].rotation.z = Math.sin(phase + 3.05) * 0.6 * pose.stride;

			const hop = Math.sin(Math.PI * pose.hop);
			body.position.y = 0.42 + Math.max(0, Math.sin(phase)) * 0.085 * pose.stride + hop * 0.3;
			body.rotation.z = Math.sin(phase - 0.5) * 0.065 * pose.stride;
			body.rotation.x = Math.sin(phase) * 0.04 * pose.stride; // a toy's sway

			// The akabeko's nod: always a little, more as it walks, a lot after a click.
			nodPhase += dt * (5 + 7 * pose.nod);
			const amount = 0.06 + 0.06 * pose.stride + 0.32 * pose.nod;
			neck.rotation.z = Math.sin(nodPhase) * amount - 0.05;
			neck.rotation.y = Math.sin(pose.time * 0.7) * 0.12 * (1 - pose.stride);
			tail.rotation.x = Math.sin(pose.time * 3.1) * 0.25;
			// A brief, quiet blink; the walking and click-to-nod controls stay live.
			const blinkT = pose.time % 5.4;
			const blink = blinkT < 0.18 ? 1 - Math.sin((blinkT / 0.18) * Math.PI) * 0.92 : 1;
			for (let i = 0; i < eyes.length; i++) {
				eyes[i].scale.y = 0.85 * blink;
				glints[i].visible = blink > 0.5;
				ears[i].rotation.x = (i === 0 ? 1 : -1) * (0.22 + Math.sin(pose.time * 1.8) * 0.035);
			}
		}
	};
}
