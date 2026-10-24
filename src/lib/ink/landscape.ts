// The village's painted scenery. Geometry stays local: no image download,
// and the ink, foliage and snow all respond to the live scene palette.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Kit = {
	inked(geo: THREE.BufferGeometry, mat: THREE.Material, width?: number): THREE.Mesh;
	paint(role: LandscapeRole): THREE.Material;
};
export type LandscapeRole =
	| 'fuji'
	| 'fujiRose'
	| 'fujiShade'
	| 'fujiLight'
	| 'snow'
	| 'line'
	| 'wood'
	| 'tower'
	| 'door'
	| 'roofInk'
	| 'window'
	| 'windowGlow'
	| 'plasterWash'
	| 'woodGrain'
	| 'roofGrain'
	| 'hub'
	| 'treeInk';
export type CanopyLobe = { x: number; y: number; z: number; rx: number; ry: number; rz: number };

// A calligraphic ribbon, wide at the press and dry at the lift. Ordinary
// WebGL lines are one pixel wide on many GPUs; these strokes retain weight.
function stroke(points: number[][], width: number, z = 0) {
	const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
	const vertices: number[] = [];
	const indices: number[] = [];
	const steps = 28;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const p = curve.getPoint(t);
		const tangent = curve.getTangent(t);
		const w = width * Math.pow(Math.sin(Math.PI * t), 0.55) * (0.88 + 0.12 * Math.sin(t * 23));
		vertices.push(
			p.x - tangent.y * w,
			p.y + tangent.x * w,
			z,
			p.x + tangent.y * w,
			p.y - tangent.x * w,
			z
		);
		if (i < steps) {
			const a = i * 2;
			indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	geo.setIndex(indices);
	geo.computeVertexNormals();
	return geo;
}

function shape(points: number[][]) {
	const s = new THREE.Shape();
	points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
	s.closePath();
	return new THREE.ShapeGeometry(s);
}

export function createFuji(kit: Kit) {
	const g = new THREE.Group();
	const mountain = new THREE.Shape();
	mountain.moveTo(-9.8, 0);
	mountain.quadraticCurveTo(-5.5, 1.4, -3.2, 5.2);
	mountain.lineTo(-1.05, 7.7);
	mountain.quadraticCurveTo(-0.9, 7.9, -0.65, 7.92);
	mountain.lineTo(0.8, 7.9);
	mountain.quadraticCurveTo(1.05, 7.85, 1.2, 7.6);
	mountain.quadraticCurveTo(4.8, 2.1, 9.7, 0);
	mountain.closePath();
	const geo = new THREE.ExtrudeGeometry(mountain, {
		depth: 0.08,
		bevelEnabled: false,
		curveSegments: 24
	});
	const positions = geo.getAttribute('position');
	const colors: number[] = [];
	for (let i = 0; i < positions.count; i++) {
		// A single blue-grey wash: subtle value changes, no competing sunset.
		const value =
			0.88 + 0.1 * Math.min(1, positions.getY(i) / 7.9) + 0.015 * Math.sin(positions.getX(i) * 0.6);
		colors.push(value, value, value);
	}
	geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	const wash = kit.paint('fuji') as THREE.MeshBasicMaterial;
	wash.vertexColors = true;
	g.add(kit.inked(geo, wash, 0.045));
	const snow = new THREE.Mesh(
		shape([
			[-2.3, 6.25],
			[-1.05, 7.7],
			[-0.65, 7.92],
			[0.8, 7.9],
			[1.2, 7.6],
			[2.1, 6.3],
			[1.1, 6.6],
			[0.75, 6.15],
			[0.25, 6.8],
			[-0.25, 6.45],
			[-0.7, 6.9],
			[-1.45, 6.3],
			[-1.7, 6.6]
		]),
		kit.paint('snow')
	);
	snow.position.z = 0.1;
	g.add(snow);
	const gullies = mergeGeometries([
		stroke(
			[
				[-0.8, 6.3],
				[-1.6, 4.9],
				[-3.2, 3.1],
				[-5.6, 1.2]
			],
			0.04,
			0.12
		),
		stroke(
			[
				[0.85, 6.15],
				[1.5, 4.9],
				[3.1, 2.4],
				[5, 1.15]
			],
			0.035,
			0.12
		),
		stroke(
			[
				[-1.7, 5.7],
				[-2.8, 4.1],
				[-4.6, 2.4]
			],
			0.022,
			0.12
		),
		stroke(
			[
				[1.7, 5.8],
				[2.7, 4.2],
				[4.4, 2.8]
			],
			0.018,
			0.12
		)
	]);
	g.add(new THREE.Mesh(gullies, kit.paint('fujiShade')));
	return g;
}

function branch(points: number[][], radius: number) {
	const curve = new THREE.CatmullRomCurve3(
		points.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z))
	);
	const geo = new THREE.TubeGeometry(curve, 18, 1, 7, false);
	const p = geo.getAttribute('position');
	for (let i = 0; i <= 18; i++) {
		const center = curve.getPointAt(i / 18);
		const r = radius * (1 - (i / 18) * 0.83);
		for (let j = 0; j <= 7; j++) {
			const k = i * 8 + j;
			p.setXYZ(
				k,
				center.x + (p.getX(k) - center.x) * r,
				center.y + (p.getY(k) - center.y) * r,
				center.z + (p.getZ(k) - center.z) * r
			);
		}
	}
	geo.computeVertexNormals();
	return geo;
}

