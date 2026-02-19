<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
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
	let lockCountdown = $state(0);

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

	function checkLockStatus() {
		const lockUntil = localStorage.getItem('lock_until');
		if (lockUntil) {
			const remaining = Math.ceil((parseInt(lockUntil) - Date.now()) / 1000);
			if (remaining > 0) {
				isLocked = true;
				lockCountdown = remaining;
				const timer = setInterval(() => {
					lockCountdown--;
					if (lockCountdown <= 0) {
						isLocked = false;
						failedAttempts = 0;
						localStorage.removeItem('lock_until');
						clearInterval(timer);
					}
				}, 1000);
			} else {
				localStorage.removeItem('lock_until');
			}
		}
	}

	async function validateToken() {
		if (!api.getToken()) {
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
			localStorage.removeItem('lock_until');
		} else {
			failedAttempts++;
			passwordInput = '';

			if (failedAttempts >= 3) {
				const lockTime = Date.now() + 30000;
				localStorage.setItem('lock_until', lockTime.toString());
				checkLockStatus();
				passwordError = 'Too many failed attempts. Try again in 30s.';
			} else {
				passwordError = error || `Incorrect credentials (${failedAttempts}/3 attempts)`;
			}
		}
	}
	function handleLogout() {
		api.logout();
		isAuthenticated = false;
	}

	onMount(() => {
		checkDevice();
		checkLockStatus();
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
	<div class="flex h-screen items-center justify-center text-gray-600 dark:text-neutral-400">
		Loading...
	</div>
{:else if !isDesktop}
	<div class="flex h-screen items-center justify-center bg-white p-6 dark:bg-neutral-950">
		<h1 class="text-2xl font-medium dark:text-neutral-100">Desktop Only</h1>
	</div>
{:else if !isAuthenticated}
	<div class="relative flex h-screen items-center justify-center">
		<div
			class="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white/80 p-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90"
		>
			<h1 class="text-center text-3xl font-medium dark:text-neutral-100">Admin Login</h1>
			<form onsubmit={handleLoginSubmit} class="mt-8 space-y-6">
				<input
					type="text"
					bind:value={usernameInput}
					placeholder="Username"
					disabled={isLocked}
					class="w-full rounded-lg border p-3 dark:bg-neutral-800 dark:text-neutral-100"
					required
				/>
				<input
					type="password"
					bind:value={passwordInput}
					placeholder="Password"
					disabled={isLocked}
					class="w-full rounded-lg border p-3 dark:bg-neutral-800 dark:text-neutral-100"
					required
				/>
				{#if passwordError}
					<p class="text-sm font-bold text-red-600 dark:text-red-400">
						{isLocked ? `${passwordError} (${lockCountdown}s)` : passwordError}
					</p>
				{/if}
				<button
					type="submit"
					disabled={isLocked}
					class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
				>
					{isLocked ? `Locked (${lockCountdown}s)` : 'Login'}
				</button>
			</form>
		</div>
	</div>
{:else}
	<div class="relative flex h-screen overflow-hidden">
		<aside
			class="flex flex-col border-r bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 {isExpanded
				? 'w-64'
				: 'w-16'}"
		>
			<button
				onclick={() => (isExpanded = !isExpanded)}
				class="p-4 text-gray-600 dark:text-neutral-100"
				aria-label="Toggle Menu"
			>
				<svg
					class="h-5 w-5 {isExpanded ? '' : 'rotate-180'}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/></svg
				>
			</button>
			<nav class="flex-1 space-y-2 p-2">
				<a
					href={resolve('/')}
					class="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						><path
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/></svg
					>
					{#if isExpanded}<span in:fly={{ x: -10 }}>Home</span>{/if}
				</a>
				<button
					onclick={handleLogout}
					class="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						><path
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/></svg
					>
					{#if isExpanded}<span in:fly={{ x: -10 }}>Logout</span>{/if}
				</button>
			</nav>
		</aside>
		<div class="flex flex-1 flex-col overflow-hidden">
			<header
				class="flex justify-between border-b bg-white/40 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/40"
			>
				<h1 class="font-medium dark:text-neutral-100">SE & AI LAB</h1>
				<button
					onclick={toggleDark}
					aria-label="Toggle dark mode"
					class="text-gray-600 dark:text-blue-400"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						><path
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/></svg
					>
				</button>
			</header>
			<main class="flex-1 overflow-y-auto">{@render children()}</main>
		</div>
	</div>
{/if}
