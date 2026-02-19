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

export interface AdminAuthResponse {
	access_token: string;
	token_type: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class AttendanceAPI {
	private getToken(): string | null {
		return localStorage.getItem('admin_token');
	}

	private async request<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<{ data?: T; error?: string }> {
		const headers = new Headers(options?.headers);
		headers.set('Content-Type', 'application/json');

		const token = this.getToken();
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		try {
			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				...options,
				headers
			});

			if (!response.ok) {
				if (response.status === 401) {
					this.logout();
					window.location.reload();
					return { error: 'Session expired. Please login again.' };
				}
				const error = await response.json();
				return { error: error.detail || 'An error occurred' };
			}

			const data = await response.json();
			return { data };
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Network error' };
		}
	}

	async login(
		username: string,
		password: string
	): Promise<{ data?: AdminAuthResponse; error?: string }> {
		const result = await this.request<AdminAuthResponse>('/auth/admin', {
			method: 'POST',
			body: JSON.stringify({ username, password })
		});

		if (result.data) {
			localStorage.setItem('admin_token', result.data.access_token);
		}
		return result;
	}

	logout(): void {
		localStorage.removeItem('admin_token');
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
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