export function createPaintedTree(s: number, rear: boolean, kit: Kit, mat: THREE.Material) {
	const trunkGeo = mergeGeometries([
		branch(
			[
				[0, 0, 0],
				[-0.1, 0.5, 0],
				[0.12, 1.05, -0.03],
				[0.05, 1.85, 0]
			],
			0.13
		),
		branch(
			[
				[0, 0.8, 0],
				[-0.28, 1.15, 0.04],
				[-0.75, 1.3, 0]
			],
			0.075
		),
		branch(
			[
				[0.08, 1.05, 0],
				[0.37, 1.4, 0],
				[0.67, 1.65, 0.03]
			],
			0.065
		),
		branch(
			[
				[0.08, 1.45, 0],
				[-0.25, 1.9, -0.02],
				[-0.5, 2.12, 0]
			],
			0.045
		)
	]);
	trunkGeo.scale(s, s, s);
	const trunk = kit.inked(trunkGeo, kit.paint('wood'), 0.026);
	const bark = mergeGeometries([
		stroke(
			[
				[0.02, 0.06],
				[-0.055, 0.49],
				[0.12, 1.03],
				[0.06, 1.63]
			],
			0.017,
			0.13
		),
		stroke(
			[
				[-0.1, 0.85],
				[-0.29, 1.14],
				[-0.65, 1.27]
			],
			0.014,
			0.08
		),
		stroke(
			[
				[0.17, 1.12],
				[0.37, 1.4],
				[0.59, 1.59]
			],
			0.012,
			0.07
		)
	]);
	bark.scale(s, s, s);
	trunk.add(new THREE.Mesh(bark, kit.paint('line')));
	const spread = rear ? 0.9 : 1;
	const lobes: CanopyLobe[] = [
		{ x: -0.76 * spread, y: 0.12, z: 0.04, rx: 0.67, ry: 0.43, rz: 0.45 },
		{ x: 0.65 * spread, y: 0.35, z: -0.03, rx: 0.72, ry: 0.45, rz: 0.48 },
		{ x: -0.32, y: 0.74, z: -0.12, rx: 0.68, ry: 0.47, rz: 0.44 },
		{ x: 0.27, y: 0.9, z: -0.03, rx: 0.6, ry: 0.42, rz: 0.42 },
		{ x: -0.08, y: 0.18, z: 0.3, rx: 0.67, ry: 0.4, rz: 0.42 }
	];
	const crowns = lobes.flatMap((l, j) =>
		[-1, 0, 1].map((k) => {
			const geo = new THREE.SphereGeometry(1, 18, 10);
			const rx = l.rx * (k === 0 ? 0.65 : 0.55);
			geo.scale(rx * s, l.ry * (k === 0 ? 1 : 0.8) * s, l.rz * s);
			geo.translate((l.x + k * l.rx * 0.49) * s, (l.y + (k === 0 ? 0.05 : -0.025)) * s, l.z * s);
			const shade = 0.94 + ((j + k + 3) % 3) * 0.03;
			geo.setAttribute(
				'color',
				new THREE.Float32BufferAttribute(
					Array.from({ length: geo.getAttribute('position').count }, () => [
						shade,
						shade,
						shade
					]).flat(),
					3
				)
			);
			return geo;
		})
	);
	const crown = kit.inked(mergeGeometries(crowns), mat, 0.022);
	crown.position.y = 1.62 * s;
	// Small petal folds, kept lighter than the branch outlines.
	const petalMarks = lobes.map((l) =>
		stroke(
			[
				[(l.x - l.rx * 0.28) * s, (l.y - l.ry * 0.25) * s],
				[l.x * s, (l.y - l.ry * 0.25) * s],
				[(l.x + l.rx * 0.28) * s, (l.y - l.ry * 0.13) * s]
			],
			0.009 * s,
			(l.z + l.rz * 0.97) * s
		)
	);
	crown.add(new THREE.Mesh(mergeGeometries(petalMarks), kit.paint('treeInk')));
	return { trunk, crown, lobes };
}

