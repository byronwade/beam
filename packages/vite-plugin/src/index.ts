import type { Plugin, ViteDevServer } from 'vite';
import { TunnelManager } from '@byronwade/beam';

interface BeamPluginOptions {
    /**
     * Helper log message to show in console
     */
    silent?: boolean;
}

export function beam(options: BeamPluginOptions = {}): Plugin {
    let tunnelManager: TunnelManager | null = null;

    return {
        name: 'vite-plugin-beam',
        configureServer(server: ViteDevServer) {
            const _print = server.printUrls;
            server.printUrls = async () => {
                _print();

                const port = server.config.server.port || 5173;

                if (!options.silent) {
                    if (!tunnelManager) {
                        tunnelManager = new TunnelManager();
                        try {
                            const daemon = await tunnelManager.start({
                                targetPort: port,
                                mode: 'balanced'
                            });

                            // Pipe output nicely
                            daemon.stdout?.on('data', (data) => {
                                const output = data.toString();
                                if (output.includes('onion') || output.includes('.local')) {
                                    const lines = output.split('\n').filter((l: string) => l.trim() !== '');
                                    lines.forEach((line: string) => {
                                        console.log(`  ➜  Beam:    ${line.trim()}`);
                                    });
                                }
                            });

                        } catch (e) {
                            console.error('  ➜  Beam:    Failed to start tunnel');
                        }
                    }
                }
            }
        },
        buildEnd() {
            if (tunnelManager) {
                tunnelManager.stop();
            }
        }
    };
}
