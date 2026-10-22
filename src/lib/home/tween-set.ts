// Tracks running tweens so a new desk mode can stop the old ones first.
export type Killable = { kill: () => unknown };

export function createTweenSet() {
	let tweens: Killable[] = [];
	return {
		add<T extends Killable>(t: T): T {
			tweens.push(t);
			return t;
		},
		killAll() {
			for (const t of tweens) t.kill();
			tweens = [];
		},
		size: () => tweens.length
	};
}