export function createIzakaya(kit: Kit) {
	const g = new THREE.Group();
	const wallGeo = new THREE.BoxGeometry(1.7, 1.02, 0.85, 4, 3, 2);
	const wallPos = wallGeo.getAttribute('position');
	for (let i = 0; i < wallPos.count; i++) {
		wallPos.setX(i, wallPos.getX(i) + Math.sin(wallPos.getY(i) * 9 + wallPos.getZ(i) * 3) * 0.012);
	}
	wallGeo.computeVertexNormals();
	const wall = kit.inked(wallGeo, kit.paint('tower'), 0.027);
	wall.position.y = 0.51;
	g.add(wall);
	for (const x of [-0.78, 0.78]) {
		const post = kit.inked(new THREE.BoxGeometry(0.1, 1.1, 0.085), kit.paint('wood'), 0.015);
		post.position.set(x, 0.55, 0.46);
		g.add(post);
	}
	const roofY = (x: number, z: number) => 1.49 - Math.abs(z) * 0.52 + 0.09 * (x / 1.15) ** 2;
	const roofGeo = new THREE.PlaneGeometry(2.3, 1.6, 20, 14);
	roofGeo.rotateX(-Math.PI / 2);
	const roofPos = roofGeo.getAttribute('position');
	for (let i = 0; i < roofPos.count; i++) roofPos.setY(i, roofY(roofPos.getX(i), roofPos.getZ(i)));
	roofGeo.computeVertexNormals();
	g.add(kit.inked(roofGeo, kit.paint('roofInk'), 0.035));
	const fibres = Array.from({ length: 15 }, (_, i) => {
		const x = -1.04 + i * 0.148;
		const z = 0.04 + (i % 3) * 0.04;
		return branch(
			[
				[x, roofY(x, z) + 0.016, z],
				[x + 0.02, roofY(x, 0.42) + 0.016, 0.42],
				[x - 0.015, roofY(x, 0.76) + 0.016, 0.76]
			],
			0.012 + (i % 2) * 0.004
		);
	});
	g.add(new THREE.Mesh(mergeGeometries(fibres), kit.paint('roofGrain')));
	const eave = new THREE.Mesh(
		stroke(
			[
				[-1.15, roofY(-1.15, 0.8)],
				[0, roofY(0, 0.8)],
				[1.15, roofY(1.15, 0.8)]
			],
			0.045,
			0.805
		),
		kit.paint('wood')
	);
	g.add(eave);
	const ridge = kit.inked(new THREE.BoxGeometry(2.3, 0.08, 0.1), kit.paint('roofInk'), 0.015);
	ridge.position.y = 1.52;
	g.add(ridge);
	const plasterMarks = mergeGeometries([
		stroke(
			[
				[-0.69, 0.2],
				[-0.72, 0.53],
				[-0.68, 0.92]
			],
			0.025,
			0.44
		),
		stroke(
			[
				[0.69, 0.12],
				[0.64, 0.29],
				[0.67, 0.56]
			],
			0.04,
			0.44
		),
		stroke(
			[
				[-0.57, 0.22],
				[-0.29, 0.19],
				[-0.08, 0.23]
			],
			0.035,
			0.44
		)
	]);
	g.add(new THREE.Mesh(plasterMarks, kit.paint('plasterWash')));
	const grain = mergeGeometries(
		[-0.78, 0.78].flatMap((x) => [
			stroke(
				[
					[x - 0.015, 0.12],
					[x + 0.014, 0.5],
					[x - 0.005, 1.02]
				],
				0.008,
				0.512
			),
			stroke(
				[
					[x + 0.024, 0.27],
					[x + 0.008, 0.61],
					[x + 0.018, 0.86]
				],
				0.005,
				0.513
			)
		])
	);
	g.add(new THREE.Mesh(grain, kit.paint('woodGrain')));
	const door = new THREE.Mesh(new THREE.PlaneGeometry(0.51, 0.82), kit.paint('window'));
	door.position.set(0.4, 0.42, 0.438);
	g.add(door);
	// A short split noren, rather than another sign or decorative landmark.
	for (const i of [-1, 0, 1]) {
		const curtain = new THREE.Mesh(
			shape([
				[-0.083, 0],
				[0.083, 0],
				[0.08, -0.35],
				[0.02, -0.33],
				[-0.08, -0.36]
			]),
			kit.paint('door')
		);
		curtain.position.set(0.4 + i * 0.17, 1.0, 0.5);
		g.add(curtain);
	}
	const window = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.44), kit.paint('window'));
	window.position.set(-0.37, 0.61, 0.447);
	g.add(window);
	const glowMat = kit.paint('windowGlow') as THREE.MeshBasicMaterial;
	glowMat.transparent = true;
	glowMat.depthWrite = false;
	glowMat.opacity = 0;
	const wash = new THREE.Mesh(new THREE.PlaneGeometry(0.77, 0.68), glowMat);
	wash.position.set(-0.37, 0.61, 0.443);
	g.add(wash);
	for (const [w, h, x, y] of [
		[0.56, 0.035, -0.37, 0.85],
		[0.56, 0.035, -0.37, 0.37],
		[0.035, 0.48, -0.64, 0.61],
		[0.035, 0.48, -0.1, 0.61],
		[0.025, 0.48, -0.37, 0.61],
		[0.54, 0.025, -0.37, 0.61]
	]) {
		const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.025), kit.paint('wood'));
		frame.position.set(x, y, 0.468);
		g.add(frame);
	}
	const sill = kit.inked(new THREE.BoxGeometry(1.85, 0.08, 1.0), kit.paint('wood'), 0.015);
	sill.position.y = 0.04;
	g.add(sill);
	return g;
}
