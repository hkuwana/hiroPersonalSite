<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.webp';
	import { base } from '$app/paths';
	import { getLocale } from '$lib/paraglide/runtime';

	const calLink = 'https://cal.com/hirokuwana/15min';
	const lang = getLocale();
</script>

<svelte:head>
	<title>Hiroyuki Kuwana | Strategic Innovation Leader & AI Transformation Specialist</title>
</svelte:head>

{#if lang === 'ja'}
<!-- ===== JAPANESE: Absurd / Goofy / Comic Sans ===== -->
<div class="min-h-screen py-16 px-8" style="font-family: 'Comic Sans MS', 'Comic Sans', cursive; background: linear-gradient(135deg, #ff9de2 0%, #a8edea 50%, #ffecd2 100%);">
	<div class="max-w-3xl mx-auto">

		<!-- Header -->
		<div class="text-center mb-10">
			<div class="mb-4" style="font-size: 3rem;">
				ヾ(≧∇≦*)ゞ
			</div>
			<div class="mb-6 inline-block" style="border: 4px dashed hotpink; border-radius: 50%; padding: 8px; background: white;">
				<img src={hiroProfile} alt="桑名浩行" class="w-28 h-28 rounded-full" style="filter: hue-rotate(30deg) saturate(1.5);" />
			</div>
			<h1 style="font-size: 2rem; color: deeppink; text-shadow: 3px 3px 0px #ff69b4, 6px 6px 0px #ffb6c1; margin-bottom: 0.5rem;">
				★超絶スーパー職務経歴書 極★
			</h1>
			<p style="color: mediumblue; font-size: 1.1rem;">
				桑名浩行（ヒーローじゃないけど、ほぼそれ）
			</p>
			<p style="color: purple; font-size: 0.85rem; margin-top: 0.5rem;">
				採用担当の皆さんへ〜（読まなくていいですｗｗｗ）
			</p>
		</div>

		<!-- Skills with progress bars -->
		<div class="mb-10 p-6 rounded-2xl" style="background: rgba(255,255,255,0.7); border: 3px solid hotpink;">
			<h2 style="color: deeppink; font-size: 1.4rem; margin-bottom: 1rem; text-align: center;">
				🌟 スキル一覧（本人申告） 🌟
			</h2>
			<div class="space-y-3">
				{#each [
					{ skill: '🔥 やる気（月曜日を除く）', pct: 80, color: 'orangered' },
					{ skill: '✂️ じゃんけん必勝率', pct: 100, color: 'gold' },
					{ skill: '😴 会議中に意識を保つ', pct: 20, color: 'mediumpurple' },
					{ skill: '☕ コーヒーを飲むスピード', pct: 120, color: 'saddlebrown' },
					{ skill: '🐱 猫のように作業する', pct: 95, color: 'hotpink' },
					{ skill: '🤖 AIを使いこなす', pct: 99, color: 'dodgerblue' },
					{ skill: '📊 パワポのアニメーションを追加する', pct: 110, color: 'limegreen' },
				] as item}
					<div>
						<div class="flex justify-between" style="font-size: 0.85rem; color: #333; margin-bottom: 3px;">
							<span>{item.skill}</span>
							<span style="color: {item.color}; font-weight: bold;">{item.pct}%</span>
						</div>
						<div style="background: #eee; border-radius: 999px; height: 14px; overflow: hidden; border: 2px solid {item.color};">
							<div style="width: {Math.min(item.pct, 100)}%; height: 100%; background: {item.color}; border-radius: 999px; transition: width 1s;"></div>
						</div>
					</div>
				{/each}
			</div>
			<p style="font-size: 0.75rem; color: gray; margin-top: 0.75rem; text-align: right;">※ 120%は物理法則を超えました。ご了承ください。</p>
		</div>

		<!-- Achievements -->
		<div class="mb-10 p-6 rounded-2xl" style="background: rgba(255,255,255,0.7); border: 3px solid mediumpurple;">
			<h2 style="color: mediumpurple; font-size: 1.4rem; margin-bottom: 1rem; text-align: center;">
				🏆 輝かしい実績（多分） 🏆
			</h2>
			<div class="space-y-3">
				{#each [
					{ year: '2025', event: '「Kaiwa」を世界に公開。ユーザーが1人増えた。（本人かもしれない）' },
					{ year: '2024', event: 'テレビ会議中に猫に邪魔される。猫が主役になる。' },
					{ year: '2023', event: '上司の言っていること全部わかったふりをした（バレてない、多分）。' },
					{ year: '2022', event: 'ブラウン大学を卒業した（なぜか環境工学で）。ｗｗｗ' },
					{ year: '2019', event: 'Total War: Shogun 2を津藩でレジェンダリークリア。人生の無駄遣い選手権1位。' },
					{ year: '永遠', event: '毎朝カレーを食べることを検討し、毎朝諦めた。' },
				] as item}
					<div class="flex gap-3">
						<span style="color: deeppink; font-weight: bold; min-width: 48px;">✨{item.year}</span>
						<span style="color: #333;">{item.event}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Philosophy -->
		<div class="mb-10 p-6 rounded-2xl text-center" style="background: rgba(255,255,255,0.7); border: 3px dashed gold;">
			<h2 style="color: darkorange; font-size: 1.4rem; margin-bottom: 0.75rem;">💭 人生哲学 💭</h2>
			<p style="font-size: 1.2rem; color: #333; font-style: italic; line-height: 1.8;">
				「仕事は猫のように。<br/>やる気がある時だけ頑張る。<br/>それ以外は寝る。」
			</p>
			<p style="margin-top: 0.5rem; font-size: 0.8rem; color: gray;">— 桑名浩行、朝4時に悟りを開いて</p>
		</div>

		<!-- CTA -->
		<div class="text-center mb-8">
			<a href={calLink} target="_blank"
				style="display: inline-block; background: deeppink; color: white; padding: 12px 32px; border-radius: 999px; font-size: 1.1rem; font-weight: bold; text-decoration: none; box-shadow: 4px 4px 0px hotpink; border: 2px solid white;">
				📞 採用してみる（後悔するかも）
			</a>
		</div>

		<!-- Escape hatch -->
		<div class="text-center" style="font-size: 0.8rem; color: gray;">
			<a href="/" style="color: #999; text-decoration: underline;">
				正気に戻る → 本物のサイトへ
			</a>
		</div>

	</div>
