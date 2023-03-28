import {AxiosInstance, HttpStatusCode} from 'axios';
import {defer, Observable} from 'rxjs';

export interface UserInformation {
    canChangeServerSettings: boolean;
    isAuthenticated: boolean;
}

interface isLoggedInResponse {
    failed: boolean;
    result: {
        authenticated: boolean;
        can_change_server_settings: boolean;
    }
}

interface loginResponse {
    failed: boolean;
    result: boolean;
}

export class UserinfoService {
    constructor(private readonly client: AxiosInstance) {
    }

    info(): Observable<UserInformation> {
        return defer(async () => {
            const r = await this.client.get<isLoggedInResponse>('/api/is_logged_in');
            if (r.status !== HttpStatusCode.Ok) {
                throw new Error('Could not fetch logged_in information: ' + r.status)
            }
            return {
                isAuthenticated: r.data.result.authenticated,
                canChangeServerSettings: r.data.result.can_change_server_settings,
            } as UserInformation;
        });
    }

    logOut(): Observable<void> {
        return defer(async () => {
            const r = await this.client.get('/api/logout');
            if (r.status !== HttpStatusCode.Ok) {
                throw new Error('Could not fetch logged_in information: ' + r.status)
            }
        });
    }

    logIn(username: string, password: string): Observable<void> {
        return defer(async () => {
            const r = await this.client.post<loginResponse>('/api/login', {
                username,
                password,
            });
            if (r.status !== HttpStatusCode.Ok) {
                throw new Error('Could not login information: ' + r.status)
            }
            if (!r.data.result || r.data.failed) {
                throw new Error('Login information is incorrect.');
            }
        });
    }
}