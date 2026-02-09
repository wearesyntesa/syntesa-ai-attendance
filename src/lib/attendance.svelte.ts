import { SvelteDate } from 'svelte/reactivity';

export const attendanceStore = $state({
	list: [
		{
			id: 1,
			name: 'Ahmad Fauzi',
			nim: '22051204001',
			attended: false,
			timeIn: '-',
			avatar: 'https://i.pravatar.cc/150?u=1'
		},
		{
			id: 2,
			name: 'Siti Aminah',
			nim: '22051204023',
			attended: false,
			timeIn: '-',
			avatar: 'https://i.pravatar.cc/150?u=2'
		},
		{
			id: 3,
			name: 'Budi Santoso',
			nim: '22051204045',
			attended: true,
			timeIn: '09:15 AM',
			avatar: 'https://i.pravatar.cc/150?u=3'
		},
		{
			id: 4,
			name: 'Dewi Lestari',
			nim: '22051204012',
			attended: false,
			timeIn: '-',
			avatar: 'https://i.pravatar.cc/150?u=4'
		},
		{
			id: 5,
			name: 'Rian Hidayat',
			nim: '22051204067',
			attended: false,
			timeIn: '-',
			avatar: 'https://i.pravatar.cc/150?u=5'
		}
	],

	toggle(id: number) {
		const student = this.list.find((s) => s.id === id);
		if (student) {
			student.attended = !student.attended;
			student.timeIn = student.attended
				? new SvelteDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
				: '-';
		}
	}
});
