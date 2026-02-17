<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Notification from '$lib/components/Notification.svelte';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	interface Student {
		name: string;
		nim: string;
		avatar: string;
	}

	interface AttendanceRecord {
		timeIn: string;
	}

	let searchQuery = $state('');
	let foundStudent = $state<Student | null>(null);
	let errorMessage = $state('');

	let showToast = $state(false);
	let toastConfig = $state({ type: 'info' as 'info' | 'success', msg: '', desc: '' });

	const MAX_CAPACITY = 60;

	let currentInside = $state(0);
	let isFull = $derived(currentInside >= MAX_CAPACITY);

	let activeRecord = $state<AttendanceRecord | null>(null);

	onMount(async () => {
		await loadOccupancy();
	});

	const loadOccupancy = async () => {
		const { data } = await api.getHistory();
		if (data) {
			currentInside = data.filter((record) => !record.check_out).length;
		}
	};

	const handleSearch = (e: KeyboardEvent) => {
		if (e.key === 'Enter') searchStudent();
	};

	const searchStudent = async () => {
		const query = searchQuery.trim();
		if (!query) {
			errorMessage = 'Please enter a NIM';
			foundStudent = null;
			activeRecord = null;
			return;
		}

		const { data, error } = await api.search(query);

		if (error) {
			errorMessage = error;
			foundStudent = null;
			activeRecord = null;
			return;
		}

		if (data && data.length > 0) {
			const student = data[0];

			foundStudent = {
				name: student.nama,
				nim: student.nim,
				avatar: student.foto_url
			};

			const { data: history } = await api.getHistory();
			const activeSession = history?.find(
				(record) => record.nim === student.nim && !record.check_out
			);

			if (activeSession) {
				activeRecord = {
					timeIn: new Date(activeSession.check_in).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					})
				};
			} else {
				activeRecord = null;
			}

			errorMessage = '';
		} else {
			foundStudent = null;
			activeRecord = null;
			errorMessage = 'Student not found';
		}
	};

	const handleInput = () => {
		if (!searchQuery.trim()) {
			foundStudent = null;
			errorMessage = '';
			activeRecord = null;
		}
	};

	const clearSearch = () => {
		searchQuery = '';
		foundStudent = null;
		errorMessage = '';
		activeRecord = null;
	};

	const toggleAttendance = async () => {
		if (!foundStudent) return;

		const isCheckingIn = !activeRecord;
		const nim = foundStudent.nim;

		if (isCheckingIn) {
			const { data, error } = await api.checkIn(nim);

			if (error) {
				errorMessage = error;
				toastConfig = {
					type: 'info',
					msg: 'Check-in Failed',
					desc: error
				};
			} else if (data) {
				activeRecord = {
					timeIn: new Date(data.check_in).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					})
				};

				toastConfig = {
					type: 'info',
					msg: 'Check-in Successful',
					desc: "Welcome! Don't forget to check out before you leave."
				};

				await loadOccupancy();
			}
		} else {
			const { data, error } = await api.checkOut(nim);

			if (error) {
				errorMessage = error;
				toastConfig = {
					type: 'info',
					msg: 'Check-out Failed',
					desc: error
				};
			} else if (data) {
				activeRecord = null;

				toastConfig = {
					type: 'info',
					msg: 'Check-out Successful',
					desc: 'Thank you for coming! Have a great day.'
				};

				await loadOccupancy();
			}
		}

		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	};
</script>

