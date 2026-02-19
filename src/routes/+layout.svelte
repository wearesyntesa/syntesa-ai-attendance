<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import UniverseBg from '$lib/components/UniverseBg.svelte';
	import { onMount } from 'svelte';
	import { api } from '$lib/api';

	let { children } = $props();
	let isExpanded = $state(false);
	let isDark = $state(false);
	let isDesktop = $state(true);
	let isAuthenticated = $state(false);
	let usernameInput = $state('');
	let passwordInput = $state('');
	let passwordError = $state('');
	let failedAttempts = $state(0);
	let isLocked = $state(false);
	let isLoading = $state(true);

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

	async function validateToken() {
		if (!api.isAuthenticated()) {
			isAuthenticated = false;
			isLoading = false;
			return;
		}

		const { error } = await api.getHistory();
		if (error) {
			api.logout();
			isAuthenticated = false;
		} else {
			isAuthenticated = true;
		}
		isLoading = false;
	}

	async function handleLoginSubmit(e: Event) {
		e.preventDefault();
		if (isLocked) return;

		const { data, error } = await api.login(usernameInput, passwordInput);

		if (data) {
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
				passwordError = error || `Incorrect credentials (${failedAttempts}/3 attempts)`;
			}
		}
	}

	function handleLogout() {
		api.logout();
		isAuthenticated = false;
		usernameInput = '';
		passwordInput = '';
		passwordError = '';
		failedAttempts = 0;
		isLocked = false;
	}

	onMount(() => {
		checkDevice();
		window.addEventListener('resize', checkDevice);
		const theme = localStorage.getItem('theme');
		if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			document.documentElement.classList.add('dark');
			isDark = true;
		}
		validateToken();
		return () => window.removeEventListener('resize', checkDevice);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<UniverseBg />

{#if isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-gray-600 dark:text-neutral-400">Loading...</div>
	</div>
{:else if !isDesktop}
	<div class="flex h-screen items-center justify-center bg-white p-6 dark:bg-neutral-950">
		<div class="max-w-md text-center">
			<h1 class="text-2xl font-medium text-gray-900 dark:text-neutral-100">Desktop Only</h1>
			<p class="mt-3 text-gray-600 dark:text-neutral-400">Please access from a computer.</p>
		</div>
	</div>
{:else if !isAuthenticated}
	<div class="relative flex h-screen items-center justify-center">
		<div
			class="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white/80 p-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90"
		>
			<div class="text-center">
				<h1 class="text-3xl font-medium text-gray-900 dark:text-neutral-100">Admin Login</h1>
			</div>
			<form onsubmit={handleLoginSubmit} class="mt-8 space-y-6">
				<input
					type="text"
					bind:value={usernameInput}
					placeholder="Username"
					class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					required
					disabled={isLocked}
				/>
				<input
					type="password"
					bind:value={passwordInput}
					placeholder="Password"
					class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
					required
					disabled={isLocked}
				/>
				{#if passwordError}
					<p class="text-sm font-bold text-red-600 dark:text-red-400">
						{passwordError}
					</p>
				{/if}
				<button
					type="submit"
					class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500"
					disabled={isLocked}
				>
					Login
				</button>
			</form>
		</div>
	</div>
{:else}
	<div class="relative flex h-screen overflow-hidden">
		<aside
			class="flex flex-col border-r border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-950/80 {isExpanded
				? 'w-64'
				: 'w-16'}"
		>
			<div
				class="flex items-center justify-center border-b border-gray-200 p-2 dark:border-neutral-800"
			>
				<button
					onclick={() => (isExpanded = !isExpanded)}
					aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
					class="p-2 text-gray-600 dark:text-neutral-100"
				>
					<svg
						class="h-5 w-5 transition-transform {isExpanded ? '' : 'rotate-180'}"
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
					aria-label="Home"
					class="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					{#if isExpanded}
						<span in:fly={{ x: -10, duration: 200, easing: cubicOut }}>Home</span>
					{/if}
				</a>
				<button
					onclick={handleLogout}
					aria-label="Logout"
					class="flex w-full items-center gap-3 rounded-lg p-3 text-sm hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					{#if isExpanded}
						<span in:fly={{ x: -10, duration: 200, easing: cubicOut }}>Logout</span>
					{/if}
				</button>
			</nav>
		</aside>
		<div class="flex flex-1 flex-col overflow-hidden">
			<header
				class="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white/40 px-6 py-2 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/40"
			>
				<h1 class="text-sm font-medium dark:text-neutral-100">SE & AI LAB</h1>
				<button onclick={toggleDark} aria-label="Toggle dark mode" class="p-2">
					<div class="relative h-5 w-5">
						<svg
							class="absolute inset-0 h-5 w-5 transition-opacity {isDark
								? 'opacity-0'
								: 'opacity-100'} text-gray-600"
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
							class="absolute inset-0 h-5 w-5 transition-opacity {isDark
								? 'opacity-100'
								: 'opacity-0'} text-blue-400"
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
			<main class="flex-1 overflow-y-auto">{@render children()}</main>
		</div>
	</div>
{/if}
