import { Plugin } from 'vite';

interface BeamPluginOptions {
    /**
     * Helper log message to show in console
     */
    silent?: boolean;
}
declare function beam(options?: BeamPluginOptions): Plugin;

export { beam };
