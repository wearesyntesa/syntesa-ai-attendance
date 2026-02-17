export interface StudentAPI {
	nim: string;
	nama: string;
	jenis_kelamin: string;
	prodi: string;
	angkatan: string;
	foto_url: string;
}

export interface AttendanceResponseBase {
	id: number;
	nim: string;
	nama: string;
	jenis_kelamin: string;
	prodi: string;
	angkatan: string;
	foto_url: string;
}

export interface AttendanceCheckInResponse {
	id: number;
	nim: string;
	nama: string;
	jenis_kelamin: string;
	prodi: string;
	angkatan: string;
	foto_url: string;
	check_in: string;
}

export interface AttendanceCheckOutResponse {
	id: number;
	nim: string;
	nama: string;
	jenis_kelamin: string;
	prodi: string;
	angkatan: string;
	foto_url: string;
	check_out: string;
}

export interface AttendanceHistory {
	id: number;
	nim: string;
	nama: string;
	jenis_kelamin: string;
	prodi: string;
	angkatan: string;
	foto_url: string;
	check_in: string;
	check_out: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class AttendanceAPI {
	private async request<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<{ data?: T; error?: string }> {
		try {
			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					...options?.headers
				},
				...options
			});

			if (!response.ok) {
				const error = await response.json();
				return { error: error.detail || 'An error occurred' };
			}

			const data = await response.json();
			return { data };
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Network error' };
		}
	}

	async search(q: string): Promise<{ data?: AttendanceResponseBase[]; error?: string }> {
		return this.request<AttendanceResponseBase[]>(`/attendance/search?q=${encodeURIComponent(q)}`);
	}

	async checkIn(nim: string): Promise<{ data?: AttendanceCheckInResponse; error?: string }> {
		return this.request<AttendanceCheckInResponse>('/attendance/checkin', {
			method: 'POST',
			body: JSON.stringify({ nim })
		});
	}

	async checkOut(nim: string): Promise<{ data?: AttendanceCheckOutResponse; error?: string }> {
		return this.request<AttendanceCheckOutResponse>('/attendance/checkout', {
			method: 'PATCH',
			body: JSON.stringify({ nim })
		});
	}

	async getHistory(): Promise<{ data?: AttendanceHistory[]; error?: string }> {
		return this.request<AttendanceHistory[]>('/attendance/history');
	}
}

export const api = new AttendanceAPI();