</div>

{:else if lang === 'zh'}
<!-- ===== CHINESE: Netizen inside jokes ===== -->
<div class="min-h-screen bg-base-100 py-16 px-8">
	<div class="max-w-3xl mx-auto">

		<!-- Header -->
		<div class="text-center mb-10">
			<div class="mb-4 text-5xl">🐟</div>
			<div class="avatar mb-4">
				<div class="w-28 h-28 rounded-full ring ring-base-300">
					<img src={hiroProfile} alt="桑名浩行" />
				</div>
			</div>
			<h1 class="text-3xl font-bold mb-2">打工人简历.exe</h1>
			<p class="text-base-content/60 text-sm">桑名浩行 · 资深摸鱼专家 · 躺平爱好者</p>
			<div class="mt-3 inline-block px-4 py-1 rounded-full text-sm font-medium" style="background: #ff4d4f20; color: #ff4d4f;">
				🔥 本简历正在积极摸鱼中
			</div>
		</div>

		<!-- VPN notice -->
		<div class="alert mb-8 rounded-2xl" style="background: #fff7e6; border: 1px solid #ffd591;">
			<span class="text-2xl">🪄</span>
			<div>
				<p class="font-semibold" style="color: #d46b08;">铁子，你能看到这个页面——</p>
				<p class="text-sm" style="color: #ad6800;">说明你懂的都懂。梯子质量不错嘛，分享一下？🐶</p>
			</div>
		</div>

		<!-- Core competencies -->
		<div class="mb-8 p-6 rounded-2xl bg-base-200/50 border border-base-300/50">
			<h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
				<span>📊</span> 核心竞争力（自我评定）
			</h2>
			<div class="space-y-3">
				{#each [
					{ skill: '摸鱼', pct: 99, note: '已入化境' },
					{ skill: '躺平', pct: 95, note: '持续精进' },
					{ skill: '内卷', pct: 0, note: '已戒断' },
					{ skill: '用AI干活', pct: 110, note: '降维打击' },
					{ skill: '在会议中装作认真听', pct: 88, note: '职场必修课' },
					{ skill: '写PPT', pct: 60, note: '领导最终还是要改的' },
				] as item}
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span>{item.skill} <span class="text-base-content/40 text-xs">— {item.note}</span></span>
							<span class="font-mono font-bold text-primary">{item.pct}%</span>
						</div>
						<div class="h-2.5 rounded-full bg-base-300 overflow-hidden">
							<div class="h-full rounded-full bg-primary transition-all" style="width: {Math.min(item.pct, 100)}%;"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Experience -->
		<div class="mb-8 p-6 rounded-2xl bg-base-200/50 border border-base-300/50">
			<h2 class="text-lg font-semibold mb-4">💼 工作经历（真实版）</h2>
			<div class="space-y-4">
				<div class="border-l-2 border-primary pl-4">
					<div class="flex justify-between">
						<h3 class="font-semibold">CEO · Kaiwa</h3>
						<span class="text-xs text-base-content/40">007制（24小时·7天)</span>
					</div>
					<p class="text-sm text-base-content/60 mt-1">刚创业的时候以为逃离了996，后来发现变成了007。<br/>但是甲方变成了自己，所以可以摸鱼（手动狗头）🐶</p>
				</div>
				<div class="border-l-2 border-base-300 pl-4">
					<div class="flex justify-between">
						<h3 class="font-semibold">创始人 · Flybyrd（已归西）</h3>
						<span class="text-xs text-base-content/40">2023 - 2024</span>
					</div>
					<p class="text-sm text-base-content/60 mt-1">战略性关闭。翻译：转移注意力到下一件事（躺平失败，重新出发）</p>
				</div>
			</div>
		</div>

		<!-- Famous quotes section -->
		<div class="mb-8 p-6 rounded-2xl" style="background: #f6ffed; border: 1px solid #b7eb8f;">
			<h2 class="text-lg font-semibold mb-4 text-green-700">📜 人生格言</h2>
			<blockquote class="text-base-content/70 leading-relaxed border-l-4 border-green-400 pl-4 italic">
				"打工是不可能打工的，这辈子是不可能打工的。<br/>只有靠创业，才能维持得了生活这样子。"
			</blockquote>
			<p class="text-xs text-base-content/40 mt-2 text-right">—— 某知名哲学家（不是我，绝对不是我）🐶</p>
		</div>

		<!-- Education with a twist -->
		<div class="mb-8 p-6 rounded-2xl bg-base-200/50 border border-base-300/50">
			<h2 class="text-lg font-semibold mb-3">🎓 学历（含金量待定）</h2>
			<p class="font-semibold">布朗大学 · 环境工程学士</p>
			<p class="text-sm text-base-content/60 mt-1">
				毕业之后没有去治理环境，而是去治理代码。<br/>
				导师当年的表情：😐 → 😯 → 😶
			</p>
		</div>

		<!-- CTA -->
		<div class="text-center mb-8">
			<a href={calLink} target="_blank" class="btn btn-primary gap-2">
				约个会（不是那个意思）
			</a>
		</div>

		<!-- Escape hatch -->
		<div class="text-center">
			<a href="/" class="text-xs text-base-content/30 hover:text-base-content/50 transition-colors">
				已阅，带我回正经的网站 →
			</a>
		</div>

	</div>
