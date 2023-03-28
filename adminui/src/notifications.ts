import {BehaviorSubject, Observable, tap} from 'rxjs';

export interface Notification {
    id: string;
    type: 'error' | 'warning' | 'success' | 'info';
    message: string;
    loading?: boolean;
}

const DEFAULT_LOADING_MESSAGE = 'Loading';

export class Notifications {
    private readonly subject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
    private readonly pendingMessages: Map<Notification, number> = new Map();

    constructor() {
        setInterval(() => {
            const now = new Date().getTime();
            this.pendingMessages.forEach((t, n) => {
                if (t <= now) {
                    this.appendMessage(n);
                    this.pendingMessages.delete(n);
                }
            });
        }, 1000);
    }

    asObservable(): Observable<Notification[]> {
        return this.subject.asObservable();
    }

    removeMessage(n: Notification) {
        this.pendingMessages.delete(n);
        const messages = this.subject.getValue();
        const deleteIdx = messages.indexOf(n);
        if (deleteIdx > -1) {
            messages.splice(deleteIdx, 1);
        }

        this.subject.next(messages);
    }

    error(message: string) {
        this.appendMessage({
            id: this.nextId(),
            type: 'error',
            message: message,
        });
    }

    info(message: string) {
        this.appendMessage({
            id: this.nextId(),
            type: 'info',
            message: message,
        });
    }

    connectTo<T>(o: Observable<T>): Observable<T> {
        const n = this.loading();
        return o.pipe(tap({
            next: () => this.removeMessage(n),
            complete: () => this.removeMessage(n),
            error: (e) => {
                this.removeMessage(n);
                this.error(e.toString());
            }
        }));
    }

    loading(message?: string): Notification {
        let n: Notification = {
            id: 'loading',
            type: 'info',
            message: message || DEFAULT_LOADING_MESSAGE,
            loading: true,
        };
        this.timeMessage(n, 0.25);
        return n;
    }

    warning(message: string) {
        this.appendMessage({
            id: this.nextId(),
            type: 'warning',
            message: message,
        });
    }

    success(message: string) {
        this.appendMessage({
            id: this.nextId(),
            type: 'success',
            message: message,
        });
    }

    private nextId(): string {
        return new Date().getTime().toString(10);
    }

    private appendMessage(n: Notification) {
        const messages = this.subject.getValue();
        messages.push(n);

        this.subject.next(messages);
    }

    private timeMessage(n: Notification, s: number) {
        this.pendingMessages.set(n, new Date().getTime() + (s * 1000));
    }
}