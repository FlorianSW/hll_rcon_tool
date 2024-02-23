import {NEVER, Observable, of, switchMap, throwError} from "rxjs";
import {fromFetch} from "rxjs/internal/observable/dom/fetch";

export interface HttpClient {
    get<T>(url: string): Observable<T>;

    post<T>(url: string, body: any): Observable<T>;

    delete<T>(url: string): Observable<T>;
}

export default function createClient(): HttpClient {
    return new fetchClient();
}

function toResult<T>(r: Response): Promise<T> | Observable<T> {
    if (r.status === 403) {
        window.location.reload();
        return NEVER;
    }

    if (r.status === 204) {
        return of(undefined as T);
    } else if (r.status >= 200 && r.status < 400) {
        return contentFromNegotiation<T>(r);
    }
    return throwError(() => new Error('HTTP request failed with status code: ' + r.status));
}

function contentFromNegotiation<T>(r: Response): Promise<T> {
    if (!r.headers.has('Content-Type') || (r.headers.has('Content-Length') && r.headers.get('Content-Length')!! === '0')) {
        return Promise.resolve() as Promise<T>;
    } else if (r.headers.get('Content-Type')!!.startsWith('application/json')) {
        return r.json() as Promise<T>;
    } else {
        return r.text() as Promise<T>;
    }
}

class fetchClient implements HttpClient {
    get<T>(url: string): Observable<T> {
        return fromFetch(url, {
            method: 'GET',
        }).pipe(switchMap(toResult<T>));
    }

    post<T>(url: string, body: any): Observable<T> {
        return fromFetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        }).pipe(switchMap(toResult<T>));
    }

    delete<T>(url: string): Observable<T> {
        return fromFetch(url, {
            method: 'DELETE',
        }).pipe(switchMap(toResult<T>));
    }
}
