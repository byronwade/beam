interface BeamConfigOptions {
    enabled?: boolean;
    silent?: boolean;
    port?: number;
}
declare function withBeam(nextConfig?: any, beamConfig?: BeamConfigOptions): any;

export { withBeam };
