import { SvelteDate } from 'svelte/reactivity';

export interface Student {
	id: number;
	name: string;
	nim: string;
	avatar: string;
}

export interface AttendanceRecord {
	id: string;
	studentId: number;
	name: string;
	nim: string;
	avatar: string;
	date: string;
	timeIn: string;
	attended: boolean;
}

export const attendanceStore = $state({
	maxCapacity: 60,

	students: [
		{ id: 1, name: 'Ahmad Fauzi', nim: '22051204001', avatar: 'https://i.pravatar.cc/150?u=1' },
		{ id: 2, name: 'Siti Aminah', nim: '22051204023', avatar: 'https://i.pravatar.cc/150?u=2' },
		{ id: 3, name: 'Budi Santoso', nim: '22051204045', avatar: 'https://i.pravatar.cc/150?u=3' },
		{ id: 4, name: 'Dewi Lestari', nim: '22051204012', avatar: 'https://i.pravatar.cc/150?u=4' },
		{ id: 5, name: 'Rian Hidayat', nim: '22051204067', avatar: 'https://i.pravatar.cc/150?u=5' }
	] as Student[],

	list: [] as AttendanceRecord[],

	get occupancy(): number {
		return this.list.filter((r: AttendanceRecord) => r.attended).length;
	},

	toggle(studentId: number) {
		const activeRecord = this.list.find(
			(r: AttendanceRecord) => r.studentId === studentId && r.attended
		);

		if (!activeRecord) {
			if (this.occupancy >= this.maxCapacity) return;

			const master = this.students.find((s: Student) => s.id === studentId);
			if (!master) return;

			const newRecord: AttendanceRecord = {
				id: crypto.randomUUID(),
				studentId: master.id,
				name: master.name,
				nim: master.nim,
				avatar: master.avatar,
				date: new SvelteDate().toISOString().split('T')[0],
				timeIn: new SvelteDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				attended: true
			};

			this.list.unshift(newRecord);
		} else {
			activeRecord.attended = false;
		}
	}
});
