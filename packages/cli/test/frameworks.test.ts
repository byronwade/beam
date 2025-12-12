import { describe, it, expect } from 'vitest';
import { detectFramework } from '../src/index';

describe('Framework Detection', () => {
    it('should detect Next.js', () => {
        const pkg = { dependencies: { next: '13.0.0' } };
        const result = detectFramework(pkg);
        expect(result?.name).toBe('Next.js');
        expect(result?.defaultPort).toBe(3000);
    });

    it('should detect Vite', () => {
        const pkg = { devDependencies: { vite: '4.0.0' } };
        const result = detectFramework(pkg);
        expect(result?.name).toBe('Vite');
        expect(result?.defaultPort).toBe(5173);
    });

    it('should detect Astro', () => {
        const pkg = { dependencies: { astro: '3.0.0' } };
        const result = detectFramework(pkg);
        expect(result?.name).toBe('Astro');
        expect(result?.defaultPort).toBe(4321);
    });

    it('should return null for unknown frameworks', () => {
        const pkg = { dependencies: { express: '4.0.0' } };
        const result = detectFramework(pkg);
        expect(result).toBeNull();
    });

    it('should return null for empty package', () => {
        const pkg = {};
        const result = detectFramework(pkg);
        expect(result).toBeNull();
    });
});
