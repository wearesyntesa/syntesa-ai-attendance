<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import UniverseBg from '$lib/components/UniverseBg.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isExpanded = $state(false);
	let isDark = $state(false);
	let isDesktop = $state(true);
	let isAuthenticated = $state(false);
	let passwordInput = $state('');
	let passwordError = $state('');
	let failedAttempts = $state(0);
	let isLocked = $state(false);

	function toggleDark() {
		document.documentElement.classList.toggle('dark');
		isDark = document.documentElement.classList.contains('dark');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	function checkDevice() {
		const userAgent = navigator.userAgent.toLowerCase();
		const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
			userAgent
		);
		const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
		isDesktop = !isMobile && !isTablet && window.innerWidth >= 1024;
	}

	function handlePasswordSubmit(e: Event) {
		e.preventDefault();

		if (isLocked) {
			passwordError = 'Access locked due to too many failed attempts';
			return;
		}

		if (passwordInput === import.meta.env.VITE_APP_PASSWORD) {
			isAuthenticated = true;
			passwordError = '';
			failedAttempts = 0;
		} else {
			failedAttempts++;
			passwordInput = '';

			if (failedAttempts >= 3) {
				isLocked = true;
				passwordError = 'Access locked due to too many failed attempts';
			} else {
				passwordError = `Incorrect password (${failedAttempts}/3 attempts)`;
			}
		}
	}

	onMount(() => {
		checkDevice();
		window.addEventListener('resize', checkDevice);

		const theme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (theme === 'dark' || (!theme && prefersDark)) {
			document.documentElement.classList.add('dark');
			isDark = true;
		}

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<UniverseBg />

{#if !isDesktop}
	<div class="flex h-screen items-center justify-center bg-white p-6 dark:bg-neutral-950">
		<div class="max-w-md text-center">
			<svg
				class="mx-auto h-16 w-16 text-gray-400 dark:text-neutral-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
			<h1 class="mt-6 text-2xl font-medium text-gray-900 dark:text-neutral-100">Desktop Only</h1>
			<p class="mt-3 text-gray-600 dark:text-neutral-400">
				This application is only available on desktop devices. Please access it from a computer with
				a larger screen.
			</p>
		</div>
	</div>
{:else if !isAuthenticated}
	<div class="relative flex h-screen items-center justify-center bg-transparent">
		<div
			class="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white/80 p-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80"
		>
			<div class="text-center">
				<h1 class="text-3xl font-medium text-gray-900 dark:text-neutral-100">
					SE & AI LAB @ UNESA
				</h1>
				<p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
					Enter password to access the lab attendance system
				</p>
			</div>

			{#if isLocked}
				<div
					class="rounded-lg border border-red-200 bg-red-50/80 p-6 text-center backdrop-blur-sm dark:border-red-900/50 dark:bg-red-900/20"
				>
					<svg
						class="mx-auto h-12 w-12 text-red-600 dark:text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
					<p class="mt-4 font-medium text-red-600 dark:text-red-400">Access Locked</p>
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">
						Too many failed login attempts. Please reload the page to try again.
					</p>
				</div>
			{:else}
				<form onsubmit={handlePasswordSubmit} class="mt-8 space-y-6">
					<div>
						<label for="password" class="sr-only">Password</label>
						<input
							id="password"
							type="password"
							bind:value={passwordInput}
							placeholder="Enter password"
							disabled={isLocked}
							class="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 backdrop-blur-sm transition-all outline-none focus:border-apple-blue-500 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder:text-neutral-600"
							required
						/>
					</div>

					{#if passwordError}
						<p class="text-sm font-medium text-red-600 dark:text-red-400">
							{passwordError}
						</p>
					{/if}

					<button
						type="submit"
						disabled={isLocked}
						class="w-full rounded-lg bg-apple-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-apple-blue-500/20 transition-all hover:bg-apple-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-apple-blue-500 dark:bg-apple-blue-400"
					>
						Access Lab System
					</button>
				</form>
			{/if}
		</div>
	</div>
{:else}
	<div class="relative flex h-screen overflow-hidden bg-transparent">
		<aside
			class="flex flex-col border-r border-gray-200 bg-white/80 text-gray-900 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-100 {isExpanded
				? 'w-64'
				: 'w-16'}"
		>
			<div
				class="flex items-center justify-center border-b border-gray-200 p-2 dark:border-neutral-800"
			>
				<button
					onclick={() => (isExpanded = !isExpanded)}
					class="rounded-sm p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100/50 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:focus:outline-apple-blue-400"
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

			<nav class="flex-1 space-y-1 p-2">
				<a
					href={resolve('/')}
					class="group flex items-center gap-3 rounded-sm p-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-apple-blue-400 dark:focus:outline-apple-blue-400"
					title="Home"
				>
					<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					{#if isExpanded}
						<span
							class="transition-opacity duration-300"
							in:fly={{ x: -10, duration: 200, easing: cubicOut }}>Home</span
						>
					{/if}
				</a>
				<a
					href={resolve('/attendance-list')}
					class="group flex items-center gap-3 rounded-sm p-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-apple-blue-400 dark:focus:outline-apple-blue-400"
					title="Activity Log"
				>
					<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
						/>
					</svg>
					{#if isExpanded}
						<span
							class="transition-opacity duration-300"
							in:fly={{ x: -10, duration: 200, easing: cubicOut }}>Activity Log</span
						>
					{/if}
				</a>
			</nav>
		</aside>

		<div class="flex flex-1 flex-col overflow-hidden bg-transparent">
			<header
				class="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white/40 px-6 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/40"
			>
				<h1 class="text-sm font-medium text-gray-900 dark:text-neutral-100">SE & AI LAB @ UNESA</h1>
				<button
					onclick={toggleDark}
					class="group relative flex items-center justify-center rounded-sm p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100/50 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:focus:outline-apple-blue-400"
					aria-label="Toggle dark mode"
					type="button"
				>
					<div class="relative h-5 w-5">
						<svg
							class="absolute inset-0 h-5 w-5 transition-all duration-300 {isDark
								? 'scale-0 rotate-90 opacity-0'
								: 'scale-100 rotate-0 opacity-100'}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						<svg
							class="absolute inset-0 h-5 w-5 text-apple-blue-400 transition-all duration-300 {isDark
								? 'scale-100 rotate-0 opacity-100'
								: 'scale-0 -rotate-90 opacity-0'}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					</div>
				</button>
			</header>

			<main class="flex-1 overflow-y-auto bg-transparent">
				{@render children()}
			</main>

			<footer
				class="shrink-0 border-t border-gray-200 bg-white/40 px-6 py-1.5 text-center backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/40"
			>
				<p class="text-xs text-gray-500 dark:text-neutral-400">
					© {new Date().getFullYear()} SE LAB UNESA
				</p>
			</footer>
		</div>
	</div>
{/if}
