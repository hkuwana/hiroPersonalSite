// The inside of the mill. Procedural timber, paper and ink; no model downloads.
// Loaded only when the visitor enters. The outdoor renderer rests meanwhile.
import * as THREE from 'three';
import type { Palette } from '$lib/home/palette';
import { WORKSHOP_PROJECTS } from './workshop';

export function createWorkshopScene(
	canvas: HTMLCanvasElement,
	palette: Palette,
	opts: { reduceMotion: boolean; onLost: () => void }
) {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
	renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 80);
	const materials: THREE.Material[] = [];
	const textures: THREE.Texture[] = [];
	const objects: THREE.Group[] = [];
	const gears: THREE.Group[] = [];
	const p = { ...palette };
	const material = (color: string) => {
		const m = new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0 });
		materials.push(m);
		return m;
	};
	const wood = material(p.wood);
	const darkWood = material(p.ebicha);
	const paper = material(p.paper);
	const brass = material(p.gold);
	const blue = material(p.kon);
	const green = material(p.moss);
	const plaster = material(p.paper2);
	const edge = new THREE.LineBasicMaterial({ color: p.ink, transparent: true, opacity: 0.55 });
	materials.push(edge);

	function mesh(
		geometry: THREE.BufferGeometry,
		mat: THREE.Material,
		parent: THREE.Object3D = scene
	) {
		const m = new THREE.Mesh(geometry, mat);
		const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 30), edge);
		m.add(lines);
		parent.add(m);
		return m;
	}
	function box(
		w: number,
		h: number,
		d: number,
		x: number,
		y: number,
		z: number,
		mat = wood,
		parent: THREE.Object3D = scene
	) {
		const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
		m.position.set(x, y, z);
		return m;
	}
	function rod(
		radius: number,
		length: number,
		x: number,
		y: number,
		z: number,
		mat = wood,
		parent: THREE.Object3D = scene
	) {
		const m = mesh(new THREE.CylinderGeometry(radius, radius, length, 12), mat, parent);
		m.position.set(x, y, z);
		return m;
	}
	function label(
		text: string,
		width: number,
		x: number,
		y: number,
		z: number,
		parent: THREE.Object3D
	) {
		const image = document.createElement('canvas');
		image.width = 768;
		image.height = 160;
		const ctx = image.getContext('2d')!;
		ctx.fillStyle = p.paper;
		ctx.fillRect(0, 0, image.width, image.height);
		ctx.fillStyle = p.ink;
		ctx.font = '44px Georgia, serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, 384, 80, 720);
		const texture = new THREE.CanvasTexture(image);
		texture.colorSpace = THREE.SRGBColorSpace;
		textures.push(texture);
		const mat = new THREE.MeshBasicMaterial({ map: texture });
		materials.push(mat);
		const m = mesh(new THREE.PlaneGeometry(width, (width * 160) / 768), mat, parent);
		m.position.set(x, y, z);
	}
	function gear(radius: number, x: number, y: number, z: number, teeth: number) {
		const g = new THREE.Group();
		g.position.set(x, y, z);
		scene.add(g);
		const rim = mesh(new THREE.TorusGeometry(radius * 0.74, radius * 0.13, 6, teeth), wood, g);
		rim.rotation.z = Math.PI / teeth;
		for (let i = 0; i < teeth; i++) {
			const a = (i / teeth) * Math.PI * 2;
			const tooth = box(
				radius * 0.22,
				radius * 0.26,
				0.22,
				Math.sin(a) * radius,
				Math.cos(a) * radius,
				0,
				darkWood,
				g
			);
			tooth.rotation.z = -a;
		}
		for (let i = 0; i < 4; i++) {
			const spoke = box(radius * 1.35, 0.12, 0.16, 0, 0, 0, wood, g);
			spoke.rotation.z = (i * Math.PI) / 4;
		}
		const hub = rod(radius * 0.18, 0.38, 0, 0, 0.05, brass, g);
		hub.rotation.x = Math.PI / 2;
		gears.push(g);
		return g;
	}

	scene.background = new THREE.Color(p.paper2);
	scene.add(new THREE.AmbientLight(0xfff1d8, 1.7));
	const light = new THREE.DirectionalLight(0xffe6b6, 3);
	light.position.set(-3, 7, 5);
	scene.add(light);
	const fill = new THREE.DirectionalLight(p.paper, 1.2);
	fill.position.set(6, 3, 4);
	scene.add(fill);

	// Open-front timber room: camera always stays outside the near wall.
	box(18, 10, 0.25, 0, 4.9, -4.5, plaster);
	box(0.3, 10, 13, -9, 4.9, 1.8, plaster);
	box(0.3, 10, 13, 9, 4.9, 1.8, plaster);
	for (let i = 0; i < 22; i++) {
		box(0.8, 0.12, 14, -8.5 + i * 0.81, -0.08, 1.3, i % 3 ? wood : darkWood);
	}
	for (const x of [-8.3, -4.7, 4.7, 8.3]) {
		box(0.24, 8.8, 0.3, x, 4.3, -4.2, darkWood);
		const brace = box(2.2, 0.2, 0.24, x + (x < 0 ? 0.75 : -0.75), 7.9, -4, darkWood);
		brace.rotation.z = x < 0 ? 0.65 : -0.65;
	}
	for (const y of [0.35, 3.6, 7.25, 8.6]) box(17.5, 0.2, 0.3, 0, y, -4.1, darkWood);
	for (const z of [-3, 0.8, 4.6]) {
		box(17.8, 0.24, 0.24, 0, 8.6, z, darkWood);
	}

	// An ink landscape beyond the round window; the village remains present.
	const windowDisc = mesh(new THREE.CircleGeometry(1.6, 48), paper);
	windowDisc.position.set(0, 5.1, -4.32);
	const ring = mesh(new THREE.TorusGeometry(1.6, 0.09, 6, 48), darkWood);
	ring.position.set(0, 5.1, -4.2);
	for (const x of [-0.65, 0, 0.65]) {
		const height = Math.sqrt(1.6 ** 2 - x ** 2) * 2;
		box(0.045, height, 0.05, x, 5.1, -4.14, wood);
	}
	box(3.15, 0.05, 0.05, 0, 5.1, -4.14, wood);
	const hill = mesh(new THREE.SphereGeometry(1, 24, 12), green);
	hill.scale.set(1.45, 0.5, 0.035);
	hill.position.set(0.1, 4.1, -4.25);
	rod(0.17, 8.6, 2.7, 4.25, -3.3, darkWood);
	gear(1.05, 2.7, 6.25, -3, 14);
	gear(0.6, 4.3, 6.5, -3, 10);
	gear(0.8, 2.7, 2.8, -3, 12);

	function desk(x: number, z: number) {
		box(4.7, 0.2, 2.1, x, 1.7, z);
		box(4.5, 0.34, 0.12, x, 1.4, z + 0.8, darkWood);
		for (const dx of [-2, 2])
			for (const dz of [-0.7, 0.7]) {
				box(0.16, 1.65, 0.16, x + dx, 0.8, z + dz, darkWood);
			}
	}
	desk(-3.9, -0.4);
	desk(1.1, -0.4);
	box(15, 0.2, 1, 0, 1.45, -3.4);

	WORKSHOP_PROJECTS.forEach((project, index) => {
		const g = new THREE.Group();
		g.userData.project = index;
		objects.push(g);
		scene.add(g);
		if (index < 2) {
			g.position.set(index === 0 ? -3.9 : 1.1, 1.82, -0.4);
			box(3.7, 0.08, 1.6, 0, 0.04, 0, paper, g);
			if (index === 0) {
				// Otterd: an instrument for turning piles of documents into a workflow.
				box(1.3, 0.55, 0.8, 0, 0.4, 0, blue, g);
				for (let j = 0; j < 5; j++) {
					const sheet = box(0.76, 0.035, 1.05, -1 + j * 0.08, 0.13 + j * 0.055, 0, paper, g);
					sheet.rotation.y = -0.15 + j * 0.04;
				}
				box(0.9, 0.08, 0.8, 1.15, 0.15, 0, brass, g);
				for (let j = 0; j < 3; j++) box(0.6, 0.03, 0.7, 1.15, 0.22 + j * 0.05, 0, paper, g);
			} else {
				// Kaiwa: two speech-shaped paper tiles facing each other.
				for (const side of [-1, 1]) {
					box(1.25, 0.85, 0.18, side * 0.77, 0.65, 0, side < 0 ? green : brass, g);
					const tail = box(0.23, 0.23, 0.16, side * 0.5, 0.22, 0, side < 0 ? green : brass, g);
					tail.rotation.z = Math.PI / 4;
					for (let j = 0; j < 3; j++)
						box(0.65 - j * 0.12, 0.035, 0.02, side * 0.77, 0.83 - j * 0.18, 0.105, paper, g);
				}
			}
			label(project.name, 2.5, 0, -0.04, 1.08, g);
		} else {
			g.position.set(-6.4 + (index - 2) * 2.2, 1.58, -3.3);
			box(1.3, 0.18, 0.86, 0, 0.1, 0, index % 2 ? blue : darkWood, g);
			box(1.22, 0.12, 0.83, 0, 0.25, 0, paper, g);
			box(1.3, 0.06, 0.86, 0, 0.35, 0, index % 2 ? blue : darkWood, g);
			label(project.name, 1.9, 0, 0.8, 0.25, g);
		}
	});
	// Tools, a hanging lantern, and a rolled plan give the room a working life.
	rod(0.035, 1.5, -5.8, 7.6, -0.4, darkWood);
	rod(0.4, 0.7, -5.8, 6.55, -0.4, paper);
	for (const y of [6.2, 6.9]) rod(0.41, 0.05, -5.8, y, -0.4, darkWood);
	for (let i = 0; i < 3; i++) {
		const roll = rod(0.09, 1.3, -5.4 + i * 0.22, 1.94, 0, paper);
		roll.rotation.z = Math.PI / 2;
	}
	let selected = 0;
	let raf = 0;
	let active = true;
	let last = performance.now();
	let time = 0;
	const target = new THREE.Vector3();
	const scaleTarget = new THREE.Vector3();
	const look = new THREE.Vector3(0, 3.4, -2);
	let width = 1;
	let height = 1;
	function resize(w: number, h: number) {
		width = w;
		height = h;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		camera.position.set(0, 4.2, w / h < 1 ? 21 : 13.8);
		camera.lookAt(look);
	}
	function frame(now: number) {
		raf = 0;
		if (!active) return;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		if (!opts.reduceMotion) time += dt;
		gears.forEach((g, i) => {
			g.rotation.z = time * (i % 2 ? -0.18 : 0.12);
		});
		objects.forEach((g, i) => {
			const scale = i === selected ? 1.07 : 1;
			g.scale.lerp(
				scaleTarget.set(scale, scale, scale),
				opts.reduceMotion ? 1 : 1 - Math.exp(-dt * 8)
			);
		});
		const focusX = width > height ? (selected < 2 ? objects[selected].position.x * 0.12 : 0) : 0;
		target.set(focusX, 3.4, -2);
		look.lerp(target, opts.reduceMotion ? 1 : 1 - Math.exp(-dt * 3));
		camera.lookAt(look);
		renderer.render(scene, camera);
		raf = requestAnimationFrame(frame);
	}
	const ray = new THREE.Raycaster();
	function pick(x: number, y: number) {
		ray.setFromCamera(new THREE.Vector2((x / width) * 2 - 1, -(y / height) * 2 + 1), camera);
		for (const hit of ray.intersectObjects(objects, true)) {
			// Edges are decorative, and Three's default line threshold is much
			// wider than these objects. Only visible object surfaces are targets.
			if (!(hit.object instanceof THREE.Mesh)) continue;
			let object: THREE.Object3D | null = hit.object;
			while (object && object.userData.project === undefined) object = object.parent;
			if (object) return object.userData.project as number;
		}
		return null;
	}
	const lost = (e: Event) => {
		e.preventDefault();
		opts.onLost();
	};
	canvas.addEventListener('webglcontextlost', lost);
	raf = requestAnimationFrame(frame);
	return {
		resize,
		pick,
		select(index: number) {
			selected = index;
		},
		setActive(on: boolean) {
			active = on;
			if (on && !raf) {
				last = performance.now();
				raf = requestAnimationFrame(frame);
			}
			if (!on && raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		},
		dispose() {
			active = false;
			cancelAnimationFrame(raf);
			canvas.removeEventListener('webglcontextlost', lost);
			scene.traverse((o) => {
				(o as THREE.Mesh).geometry?.dispose();
			});
			materials.forEach((m) => m.dispose());
			textures.forEach((t) => t.dispose());
			renderer.dispose();
		}
	};
}
