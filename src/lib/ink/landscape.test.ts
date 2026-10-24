import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFuji, createPaintedTree, createIzakaya } from './landscape';

const paint = new THREE.MeshBasicMaterial();
const kit = {
	inked: (geo: THREE.BufferGeometry, mat: THREE.Material) => new THREE.Mesh(geo, mat),
	paint: () => paint
};

describe('painted landscape geometry', () => {
	it.each(['fuji', 'pine', 'ochre', 'izakaya'])('%s has finite, renderable geometry', (name) => {
		const object =
			name === 'fuji'
				? createFuji(kit)
				: name === 'izakaya'
					? createIzakaya(kit)
					: (() => {
							const { trunk, crown } = createPaintedTree(1.15, name === 'ochre', kit, paint);
							return new THREE.Group().add(trunk, crown);
						})();
		const bounds = new THREE.Box3().setFromObject(object);
		expect(bounds.isEmpty()).toBe(false);
		object.traverse((o) => {
			if (!(o instanceof THREE.Mesh)) return;
			const geo = o.geometry as THREE.BufferGeometry;
			const positions = geo.getAttribute('position');
			expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
			if (geo.index) {
				expect(Array.from(geo.index.array).every((i) => i >= 0 && i < positions.count)).toBe(true);
			}
			geo.dispose();
		});
	});
});
