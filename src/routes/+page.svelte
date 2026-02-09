<script lang="ts">
	import { attendanceStore } from '$lib/attendance.svelte';

	let searchQuery = $state('');
	let foundStudent = $state<(typeof attendanceStore.list)[0] | null>(null);
	let errorMessage = $state('');

	const handleSearch = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			searchStudent();
		}
	};

	const searchStudent = () => {
		const nim = searchQuery.trim();
		if (!nim) {
			errorMessage = 'Please enter a NIM';
			foundStudent = null;
			return;
		}

		const student = attendanceStore.list.find((s) => s.nim === nim);

		if (student) {
			foundStudent = student;
			errorMessage = '';
		} else {
			foundStudent = null;
			errorMessage = 'Student not found with NIM: ' + nim;
		}
	};

	const handleInput = () => {
		if (!searchQuery.trim()) {
			foundStudent = null;
			errorMessage = '';
		}
	};

	const clearSearch = () => {
		searchQuery = '';
		foundStudent = null;
		errorMessage = '';
	};
</script>

<div class="relative flex h-full flex-col bg-white dark:bg-neutral-950">
	{#if !foundStudent}
		<div class="flex flex-1 flex-col items-center justify-center px-6">
			<div class="absolute top-6 right-6 flex gap-4">
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600">
						Inside
					</p>
					<p class="mt-1 text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						{attendanceStore.list.filter((s) => s.attended).length}
					</p>
				</div>
				<div class="h-10 w-px bg-gray-200 dark:bg-neutral-800"></div>
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600">
						Capacity
					</p>
					<p class="mt-1 text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						40
					</p>
				</div>
			</div>

			<div class="w-full max-w-2xl space-y-6 text-center">
				<div class="space-y-3">
					<h1 class="text-4xl font-medium tracking-tight text-gray-900 dark:text-neutral-100">
						Lab Attendance
					</h1>
					<p class="text-base font-light text-gray-600 dark:text-neutral-400">
						Enter your NIM to check in or check out
					</p>
				</div>

				<div class="group relative">
					<svg
						class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-apple-blue-500 dark:text-neutral-600 dark:group-focus-within:text-apple-blue-400"
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
						oninput={handleInput}
						onkeydown={handleSearch}
						placeholder="Enter your NIM..."
						class="w-full rounded-lg border border-gray-200 bg-white py-3 pr-6 pl-12 text-base text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-apple-blue-500 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-apple-blue-400 dark:focus:outline-apple-blue-400"
						autofocus
					/>
				</div>

				{#if searchQuery.trim() && !errorMessage}
					<p class="text-sm font-light text-gray-500 dark:text-neutral-400">
						Press <kbd
							class="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-900"
							>Enter</kbd
						> to search
					</p>
				{/if}

				{#if errorMessage}
					<div
						class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/10"
					>
						<p class="text-sm font-medium text-red-600 dark:text-red-400">
							{errorMessage}
						</p>
					</div>
				{/if}

				<div class="pt-4">
					<div class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-light">Enter your full NIM to continue</span>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex h-full flex-col px-6 py-4">
			<button
				onclick={clearSearch}
				class="mb-4 inline-flex w-fit items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				New Search
			</button>

			<div class="flex flex-1 flex-col gap-4 overflow-hidden">
				<header
					class="flex shrink-0 items-end justify-between gap-4 border-b border-gray-200 pb-4 dark:border-neutral-800"
				>
					<div>
						<h1 class="text-2xl font-medium tracking-tight text-gray-900 dark:text-neutral-100">
							Student Profile
						</h1>
						<p class="mt-1 text-sm leading-relaxed font-light text-gray-600 dark:text-neutral-400">
							Attendance information and check-in status
						</p>
					</div>

					<div class="flex gap-4">
						<div class="text-right">
							<p
								class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
							>
								Inside
							</p>
							<p class="mt-1 text-lg font-medium text-gray-900 tabular-nums dark:text-neutral-100">
								{attendanceStore.list.filter((s) => s.attended).length}
							</p>
						</div>
						<div class="h-10 w-px bg-gray-200 dark:bg-neutral-800"></div>
						<div class="text-right">
							<p
								class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
							>
								Capacity
							</p>
							<p class="mt-1 text-lg font-medium text-gray-900 tabular-nums dark:text-neutral-100">
								40
							</p>
						</div>
					</div>
				</header>

				<div
					class="flex-1 overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
				>
					<div class="grid h-full grid-cols-1 lg:grid-cols-3">
						<div
							class="flex items-center justify-center border-b border-gray-200 bg-gray-50/50 p-8 lg:border-r lg:border-b-0 dark:border-neutral-800 dark:bg-neutral-900/50"
						>
							<div class="text-center">
								<img
									src={foundStudent.avatar}
									alt="{foundStudent.name} avatar"
									class="mx-auto h-32 w-32 rounded-full bg-gray-100 object-cover ring-4 ring-gray-200 dark:bg-neutral-800 dark:ring-neutral-700"
								/>
								<div class="mt-4">
									{#if foundStudent.attended}
										<div
											class="inline-flex items-center gap-2 rounded-sm bg-apple-blue-500/10 px-3 py-1.5 dark:bg-apple-blue-400/10"
										>
											<span
												class="h-1.5 w-1.5 animate-pulse rounded-full bg-apple-blue-500 dark:bg-apple-blue-400"
											></span>
											<span class="text-xs font-medium text-apple-blue-600 dark:text-apple-blue-400"
												>Currently Inside</span
											>
										</div>
									{:else}
										<div
											class="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-3 py-1.5 dark:bg-neutral-800"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-neutral-600"></span>
											<span class="text-xs font-medium text-gray-600 dark:text-neutral-400"
												>Not Checked In</span
											>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="flex items-center p-8 lg:col-span-2">
							<div class="w-full space-y-6">
								<div>
									<p
										class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
									>
										Full Name
									</p>
									<h2 class="mt-1 text-2xl font-medium text-gray-900 dark:text-neutral-100">
										{foundStudent.name}
									</h2>
								</div>

								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<p
											class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
										>
											Student ID (NIM)
										</p>
										<p
											class="mt-1 font-mono text-base text-gray-900 tabular-nums dark:text-neutral-100"
										>
											{foundStudent.nim}
										</p>
									</div>

									{#if foundStudent.attended}
										<div>
											<p
												class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
											>
												Check-in Time
											</p>
											<p class="mt-1 text-base text-gray-900 tabular-nums dark:text-neutral-100">
												{foundStudent.timeIn}
											</p>
										</div>

										<div>
											<p
												class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-600"
											>
												Duration
											</p>
											<p class="mt-1 text-base text-gray-900 dark:text-neutral-100">
												Active Session
											</p>
										</div>
									{/if}
								</div>

								<div class="pt-2">
									<button
										onclick={() => {
											if (foundStudent) {
												attendanceStore.toggle(foundStudent.id);
											}
										}}
										class="inline-flex min-h-[44px] items-center justify-center rounded-sm px-6 py-2.5 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-2 focus:outline-offset-2 {foundStudent.attended
											? 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus:outline-apple-blue-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus:outline-apple-blue-400'
											: 'bg-apple-blue-500 text-white hover:bg-apple-blue-600 focus:outline-apple-blue-500 dark:bg-apple-blue-400 dark:text-white dark:hover:bg-apple-blue-500 dark:focus:outline-apple-blue-400'}"
									>
										{foundStudent.attended ? 'Check Out' : 'Check In'}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
