<script lang="ts">
	import { attendanceStore } from '$lib/attendance.svelte';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let logs = $derived(attendanceStore.list.filter((s) => s.attended));

	// Group logs by date
	let groupedLogs = $derived(() => {
		const groups = new SvelteMap<string, typeof logs>();

		logs.forEach((log) => {
			// Extract date from timeIn (assuming format like "09:30 AM")
			// For now, use today's date as dummy. Replace with actual date from your data
			const date = new Date().toISOString().split('T')[0];

			if (!groups.has(date)) {
				groups.set(date, []);
			}
			groups.get(date)?.push(log);
		});

		// Convert to array and sort by date (newest first)
		return Array.from(groups.entries()).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
	});

	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new SvelteDate(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
	};

	const exportToCSV = () => {
		// Create CSV content with dates
		const headers = ['Date', 'Name', 'Student ID', 'Time In', 'Status'];
		const rows = logs.map((log) => [
			new Date().toISOString().split('T')[0], // Replace with actual date from log
			log.name,
			log.nim,
			log.timeIn,
			'Present'
		]);
		const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

		// Create download link
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `attendance_log_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
</script>

<div class="flex h-full flex-col bg-white dark:bg-neutral-950">
	<div class="flex flex-1 flex-col overflow-hidden px-6 py-6">
		<div
			class="mb-6 flex shrink-0 items-end justify-between gap-4 border-b border-gray-200 pb-4 dark:border-neutral-800"
			in:fly={{ y: -20, duration: 400, easing: cubicOut }}
		>
			<div>
				<h1 class="text-2xl font-medium tracking-tight text-gray-900 dark:text-neutral-100">
					Activity Log
				</h1>
				<p class="mt-1 text-sm leading-relaxed font-light text-gray-600 dark:text-neutral-400">
					Real-time overview of laboratory occupancy and duration.
				</p>
			</div>

			<button
				onclick={exportToCSV}
				class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus:outline-apple-blue-400"
				disabled={logs.length === 0}
			>
				<svg
					class="h-4 w-4 text-gray-500 dark:text-neutral-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				Export CSV
			</button>
		</div>

		<div class="mb-6 grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
			<div
				class="space-y-1 rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
				in:scale={{ duration: 400, delay: 100, start: 0.9, easing: cubicOut }}
			>
				<span class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
					>Total Entries</span
				>
				<p class="text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
					{logs.length}
				</p>
			</div>
			<div
				class="space-y-1 rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
				in:scale={{ duration: 400, delay: 200, start: 0.9, easing: cubicOut }}
			>
				<span class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
					>Avg. Duration</span
				>
				<p class="text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
					45<span class="ml-1 text-sm font-light text-gray-500 dark:text-neutral-400">min</span>
				</p>
			</div>
			<div
				class="space-y-1 rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
				in:scale={{ duration: 400, delay: 300, start: 0.9, easing: cubicOut }}
			>
				<span class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
					>Peak Load</span
				>
				<p class="text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">10:00</p>
			</div>
			<div
				class="space-y-1 rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
				in:scale={{ duration: 400, delay: 400, start: 0.9, easing: cubicOut }}
			>
				<span class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
					>Occupancy</span
				>
				<p class="text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
					{logs.length}<span class="text-gray-300 dark:text-neutral-600">/40</span>
				</p>
			</div>
		</div>

		<div class="flex-1 space-y-6 overflow-y-auto">
			{#each groupedLogs() as [date, dayLogs], index (date)}
				<div class="space-y-3" in:fly={{ y: 20, duration: 400, delay: index * 100, easing: cubicOut }}>
					<div class="flex items-center gap-3">
						<h2 class="text-base font-medium text-gray-900 dark:text-neutral-100">
							{formatDate(date)}
						</h2>
						<span class="font-mono text-xs text-gray-400 dark:text-neutral-600">{date}</span>
						<div class="h-px flex-1 bg-gray-200 dark:bg-neutral-800"></div>
						<span class="text-xs font-light text-gray-500 dark:text-neutral-400"
							>{dayLogs.length} {dayLogs.length === 1 ? 'entry' : 'entries'}</span
						>
					</div>

					<div
						class="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
					>
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-left text-sm">
								<thead>
									<tr
										class="border-b border-gray-200 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/50"
									>
										<th
											class="px-4 py-3 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
											>Visitor</th
										>
										<th
											class="px-4 py-3 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
											>Student ID</th
										>
										<th
											class="px-4 py-3 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
											>Time In</th
										>
										<th
											class="px-4 py-3 text-right font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
											>Status</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100 dark:divide-neutral-800/50">
									{#each dayLogs as log, logIndex (log.id)}
										<tr
											class="transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
											in:fade={{ duration: 300, delay: logIndex * 50 }}
										>
											<td class="px-4 py-3">
												<div class="flex items-center gap-2">
													<img
														src={log.avatar}
														alt="{log.name} avatar"
														class="h-7 w-7 rounded-full bg-gray-100 object-cover ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-700"
													/>
													<span class="font-medium text-gray-900 dark:text-neutral-100"
														>{log.name}</span
													>
												</div>
											</td>
											<td
												class="px-4 py-3 font-mono text-xs text-gray-600 tabular-nums dark:text-neutral-400"
												>{log.nim}</td
											>
											<td
												class="px-4 py-3 font-light text-gray-600 tabular-nums dark:text-neutral-400"
												>{log.timeIn}</td
											>
											<td class="px-4 py-3 text-right">
												<span
													class="inline-flex items-center gap-1.5 rounded-sm bg-apple-blue-500/10 px-2.5 py-1 text-xs font-medium text-apple-blue-600 dark:bg-apple-blue-400/10 dark:text-white"
												>
													<span
														class="h-1.5 w-1.5 animate-pulse rounded-full bg-apple-blue-500 dark:bg-white"
													></span>
													Present
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
					in:scale={{ duration: 400, start: 0.9, easing: cubicOut }}
				>
					<div class="px-6 py-12 text-center text-gray-400 dark:text-neutral-600">
						<svg
							class="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-neutral-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<p class="font-medium text-gray-900 dark:text-neutral-100">No active records found.</p>
						<p class="mt-1 text-xs font-light">Check-ins will appear here automatically.</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
