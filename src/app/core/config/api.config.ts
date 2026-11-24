import { InjectionToken } from '@angular/core';

/**
 * The latency in milliseconds to simulate API calls. (this value is set to 0 to avoid delays in the tests)
 */
export const API_LATENCY_MS = new InjectionToken<number>('API_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 400,
});

/**
 * The institution code that will simulate an error in the API calls.
 */
export const SIMULATED_ERROR_INSTITUTION = '9999';

/**
 * The key used to store the current user in the local storage.
 */
export const CURRENT_USER = 'usuario.atual';