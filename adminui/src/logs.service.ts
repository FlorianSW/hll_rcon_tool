import {map, Observable, of} from 'rxjs';
import {HttpClient} from "./http-client";

export interface Player {
    name: string;
    steamId: string;
}

export interface LogLine {
    action: string;
    lineWithoutTime: string;
    message: string;
    player: Player;
    opponentPlayer: Player | undefined;
    raw: string;
    relativeTimeMillis: number;
    subContent: string | undefined;
    timestamp: Date;
    weapon: string | undefined;
    version: number;
}

export interface Logs {
    actions: string[];
    logs: LogLine[];
    players: string[];
}

interface recentLogsResponse {
    failed: boolean;
    result: {
        actions: string[];
        logs: {
            action: string;
            line_without_time: string;
            message: string;
            player: string;
            player2: string | undefined;
            raw: string;
            relative_time_ms: number;
            steam_id_64_1: string;
            steam_id_64_2: string | undefined;
            sub_content: string | undefined;
            timestamp_ms: number;
            version: number;
            weapon: string | undefined;
        }[];
        players: string[];
    }
}

export class LogsService {
    constructor(private readonly client: HttpClient) {
    }

    setLimit(limit: number): Observable<void> {
        localStorage.setItem('logs_limit', limit.toString(10));
        return of(undefined);
    }

    setActionFilters(actions: string[], inclusive: boolean): Observable<void> {
        localStorage.setItem('logs_action_type', JSON.stringify(inclusive));
        localStorage.setItem('logs_action_filters', JSON.stringify(actions));
        return of(undefined);
    }

    setPlayerFilters(players: string[]): Observable<void> {
        localStorage.setItem('logs_player_filters', JSON.stringify(players));
        return of(undefined);
    }

    recentLogs(): Observable<Logs> {
        const body = {
            end: '500',
            filter_action: [],
            filter_player: [],
            inclusive_filter: false,
        };
        const cl = localStorage.getItem('logs_limit');
        if (cl !== null) {
            body.end = cl;
        }
        const at = localStorage.getItem('logs_action_type');
        if (at !== null) {
            body.inclusive_filter = JSON.parse(at);
        }
        const af = localStorage.getItem('logs_action_filters');
        if (af !== null) {
            body.filter_action = JSON.parse(af);
        }
        const pf = localStorage.getItem('logs_player_filters');
        if (pf !== null) {
            body.filter_player = JSON.parse(pf);
        }
        return this.client.post<recentLogsResponse>('/api/get_recent_logs', body).pipe(map((data) => {
            if (data.failed) {
                throw new Error('Failed loading recent logs')
            }
            return {
                actions: data.result.actions,
                players: data.result.players,
                logs: data.result.logs.map((l) => ({
                    action: l.action,
                    lineWithoutTime: l.line_without_time,
                    message: l.message,
                    player: {
                        name: l.player,
                        steamId: l.steam_id_64_1
                    },
                    opponentPlayer: l.player2 ? {
                        name: l.player2,
                        steamId: l.steam_id_64_2
                    } : undefined,
                    raw: l.raw,
                    relativeTimeMillis: l.relative_time_ms,
                    subContent: l.sub_content,
                    timestamp: new Date(l.timestamp_ms),
                    weapon: l.weapon,
                    version: l.version,
                })),
            } as Logs;
        }));
    }
}