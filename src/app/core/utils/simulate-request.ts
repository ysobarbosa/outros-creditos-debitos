import { Observable, map, timer } from 'rxjs';


export function simulateRequest<T>(handler: () => T, latencyMs: number): Observable<T> {
  return timer(latencyMs).pipe(map(() => handler()));
}