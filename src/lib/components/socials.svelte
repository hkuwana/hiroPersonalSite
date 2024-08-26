<script>
	import TwitterIcon from '$lib/svg/socials-twitter.svelte';
	import GitHubIcon from '$lib/svg/socials-github.svelte';
	import LinkedInIcon from '$lib/svg/socials-linkedin.svelte';
	import EmailIcon from '$lib/svg/socials-email.svelte';
	import QuoraIcon from '$lib/svg/socials-quora.svelte';
</script>

<div class="flex justify-center mb-9">
	<!-- <a
		href="https://twitter.com/KuwanaHiroyuki"
		target="_blank"
		rel="noopener"
		class="mr-9 text-gray-800"
		title="Waive back to me on Twitter"
	>
		<TwitterIcon />
	</a> -->
	<a
		href="https://www.quora.com/profile/Hiro-Kuwana"
		target="_blank"
		rel="noopener"
		class="mr-9 text-gray-800"
		title="Check my answers on Quora"
	>
		<QuoraIcon />
	</a>
	<a
		class="mr-9 text-gray-800"
		href="https://www.linkedin.com/in/hiroyuki-kuwana/"
		rel="noopener"
		target="_blank"
		title="Connect on LinkedIn"
	>
		<LinkedInIcon />
	</a>
	<a
		class="mr-9 text-gray-800"
		href="https://github.com/hkuwana"
		target="_blank"
		rel="noopener"
		title="Check out my humble Github profile"
	>
		<GitHubIcon />
	</a>
	<a
		class=" text-gray-800"
		href="mailto:hiro@flybyrd.io"
		target="_blank"
		rel="noopener"
		title="Send an email to hiro@flybyrd.io"
	>
		<EmailIcon />
	</a>
</div>
