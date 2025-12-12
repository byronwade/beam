import { TunnelManager } from '@byronwade/beam';

interface BeamConfigOptions {
    enabled?: boolean;
    silent?: boolean;
    port?: number;
}

export function withBeam(nextConfig: any = {}, beamConfig: BeamConfigOptions = {}) {
    return {
        ...nextConfig,
        webpack: (config: any, options: any) => {
            // Only run on the server side in dev mode
            if (options.dev && options.isServer) {
                const { enabled = true, silent = false, port = 3000 } = beamConfig;

                if (enabled && !process.env.BEAM_INITIALIZED) {
                    process.env.BEAM_INITIALIZED = 'true';
                    startBeamTunnel(port, silent);
                }
            }

            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options);
            }

            return config;
        }
    };
}

async function startBeamTunnel(port: number, silent: boolean) {
    const tunnelManager = new TunnelManager();
    try {
        if (!silent) {
            console.log('  ➜  Beam:    Initializing tunnel...');
        }

        const daemon = await tunnelManager.start({
            targetPort: port,
            mode: 'balanced'
        });

        // Pipe output nicely
        daemon.stdout?.on('data', (data) => {
            const output = data.toString();
            if ((output.includes('onion') || output.includes('.local')) && !silent) {
                const lines = output.split('\n').filter((l: string) => l.trim() !== '');
                lines.forEach((line: string) => {
                    console.log(`  ➜  Beam:    ${line.trim()}`);
                });
            }
        });

        // Handle cleanup
        const cleanup = () => {
            tunnelManager.stop();
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);

    } catch (e: any) {
        if (!silent) console.error('  ➜  Beam:    Failed to start tunnel:', e.message);
    }
}
