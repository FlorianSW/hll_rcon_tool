import {map, Observable} from 'rxjs';
import {HttpClient} from "./http-client";

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
    constructor(private readonly client: HttpClient) {
    }

    info(): Observable<UserInformation> {
        return this.client.get<isLoggedInResponse>('/api/is_logged_in').pipe(map((r) => {
            return {
                isAuthenticated: r.result.authenticated,
                canChangeServerSettings: r.result.can_change_server_settings,
            } as UserInformation;
        }));
    }

    logOut(): Observable<void> {
        return this.client.get('/api/logout');
    }

    logIn(username: string, password: string): Observable<void> {
        return this.client.post<loginResponse>('/api/login', {
            username,
            password,
        }).pipe(map((r) => {
            if (!r.result || r.failed) {
                throw new Error('Login information is incorrect.');
            }
        }));
    }
}