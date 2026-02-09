<script lang="ts">
	import { attendanceStore } from '$lib/attendance.svelte';

	let searchQuery = $state('');

	let filteredStudents = $derived(
		attendanceStore.list.filter(
			(s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery)
		)
	);
</script>

<div class="relative min-h-screen bg-white dark:bg-neutral-950">
	<div class="mx-auto max-w-[1920px] px-6 py-8 sm:px-12">
		<header
			class="mb-8 flex flex-col justify-between gap-6 border-b border-gray-200 pb-8 md:flex-row md:items-end dark:border-neutral-800"
		>
			<div>
				<h1
					class="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl dark:text-neutral-100"
				>
					Lab Attendance
				</h1>
				<p class="mt-2 leading-relaxed font-light text-gray-600 dark:text-neutral-400">
					Manage visitor access and real-time capacity.
				</p>
			</div>

			<div class="flex gap-6">
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600">
						Inside
					</p>
					<p class="mt-1 text-2xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						{attendanceStore.list.filter((s) => s.attended).length}
					</p>
				</div>
				<div class="h-12 w-px bg-gray-200 dark:bg-neutral-800"></div>
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600">
						Capacity
					</p>
					<p class="mt-1 text-2xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						40
					</p>
				</div>
			</div>
		</header>

		<div class="mb-8">
			<div class="group relative max-w-md">
				<svg
					class="group-focus-within:text-apple-blue-500 dark:group-focus-within:text-apple-blue-400 absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors dark:text-neutral-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name or NIM..."
					class="focus:border-apple-blue-500 focus:outline-apple-blue-500 dark:focus:border-apple-blue-400 dark:focus:outline-apple-blue-400 w-full rounded-sm border border-gray-200 bg-white py-2.5 pr-4 pl-11 text-sm text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600"
				/>
			</div>
		</div>

		<div
			class="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
		>
			<table class="w-full border-collapse text-left">
				<thead>
					<tr
						class="border-b border-gray-200 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/50"
					>
						<th
							class="px-6 py-4 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
						>
							Member
						</th>
						<th
							class="px-6 py-4 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
						>
							Identification
						</th>
						<th
							class="px-6 py-4 font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
						>
							Status
						</th>
						<th
							class="px-6 py-4 text-right font-mono text-xs tracking-wider text-gray-500 uppercase dark:text-neutral-400"
						>
							Action
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-neutral-800/50">
					{#each filteredStudents as student (student.id)}
						<tr
							class="transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-gray-50 dark:hover:bg-neutral-900"
						>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<img
										src={student.avatar}
										alt="{student.name} avatar"
										class="h-10 w-10 rounded-full bg-gray-100 object-cover ring-1 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-700"
									/>
									<div>
										<p class="font-medium text-gray-900 dark:text-neutral-100">{student.name}</p>
										<p class="text-xs text-gray-500 dark:text-neutral-400">Regular Member</p>
									</div>
								</div>
							</td>
							<td
								class="px-6 py-4 font-mono text-sm text-gray-600 tabular-nums dark:text-neutral-400"
							>
								{student.nim}
							</td>
							<td class="px-6 py-4">
								{#if student.attended}
									<div class="flex items-center gap-2">
										<span
											class="bg-apple-blue-500 dark:bg-apple-blue-400 h-1.5 w-1.5 animate-pulse rounded-full"
										></span>
										<span
											class="text-sm font-light text-gray-600 tabular-nums dark:text-neutral-400"
											>{student.timeIn}</span
										>
									</div>
								{:else}
									<span class="text-sm font-light text-gray-300 dark:text-neutral-600">—</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => attendanceStore.toggle(student.id)}
									class="inline-flex min-h-[44px] items-center justify-center rounded-sm px-5 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-2 focus:outline-offset-2 {student.attended
										? 'focus:outline-apple-blue-500 dark:focus:outline-apple-blue-400 border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900'
										: 'bg-apple-blue-500 hover:bg-apple-blue-600 focus:outline-apple-blue-500 dark:bg-apple-blue-400 dark:hover:bg-apple-blue-500 dark:focus:outline-apple-blue-400 text-white dark:text-white'}"
								>
									{student.attended ? 'Check Out' : 'Check In'}
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="px-6 py-16 text-center text-gray-400 dark:text-neutral-600">
								<p class="font-light">No students found matching your search.</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