</div>

{:else if lang === 'es'}
<!-- ===== SPANISH: Siesta mode ===== -->
<div class="min-h-screen bg-base-100 py-16 px-8 flex items-center justify-center">
	<div class="max-w-2xl mx-auto text-center">

		<div class="text-8xl mb-6" aria-hidden="true">😴</div>

		<h1 class="text-4xl font-bold mb-4 text-base-content">
			Tomando una siesta estratégica
		</h1>

		<p class="text-xl text-base-content/60 mb-2 leading-relaxed">
			Volveré en algún momento.
		</p>
		<p class="text-xl text-base-content/60 mb-8 leading-relaxed">
			Lo prometo.
		</p>

		<div class="divider max-w-xs mx-auto opacity-30"></div>

		<p class="text-base-content/40 text-sm mb-2 italic">
			(El tiempo en España opera en una dimensión diferente.)
		</p>
		<p class="text-base-content/30 text-xs mb-10 italic">
			— Podría ser mañana. Podría ser el año que viene. Quién sabe.
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
			<a href={calLink} target="_blank" class="btn btn-outline btn-sm">
				Despertar a Hiro (arriesgado)
			</a>
			<a href="/" class="text-xs text-base-content/30 hover:text-base-content/50 transition-colors">
				Volver al sitio de verdad →
			</a>
		</div>

		<div class="mt-16 text-6xl opacity-10" aria-hidden="true">
			🌞 🕐 💤
		</div>

	</div>
</div>

