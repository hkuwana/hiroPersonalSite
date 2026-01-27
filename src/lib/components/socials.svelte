<script>
	import TwitterIcon from '$lib/svg/socials-twitter.svelte';
	import GitHubIcon from '$lib/svg/socials-github.svelte';
	import LinkedInIcon from '$lib/svg/socials-linkedin.svelte';
	import EmailIcon from '$lib/svg/socials-email.svelte';
	import QuoraIcon from '$lib/svg/socials-quora.svelte';
	import { CONTACT, SOCIAL_LINKS } from '$data/constants';
</script>

<div class="socials">
	<a
		href={SOCIAL_LINKS.quora}
		target="_blank"
		rel="noopener"
		class="social-link"
		title="Check my answers on Quora"
		aria-label="Quora"
	>
		<QuoraIcon />
	</a>
	<a
		class="social-link"
		href={SOCIAL_LINKS.linkedin}
		rel="noopener"
		target="_blank"
		title="Connect on LinkedIn"
		aria-label="LinkedIn"
	>
		<LinkedInIcon />
	</a>
	<a
		class="social-link"
		href={SOCIAL_LINKS.github}
		target="_blank"
		rel="noopener"
		title="Check out my Github profile"
		aria-label="GitHub"
	>
		<GitHubIcon />
	</a>
	<a
		class="social-link"
		href="mailto:{CONTACT.email}"
		target="_blank"
		rel="noopener"
		title="Send an email"
		aria-label="Email"
	>
		<EmailIcon />
	</a>
</div>

<style>
	.socials {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		color: var(--color-text-secondary);
		border-radius: var(--radius-sm);
		transition: all var(--duration-normal) var(--ease-out-expo);
	}

	.social-link:hover {
		color: var(--color-text);
		background: var(--color-bg-muted);
		transform: translateY(-2px);
	}

	.social-link :global(svg) {
		width: 20px;
		height: 20px;
	}
</style>
