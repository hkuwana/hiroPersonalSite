// Shared parts for the rooms you can walk into (the windmill workshop and
// the house), drawn like the village and like Ōkami: flat toon steps with
// brush-wobbled ink outlines (inverted hull), simple
// shapes, paper labels, logo cards, and one render loop with a camera that
// flies to the chosen object. Procedural, so a room downloads no models.
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Palette } from '$lib/home/palette';
import { createRoomCamera, type Inset, type RoomScene } from './room-camera';
import { loadLogoPixels, logoBackground, logoBounds, type Crop } from './logo-image';

export type Kit = ReturnType<typeof makeKit>;

function makeKit(scene: THREE.Scene, p: Palette) {
	const materials: THREE.Material[] = [];
	const textures: THREE.Texture[] = [];
	// Toon ramp: three flat steps, no gradients (the village uses the same).
	const ramp = new THREE.DataTexture(
		new Uint8Array([120, 120, 120, 255, 190, 190, 190, 255, 255, 255, 255, 255]),
		3,
		1,
		THREE.RGBAFormat
	);
	ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
	ramp.needsUpdate = true;
	textures.push(ramp);
	const material = (color: string) => {
		const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
		materials.push(m);
		return m;
	};
	// The ink line: back faces of a slightly larger copy, with a slow wobble
	// along the surface so it reads as a brush, not a CAD edge.
	const outline = new THREE.ShaderMaterial({
		uniforms: { color: { value: new THREE.Color(p.ink) } },
		side: THREE.BackSide,
		vertexShader: /* glsl */ `
			attribute float ink;
			void main() {
				float w = 0.7 + 0.55 * sin(position.x * 5.1 + position.y * 3.7 + position.z * 4.3);
				vec3 q = position + normal * ink * w;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
			}`,
		fragmentShader: /* glsl */ `
			uniform vec3 color;
			void main() {
				gl_FragColor = vec4(color, 1.0);
				#include <colorspace_fragment>
			}`
	});
	materials.push(outline);
	function hull(geometry: THREE.BufferGeometry, weight: number) {
		const src = geometry.clone();
		src.deleteAttribute('normal');
		if (src.getAttribute('uv')) src.deleteAttribute('uv');
		const h = mergeVertices(src, 1e-4);
		h.computeVertexNormals();
		h.setAttribute(
			'ink',
			new THREE.BufferAttribute(new Float32Array(h.attributes.position.count).fill(weight), 1)
		);
		return new THREE.Mesh(h, outline);
	}
	const mat = {
		wood: material(p.wood),
		darkWood: material(p.ebicha),
		paper: material(p.paper),
		brass: material(p.gold),
		blue: material(p.kon),
		green: material(p.moss),
		greenLight: material(p.mossLight),
		plaster: material(p.paper2),
		ink: material(p.ink),
		murasaki: material(p.murasaki)
	};

	function mesh(
		geometry: THREE.BufferGeometry,
		m: THREE.Material,
		parent: THREE.Object3D = scene,
		weight = 0.035
	) {
		const out = new THREE.Mesh(geometry, m);
		// Flat planes (labels, water) need no outline.
		if (weight > 0 && !(geometry instanceof THREE.PlaneGeometry)) out.add(hull(geometry, weight));
		parent.add(out);
		return out;
	}
	function box(
		w: number,
		h: number,
		d: number,
		x: number,
		y: number,
		z: number,
		m: THREE.Material = mat.wood,
		parent: THREE.Object3D = scene
	) {
		const out = mesh(new THREE.BoxGeometry(w, h, d), m, parent);
		out.position.set(x, y, z);
		return out;
	}
	function rod(
		radius: number,
		length: number,
		x: number,
		y: number,
		z: number,
		m: THREE.Material = mat.wood,
		parent: THREE.Object3D = scene,
		top = radius
	) {
		const out = mesh(new THREE.CylinderGeometry(top, radius, length, 14), m, parent);
		out.position.set(x, y, z);
		return out;
	}
	function canvasTexture(
		width: number,
		height: number,
		draw: (ctx: CanvasRenderingContext2D) => void
	) {
		const image = document.createElement('canvas');
		image.width = width;
		image.height = height;
		draw(image.getContext('2d')!);
		const texture = new THREE.CanvasTexture(image);
		texture.colorSpace = THREE.SRGBColorSpace;
		textures.push(texture);
		return texture;
	}
	function plane(texture: THREE.Texture, w: number, h: number, parent: THREE.Object3D) {
		const m = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
		materials.push(m);
		return mesh(new THREE.PlaneGeometry(w, h), m, parent);
	}
	// A paper strip with a name, like the tags on the workbench.
	function label(
		text: string,
		width: number,
		x: number,
		y: number,
		z: number,
		parent: THREE.Object3D
	) {
		const texture = canvasTexture(768, 160, (ctx) => {
			ctx.fillStyle = p.paper;
			ctx.fillRect(0, 0, 768, 160);
			ctx.fillStyle = p.ink;
			ctx.font = '44px Georgia, serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, 384, 80, 720);
		});
		const out = plane(texture, width, (width * 160) / 768, parent);
		out.position.set(x, y, z);
		return out;
	}
	// A hanging paper tag: a large kanji over a small name.
	function tag(kanji: string, name: string, size: number, parent: THREE.Object3D) {
		const texture = canvasTexture(256, 384, (ctx) => {
			ctx.fillStyle = p.paper;
			ctx.fillRect(0, 0, 256, 384);
			ctx.strokeStyle = p.ebicha;
			ctx.lineWidth = 6;
			ctx.strokeRect(10, 10, 236, 364);
			ctx.fillStyle = p.ebicha;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = '150px "Shippori Mincho", "Yu Mincho", serif';
			ctx.fillText(kanji, 128, 150);
			ctx.fillStyle = p.ink;
			ctx.font = '34px Georgia, serif';
			ctx.fillText(name, 128, 312, 220);
		});
		return plane(texture, size, size * 1.5, parent);
	}
	// A small standing card with a project's logo, on a paper backing.
	function logoCard(url: string, size: number, parent: THREE.Object3D) {
		const card = new THREE.Group();
		parent.add(card);
		box(size * 1.12, size * 1.12, 0.05, 0, 0, -0.03, mat.paper, card);
		const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
		materials.push(m);
		const face = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
		face.position.z = 0.002;
		card.add(face);
		new THREE.TextureLoader().load(url, (texture) => {
			texture.colorSpace = THREE.SRGBColorSpace;
			textures.push(texture);
			const img = texture.image as { width: number; height: number };
			const r = img.width / img.height || 1;
			face.scale.set(r >= 1 ? 1 : r, r >= 1 ? 1 / r : 1, 1);
			m.map = texture;
			m.opacity = 1;
			m.needsUpdate = true;
		});
		return card;
	}
	// A logo cut out like a painted wooden standee: the full-detail logo on
	// both faces, a darker edge for its thickness, and an ink outline. It
	// stands with its lowest point at y = 0 and appears once the image loads.
	function logoFigure(
		url: string,
		opts: { height: number; thickness?: number; crop?: Crop },
		parent: THREE.Object3D
	) {
		const g = new THREE.Group();
		parent.add(g);
		const res = 384;
		void loadLogoPixels(url, res, opts.crop)
			.then(({ data, w, h }) => {
				const bg = logoBackground(data, w, h);
				const box = logoBounds(bg, w, h);
				if (!box) return;
				// The logo with its background made clear.
				const face = document.createElement('canvas');
				face.width = w;
				face.height = h;
				const pixels = new ImageData(new Uint8ClampedArray(data), w, h);
				for (let k = 0; k < w * h; k++) if (bg[k]) pixels.data[k * 4 + 3] = 0;
				face.getContext('2d')!.putImageData(pixels, 0, 0);
				// The same shape grown by a few pixels, filled with ink.
				const outline = canvasTexture(w, h, (ctx) => {
					const r = Math.round(w / 110);
					for (let i = 0; i < 16; i++) {
						const a = (i / 16) * Math.PI * 2;
						ctx.drawImage(face, Math.cos(a) * r, Math.sin(a) * r);
					}
					ctx.globalCompositeOperation = 'source-in';
					ctx.fillStyle = p.ink;
					ctx.fillRect(0, 0, w, h);
				});
				const texture = new THREE.CanvasTexture(face);
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.anisotropy = 4;
				textures.push(texture);

				const s = opts.height / (box.maxY - box.minY + 1);
				const t = opts.thickness ?? 0.1;
				const geo = new THREE.PlaneGeometry(w * s, h * s);
				const holder = new THREE.Group();
				holder.position.set(
					(w / 2 - (box.minX + box.maxX + 1) / 2) * s,
					(box.maxY + 1 - h / 2) * s,
					0
				);
				g.add(holder);
				const layer = (m: THREE.Material, z: number, back = false) => {
					const plane = new THREE.Mesh(geo, m);
					plane.position.z = z;
					if (back) plane.rotation.y = Math.PI;
					holder.add(plane);
				};
				const faceMat = new THREE.MeshToonMaterial({
					map: texture,
					alphaTest: 0.5,
					gradientMap: ramp
				});
				const edgeMat = new THREE.MeshToonMaterial({
					map: texture,
					color: 0x6e5f50,
					alphaTest: 0.5,
					gradientMap: ramp,
					side: THREE.DoubleSide
				});
				const inkMat = new THREE.MeshBasicMaterial({
					map: outline,
					alphaTest: 0.5,
					side: THREE.DoubleSide
				});
				materials.push(faceMat, edgeMat, inkMat);
				layer(faceMat, t / 2 + 0.002);
				layer(faceMat, -t / 2 - 0.002, true);
				for (const z of [t / 2 - 0.001, -t / 2 + 0.001]) layer(inkMat, z);
				for (let i = 1; i < 7; i++) layer(edgeMat, -t / 2 + (t * i) / 7);
			})
			.catch(() => {
				/* A missing logo leaves the base and the label. */
			});
		return g;
	}

	// An Ōkami cloud: puffs with an ink rim and curls inside, painted flat.
	function swirlCloud(width: number, parent: THREE.Object3D = scene) {
		const texture = canvasTexture(512, 256, (ctx) => {
			const puffs: [number, number, number][] = [
				[150, 160, 70],
				[250, 120, 90],
				[360, 160, 70],
				[255, 175, 60]
			];
			ctx.lineWidth = 9;
			ctx.strokeStyle = p.ink;
			for (const [x, y, r] of puffs) {
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.stroke();
			}
			ctx.fillStyle = p.paper2;
			for (const [x, y, r] of puffs) {
				ctx.beginPath();
				ctx.arc(x, y, r - 4, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.lineWidth = 5;
			for (const [x, y, r] of puffs.slice(0, 3)) {
				ctx.beginPath();
				for (let a = 0; a < Math.PI * 3.2; a += 0.15) {
					const rr = r * 0.42 * (1 - a / 12);
					const px = x + Math.cos(a) * rr;
					const py = y + 6 + Math.sin(a) * rr;
					if (a === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.stroke();
			}
		});
		const m = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
		materials.push(m);
		const cloud = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 2), m);
		parent.add(cloud);
		return cloud;
	}

	return {
		mat,
		swirlCloud,
		material,
		mesh,
		box,
		rod,
		label,
		tag,
		logoCard,
		logoFigure,
		canvasTexture,
		materials,
		textures
	};
}

export type Focus = { point: THREE.Vector3; dist: number };
export type Built = {
	// Clickable objects, in the same order as the HTML list beside them.
	objects: THREE.Object3D[];
	focus: Focus[];
	tick?: (dt: number, time: number, selected: number) => void;
	// The chosen object swells a little, unless the room moves it itself.
	swell?: boolean;
};

export function createRoom(
	canvas: HTMLCanvasElement,
	palette: Palette,
	opts: { reduceMotion: boolean; onLost: () => void },
	build: (kit: Kit, scene: THREE.Scene) => Built
): RoomScene {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
	renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 90);
	scene.background = new THREE.Color(palette.paper);
	// The village's light: soft ambient and one sun, so the toon steps show.
	scene.add(new THREE.AmbientLight(0xffffff, 1.35));
	const light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(-3, 7, 5);
	scene.add(light);

	const kit = makeKit(scene, palette);
	const room = build(kit, scene);
	const view = createRoomCamera(camera, () => new THREE.Vector3(), {
		reduceMotion: opts.reduceMotion,
		base: { yaw: 0, pitch: 0.42, dist: 1 }
	});
	const scaleTarget = new THREE.Vector3();
	let selected = -1;
	let raf = 0;
	let active = true;
	let last = performance.now();
	let time = 0;
	let width = 1;
	let height = 1;

	function select(index: number) {
		if (index === selected || !room.focus[index]) return;
		selected = index;
		view.focus(room.focus[index].point, room.focus[index].dist);
	}
	function frame(now: number) {
		raf = 0;
		if (!active) return;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		if (!opts.reduceMotion) time += dt;
		if (room.swell !== false)
			room.objects.forEach((g, i) => {
				const s = i === selected ? 1.07 : 1;
				g.scale.lerp(scaleTarget.set(s, s, s), opts.reduceMotion ? 1 : 1 - Math.exp(-dt * 8));
			});
		room.tick?.(dt, time, selected);
		view.update(dt);
		renderer.render(scene, camera);
		raf = requestAnimationFrame(frame);
	}
	const ray = new THREE.Raycaster();
	const ndc = new THREE.Vector2();
	function pick(x: number, y: number) {
		// The view offset shifts the picture; cast through the shifted pixel.
		ndc.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
		ray.setFromCamera(ndc, camera);
		for (const hit of ray.intersectObjects(room.objects, true)) {
			// Edges are decorative, and their pick threshold is wide.
			if (!(hit.object instanceof THREE.Mesh)) continue;
			let o: THREE.Object3D | null = hit.object;
			while (o && o.userData.item === undefined) o = o.parent;
			if (o) return o.userData.item as number;
		}
		return null;
	}
	room.objects.forEach((o, i) => (o.userData.item = i));
	select(0);

	const lost = (e: Event) => {
		e.preventDefault();
		opts.onLost();
	};
	canvas.addEventListener('webglcontextlost', lost);
	raf = requestAnimationFrame(frame);
	return {
		resize(w, h) {
			width = w;
			height = h;
			renderer.setSize(w, h, false);
			view.resize(w, h);
		},
		pick,
		select,
		orbit: (dx, dy) => view.orbit(dx, dy),
		zoom: (f) => view.zoom(f),
		reset: () => view.reset(),
		setInset: (inset: Inset) => view.setInset(inset),
		setActive(on) {
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
			scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
			kit.materials.forEach((m) => m.dispose());
			kit.textures.forEach((t) => t.dispose());
			renderer.dispose();
		}
	};
}
