<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children } = $props();

	let isExpanded = $state(true);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen bg-white dark:bg-neutral-950">
	<!-- Sidebar -->
	<aside
		class="flex flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 {isExpanded
			? 'w-64'
			: 'w-20'}"
	>
		<div class="flex justify-end border-b border-gray-200 p-4 dark:border-neutral-800">
			<button
				onclick={() => (isExpanded = !isExpanded)}
				class="focus:outline-apple-blue-500 dark:focus:outline-apple-blue-400 rounded-sm p-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100/50 focus:outline-2 focus:outline-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
				aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
			>
				<svg
					class="h-5 w-5 transition-transform duration-300 {isExpanded ? '' : 'rotate-180'}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>
		</div>

		<nav class="flex-1 space-y-1 p-4">
			<a
				href={resolve('/')}
				class="group focus:outline-apple-blue-500 dark:hover:text-apple-blue-400 dark:focus:outline-apple-blue-400 flex items-center gap-3 rounded-sm p-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-2 focus:outline-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-900"
			>
				<svg
					class="h-5 w-5 transition-colors"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				<span
					class="transition-opacity duration-300 {isExpanded ? 'opacity-100' : 'hidden opacity-0'}"
				>
					Home
				</span>
			</a>
			<a
				href={resolve('/attendance-list')}
				class="group focus:outline-apple-blue-500 dark:hover:text-apple-blue-400 dark:focus:outline-apple-blue-400 flex items-center gap-3 rounded-sm p-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-2 focus:outline-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-900"
			>
				<svg
					class="h-5 w-5 transition-colors"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
					/>
				</svg>
				<span
					class="transition-opacity duration-300 {isExpanded ? 'opacity-100' : 'hidden opacity-0'}"
				>
					Activity Log
				</span>
			</a>
		</nav>
	</aside>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col">
		<header
			class="border-b border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
		>
			<h1 class="text-lg font-medium text-gray-900 dark:text-neutral-100">SE & AI LAB @ UNESA</h1>
		</header>

		<main class="flex-1 overflow-auto bg-white dark:bg-neutral-950">
			{@render children()}
		</main>

		<footer
			class="border-t border-gray-200 bg-white p-4 text-center text-sm font-light text-gray-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
		>
			<p>© {new Date().getFullYear()} SE LAB UNESA. All rights reserved.</p>
		</footer>
	</div>
</div>
