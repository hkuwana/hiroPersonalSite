<script lang="ts">
	// 風車の工房 The windmill workshop: every project stands on a shelf as its
	// own figure; the chosen one flies onto the workbench, and its journal
	// shows what it is and where it lives.
	import { track } from '$lib/analytics';
	import { localizeHref } from '$lib/paraglide/runtime';
	import RoomStage from './RoomStage.svelte';
	import { WORKSHOP_PROJECTS } from './workshop';
	import type { Locale } from './place-content';

	let {
		lang,
		selected = 0,
		reduceMotion = false,
		lightweight = false,
		onselect,
		onleave,
		onready
	}: {
		lang: Locale;
		selected?: number;
		reduceMotion?: boolean;
		lightweight?: boolean;
		onselect: (index: number) => void;
		onleave: () => void;
		onready: () => void;
	} = $props();
	const c = $derived(
		lang === 'ja'
			? {
					title: '風車の工房',
					back: '村へ戻る',
					projects: 'プロジェクト',
					journal: 'プロジェクトノート',
					current: '制作中',
					active: '公開中',
					sunset: 'アーカイブ',
					visit: 'サイトを見る',
					source: 'ソースを見る',
					loading: '工房を読み込んでいます…',
					fallback: '軽量表示 · すべてのプロジェクトを閲覧できます。',
					all: '全プロジェクト',
					hint: '棚の作品を選ぶと作業台に下ります · ドラッグで見回す',
					closer: '近づく',
					further: '離れる',
					recentre: '視点を戻す',
					prev: '前へ',
					next: '次へ'
				}
			: {
					title: 'The windmill workshop',
					back: 'Back to the village',
					projects: 'Projects',
					journal: 'Project journal',
					current: 'In progress',
					active: 'Live',
					sunset: 'Archive',
					visit: 'Visit project',
					source: 'View source',
					loading: 'Opening the workshop…',
					fallback: 'Lightweight view · All projects are available.',
					all: 'All projects',
					hint: 'Choose a figure on the shelf to bring it to the bench · drag to look around',
					closer: 'Closer',
					further: 'Further',
					recentre: 'Recentre the view',
					prev: 'Previous',
					next: 'Next'
				}
	);
	const project = $derived(WORKSHOP_PROJECTS[selected] ?? WORKSHOP_PROJECTS[0]);
	const items = $derived(
		WORKSHOP_PROJECTS.map((p) => ({ id: p.id, name: p.name, sub: c[p.status] }))
	);

	function choose(index: number) {
		onselect(index);
		track('village_project_selected', { choice: WORKSHOP_PROJECTS[index].id, locale: lang });
	}
</script>

<RoomStage
	title={c.title}
	{items}
	{selected}
	{reduceMotion}
	{lightweight}
	labels={{
		back: c.back,
		list: c.projects,
		loading: c.loading,
		fallback: c.fallback,
		hint: c.hint,
		closer: c.closer,
		further: c.further,
		recentre: c.recentre,
		prev: c.prev,
		next: c.next
	}}
	load={() => import('./workshop-scene').then((m) => m.createWorkshopScene)}
	onselect={choose}
	{onleave}
	{onready}
>
	{#snippet journal()}
		<div class="journal-top"><span>{c.journal}</span><span>{c[project.status]}</span></div>
		<h3>{project.name}</h3>
		<p>{project.description}</p>
		<div class="links">
			{#if project.href}
				<a class="primary" href={project.href} target="_blank" rel="noopener noreferrer"
					>{project.source === project.href ? c.source : c.visit}
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>
				</a>
			{/if}
			{#if project.source && project.source !== project.href}
				<a href={project.source} target="_blank" rel="noopener noreferrer">{c.source}</a>
			{/if}
			<a class="all" href={localizeHref('/#work', { locale: lang })}>{c.all}</a>
		</div>
	{/snippet}
</RoomStage>

<style>
	svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		flex-shrink: 0;
	}
</style>
