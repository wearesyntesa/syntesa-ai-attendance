<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type NotificationType = 'info' | 'success' | 'warning';

	interface Props {
		message: string;
		description?: string;
		type: NotificationType;
	}

	let { message, description, type }: Props = $props();

	const themes: Record<NotificationType, string> = {
		info: 'bg-white/80 dark:bg-neutral-900/80 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-neutral-100',
		success:
			'bg-white/80 dark:bg-neutral-900/80 border-apple-blue-500/50 dark:border-apple-blue-400/30 text-gray-900 dark:text-neutral-100',
		warning:
			'bg-white/80 dark:bg-neutral-900/80 border-amber-200 dark:border-amber-900/50 text-gray-900 dark:text-neutral-100'
	};

	const iconColors: Record<NotificationType, string> = {
		info: 'text-apple-blue-500 dark:text-apple-blue-400',
		success: 'text-apple-blue-500 dark:text-apple-blue-400',
		warning: 'text-amber-500'
	};
</script>

<div class="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-6">
	<div
		transition:scale={{ duration: 400, start: 0.95, easing: cubicOut }}
		class="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl {themes[
			type
		]}"
	>
		<div class={iconColors[type]}>
			{#if type === 'info' || type === 'warning'}
				<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			{:else if type === 'success'}
				<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			{/if}
		</div>

		<div class="flex flex-col gap-1">
			<h3 class="text-lg font-bold tracking-tight">{message}</h3>
			{#if description}
				<p class="text-sm leading-relaxed font-light text-gray-500 dark:text-neutral-400">
					{description}
				</p>
			{/if}
		</div>
	</div>
</div>
