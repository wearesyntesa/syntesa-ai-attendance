<script lang="ts">
	import { api, type AttendanceHistory } from '$lib/api';
	import { SvelteMap } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let logs = $state<AttendanceHistory[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		await loadHistory();
	});

	const loadHistory = async () => {
		isLoading = true;
		const { data } = await api.getHistory();

		if (data) {
			logs = data;
		}

		isLoading = false;
	};

	let groupedLogs = $derived.by(() => {
		const groups = new SvelteMap<string, AttendanceHistory[]>();

		logs.forEach((log: AttendanceHistory) => {
			const date = new Date(log.check_in).toISOString().split('T')[0];
			if (!groups.has(date)) groups.set(date, []);
			groups.get(date)?.push(log);
		});

		return Array.from(groups.entries()).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
	});

	let currentOccupancy = $derived(logs.filter((log) => !log.check_out).length);
</script>

<div class="flex h-full flex-col bg-white px-6 py-6 dark:bg-neutral-950">
	<header
		class="mb-6 flex items-end justify-between border-b border-gray-200 pb-4 dark:border-neutral-800"
		in:fly={{ y: -20, duration: 400 }}
	>
		<div>
			<h1 class="text-2xl font-medium text-gray-900 dark:text-neutral-100">Activity History</h1>
			<p class="mt-1 text-sm font-light text-gray-600 dark:text-neutral-400">
				Review all historical check-in records.
			</p>
		</div>
		<div class="text-right">
			<p class="font-mono text-xs text-gray-400 uppercase">Live Occupancy</p>
			<p class="text-lg font-medium text-gray-900 dark:text-neutral-100">
				{currentOccupancy}/60
			</p>
		</div>
	</header>

	<div class="flex-1 space-y-6 overflow-y-auto">
		{#if isLoading}
			<div class="flex items-center justify-center py-20">
				<p class="text-gray-400">Loading...</p>
			</div>
		{:else}
			{#each groupedLogs as [date, dayLogs], index (date)}
				<div
					class="space-y-3"
					in:fly={{ y: 20, duration: 400, delay: index * 100, easing: cubicOut }}
				>
					<div class="flex items-center gap-3">
						<h2 class="text-base font-medium text-gray-900 dark:text-neutral-100">{date}</h2>
						<div class="h-px flex-1 bg-gray-100 dark:bg-neutral-800"></div>
					</div>

					<div
						class="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
					>
						<table class="w-full text-left text-sm">
							<thead
								class="border-b border-gray-200 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/50"
							>
								<tr>
									<th class="px-4 py-3 font-mono text-xs text-gray-500 uppercase">Visitor</th>
									<th class="px-4 py-3 font-mono text-xs text-gray-500 uppercase">Student ID</th>
									<th class="px-4 py-3 font-mono text-xs text-gray-500 uppercase">Time In</th>
									<th class="px-4 py-3 text-right font-mono text-xs text-gray-500 uppercase"
										>Status</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100 dark:divide-neutral-800/50">
								{#each dayLogs as log, logIndex (log.id)}
									<tr
										class="hover:bg-gray-50 dark:hover:bg-neutral-900"
										in:fade={{ duration: 300, delay: logIndex * 50 }}
									>
										<td class="flex items-center gap-2 px-4 py-3">
											<img src={log.foto_url} class="h-7 w-7 rounded-full object-cover" alt="" />
											<span class="font-medium text-gray-900 dark:text-neutral-100">{log.nama}</span
											>
										</td>
										<td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-neutral-400"
											>{log.nim}</td
										>
										<td class="px-4 py-3 text-gray-600 dark:text-neutral-400">
											{new Date(log.check_in).toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</td>
										<td class="px-4 py-3 text-right">
											<span
												class="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium
                                            {!log.check_out
													? 'bg-blue-500/10 text-blue-600'
													: 'bg-gray-100 text-gray-400 dark:bg-neutral-800'}"
											>
												{#if !log.check_out}
													<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></span>
													Inside
												{:else}
													Left Lab
												{/if}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-20 text-gray-400">
					<p>No attendance records found yet.</p>
				</div>
			{/each}
		{/if}
	</div>
</div>
