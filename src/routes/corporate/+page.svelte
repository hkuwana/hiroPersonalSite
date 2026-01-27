<script lang="ts">
	import hiroProfile from '$lib/images/Hiro_profile_shot.png';
	import { base } from '$app/paths';

	const calLink = 'https://cal.com/hirokuwana/15min';
</script>

<svelte:head>
	<title>Hiroyuki Kuwana | Strategic Innovation Leader & AI Transformation Specialist</title>
</svelte:head>

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
