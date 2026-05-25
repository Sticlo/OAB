import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * StorageService
 * Wrapper for localStorage and sessionStorage operations
 * SSR-safe: all operations are no-ops on the server
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Generic get from localStorage (returns raw string)
   */
  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage', error);
      return null;
    }
  }

  /**
   * Generic set to localStorage (accepts raw string)
   */
  setItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage', error);
    }
  }

  /**
   * Generic remove from localStorage
   */
  removeItem(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage', error);
    }
  }

  /**
   * Save data to localStorage
   */
  setLocal(key: string, value: any): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * Get data from localStorage
   */
  getLocal(key: string): any {
    if (!this.isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  removeLocal(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  }

  /**
   * Clear all localStorage
   */
  clearLocal(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Save data to sessionStorage
   */
  setSession(key: string, value: any): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage', error);
    }
  }

  /**
   * Get data from sessionStorage
   */
  getSession(key: string): any {
    if (!this.isBrowser) return null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage', error);
      return null;
    }
  }

  /**
   * Remove data from sessionStorage
   */
  removeSession(key: string): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage', error);
    }
  }

  /**
   * Clear all sessionStorage
   */
  clearSession(): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
    }
  }
}