{:else}
<!-- ===== ENGLISH: Corporate buzzword speak (original) ===== -->
<div class="min-h-screen bg-base-100 py-16 px-8">
	<div class="max-w-3xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-12">
			<div class="avatar mb-6">
				<div class="w-32 h-32 rounded-full ring ring-base-300">
					<img src={hiroProfile} alt="Hiroyuki Kuwana" class="grayscale" />
				</div>
			</div>
			<h1 class="text-3xl font-bold tracking-tight mb-2">Hiroyuki Kuwana</h1>
			<p class="text-base-content/60 text-sm uppercase tracking-widest">
				Strategic Innovation Leader | AI Transformation Specialist | Thought Partner
			</p>
		</div>

		<!-- Professional Summary -->
		<div class="prose prose-sm max-w-none mb-12">
			<h2 class="text-lg font-semibold border-b border-base-300 pb-2 mb-4">Professional Summary</h2>
			<p class="text-base-content/70 leading-relaxed">
				Results-driven entrepreneur with a proven track record of leveraging cutting-edge AI technologies
				to drive synergistic outcomes across multiple verticals. Passionate about ideating scalable solutions
				that move the needle on key performance indicators while maintaining stakeholder alignment.
			</p>
			<p class="text-base-content/70 leading-relaxed">
				Core competencies include: strategic visioning, cross-functional collaboration, agile methodology
				implementation, and thought leadership in the AI/ML space. Committed to fostering innovation ecosystems
				that deliver measurable ROI.
			</p>
		</div>

		<!-- Experience -->
		<div class="mb-12">
			<h2 class="text-lg font-semibold border-b border-base-300 pb-2 mb-4">Professional Experience</h2>

			<div class="space-y-6">
				<div>
					<div class="flex justify-between items-start">
						<div>
							<h3 class="font-semibold">Founder & Chief Executive Officer</h3>
							<p class="text-primary text-sm">Kaiwa Technologies, Inc.</p>
						</div>
						<span class="text-xs text-base-content/50">Present</span>
					</div>
					<ul class="text-sm text-base-content/70 mt-2 space-y-1 list-disc list-inside">
						<li>Spearheading AI-driven language acquisition platform with 30-second engagement optimization</li>
						<li>Orchestrating end-to-end product roadmap while cultivating strategic partnerships</li>
						<li>Evangelizing best practices in conversational AI implementation</li>
					</ul>
				</div>

				<div>
					<div class="flex justify-between items-start">
						<div>
							<h3 class="font-semibold">Founder & Chief Executive Officer</h3>
							<p class="text-base-content/50 text-sm">Flybyrd (Sunset)</p>
						</div>
						<span class="text-xs text-base-content/50">2023 - 2024</span>
					</div>
					<ul class="text-sm text-base-content/70 mt-2 space-y-1 list-disc list-inside">
						<li>Architected AI-powered deal flow optimization solution for venture capital stakeholders</li>
						<li>Successfully pivoted resources to higher-impact opportunities (strategic sunset)</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Education -->
		<div class="mb-12">
			<h2 class="text-lg font-semibold border-b border-base-300 pb-2 mb-4">Education</h2>
			<div>
				<h3 class="font-semibold">Brown University</h3>
				<p class="text-sm text-base-content/70">Bachelor of Science, Environmental Engineering</p>
				<p class="text-xs text-base-content/50 mt-1">Relevant coursework: Systems Thinking, Sustainability Frameworks, Data-Driven Decision Making</p>
			</div>
		</div>

		<!-- Skills -->
		<div class="mb-12">
			<h2 class="text-lg font-semibold border-b border-base-300 pb-2 mb-4">Core Competencies</h2>
			<div class="flex flex-wrap gap-2">
				{#each ['Strategic Planning', 'AI/ML Implementation', 'Cross-functional Leadership', 'Agile Methodology', 'Stakeholder Management', 'Product Roadmapping', 'Growth Hacking', 'Thought Leadership', 'Synergy Optimization', 'Paradigm Shifting'] as skill}
					<span class="badge badge-outline badge-sm">{skill}</span>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center border-t border-base-300 pt-8">
			<p class="text-sm text-base-content/60 mb-4">
				Open to strategic conversations about synergistic opportunities.
			</p>
			<a href={calLink} target="_blank" class="btn btn-primary btn-sm">
				Schedule a Strategic Alignment Session
			</a>
		</div>

		<!-- Escape hatch -->
		<div class="text-center mt-16">
			<a href="/" class="text-xs text-base-content/30 hover:text-base-content/50 transition-colors">
				okay I get it, take me back to the real site
			</a>
		</div>
	</div>
</div>
{/if}