{#if showToast}
	<Notification type={toastConfig.type} message={toastConfig.msg} description={toastConfig.desc} />
{/if}

<div class="relative flex h-full flex-col bg-transparent">
	{#if !foundStudent}
		<div class="flex flex-1 flex-col items-center justify-center px-6" in:fade={{ duration: 300 }}>
			<div class="absolute top-6 right-6 flex gap-4">
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-500">
						Inside
					</p>
					<p class="mt-1 text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						{currentInside}
					</p>
				</div>
				<div class="h-10 w-px bg-gray-200 dark:bg-neutral-800"></div>
				<div class="text-right">
					<p class="font-mono text-xs tracking-wider text-gray-400 uppercase dark:text-neutral-500">
						Capacity
					</p>
					<p class="mt-1 text-xl font-medium text-gray-900 tabular-nums dark:text-neutral-100">
						{MAX_CAPACITY}
					</p>
				</div>
			</div>

			<div class="w-full max-w-2xl space-y-6 text-center">
				<div class="space-y-3" in:fly={{ y: -20, duration: 600, delay: 100, easing: cubicOut }}>
					<h1 class="text-4xl font-medium tracking-tight text-gray-900 dark:text-neutral-100">
						Lab Attendance
					</h1>
					<p class="text-base font-light text-gray-600 dark:text-neutral-400">
						Enter your NIM to check in or check out
					</p>
				</div>

				<div class="group relative" in:fly={{ y: 20, duration: 600, delay: 200, easing: cubicOut }}>
					<svg
						class="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-apple-blue-500 dark:text-neutral-600 dark:group-focus-within:text-apple-blue-400"
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
						class="relative w-full rounded-lg border border-gray-200 bg-white/80 py-3 pr-6 pl-12 text-base text-gray-900 backdrop-blur-sm transition-all outline-none focus:border-apple-blue-500 focus:outline-2 focus:outline-offset-2 focus:outline-apple-blue-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder:text-neutral-600"
					/>
				</div>

				{#if isFull}<p class="text-sm font-medium text-amber-600 dark:text-amber-400">
						⚠️ Lab is currently at maximum capacity.
					</p>{/if}
				{#if errorMessage}
					<div
						class="rounded-lg border border-red-200 bg-red-50/80 p-3 backdrop-blur-sm dark:border-red-900/50 dark:bg-red-900/20"
						in:scale={{ duration: 300, start: 0.9, easing: cubicOut }}
					>
						<p class="text-sm font-medium text-red-600 dark:text-red-400">{errorMessage}</p>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex h-full flex-col px-6 py-4" in:fade={{ duration: 300 }}>
			<button
				onclick={clearSearch}
				class="mb-4 inline-flex w-fit items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-900/50"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/></svg
				>
				New Search
			</button>

			<div class="flex flex-1 flex-col gap-4 overflow-hidden">
				<header
					class="flex shrink-0 items-end justify-between gap-4 border-b border-gray-200 pb-4 dark:border-neutral-800"
					in:fly={{ y: -20, duration: 400, easing: cubicOut }}
				>
					<div>
						<h1 class="text-2xl font-medium tracking-tight text-gray-900 dark:text-neutral-100">
							Student Profile
						</h1>
						<p class="mt-1 text-sm font-light text-gray-600 dark:text-neutral-400">
							Status: {activeRecord ? 'Checked In' : 'Checked Out'}
						</p>
					</div>
				</header>

				<div
					class="flex-1 overflow-hidden rounded-sm border border-gray-200 bg-white/60 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40"
					in:scale={{ duration: 500, delay: 200, start: 0.95, easing: cubicOut }}
				>
					<div class="grid h-full grid-cols-1 lg:grid-cols-2">
						<div
							class="flex items-center justify-center border-b border-gray-200 bg-gray-50/30 p-12 lg:border-r lg:border-b-0 dark:border-neutral-800 dark:bg-neutral-800/20"
						>
							<div class="text-center">
								<img
									src={foundStudent.avatar}
									alt={foundStudent.name}
									class="mx-auto h-64 w-64 rounded-full bg-gray-100 object-cover ring-8 ring-gray-200/50 dark:bg-neutral-800 dark:ring-neutral-700/50"
									in:scale={{ duration: 600, delay: 300, start: 0.8, easing: cubicOut }}
								/>
								<div class="mt-8">
									<div
										class="inline-flex items-center gap-3 rounded-full {activeRecord
											? 'bg-apple-blue-500/10'
											: 'bg-gray-100/50 dark:bg-neutral-800/50'} px-6 py-2"
									>
										<span
											class="h-2.5 w-2.5 rounded-full {activeRecord
												? 'animate-pulse bg-apple-blue-500'
												: 'bg-gray-400'}"
										></span>
										<span
											class="text-sm font-semibold {activeRecord
												? 'text-apple-blue-600'
												: 'text-gray-600 dark:text-neutral-400'}"
											>{activeRecord ? 'Currently Inside' : 'Not Checked In'}</span
										>
									</div>
								</div>
							</div>
						</div>

						<div class="flex items-center p-12 lg:p-16">
							<div
								class="w-full space-y-10"
								in:fly={{ x: 20, duration: 600, delay: 300, easing: cubicOut }}
							>
								<div class="space-y-2">
									<p class="font-mono text-sm tracking-widest text-gray-400 uppercase">Full Name</p>
									<h2 class="text-5xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">
										{foundStudent.name}
									</h2>
								</div>

								<div class="grid grid-cols-1 gap-10">
									<div>
										<p class="font-mono text-sm tracking-widest text-gray-400 uppercase">
											Student ID (NIM)
										</p>
										<p
											class="mt-1 font-mono text-3xl font-light text-gray-900 dark:text-neutral-100"
										>
											{foundStudent.nim}
										</p>
									</div>
									{#if activeRecord}
										<div class="grid grid-cols-2 gap-4">
											<div>
												<p class="font-mono text-sm tracking-widest text-gray-400 uppercase">
													Check-in Time
												</p>
												<p class="mt-1 text-2xl text-gray-900 dark:text-neutral-100">
													{activeRecord.timeIn}
												</p>
											</div>
											<div>
												<p class="font-mono text-sm tracking-widest text-gray-400 uppercase">
													Status
												</p>
												<p class="mt-1 text-2xl text-gray-900 dark:text-neutral-100">Active</p>
											</div>
										</div>
									{/if}
								</div>

								<div class="pt-6">
									<button
										disabled={!activeRecord && isFull}
										onclick={toggleAttendance}
										class="inline-flex h-16 w-full items-center justify-center rounded-lg px-8 py-4 text-lg font-bold transition-all duration-200 active:scale-[0.98]
                                        {activeRecord
											? 'border-2 border-gray-200 bg-white/80 text-gray-900 hover:bg-gray-50/80 dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-100'
											: isFull
												? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600'
												: 'bg-apple-blue-500 text-white shadow-lg shadow-apple-blue-500/20 hover:bg-apple-blue-600 dark:bg-apple-blue-400'}"
									>
										{activeRecord
											? 'Check Out Student'
											: isFull
												? 'Lab is Full (60/60)'
												: 'Check In Student'}
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
