/**
 * Framework Detection and Auto-Integration
 *
 * Detects the user's framework from package.json and provides
 * the appropriate integration method.
 */
type FrameworkType = "nextjs" | "vite" | "remix" | "astro" | "nuxt" | "sveltekit" | "unknown";
interface FrameworkInfo {
    type: FrameworkType;
    name: string;
    version?: string;
    configFile?: string;
    devCommand: string;
    defaultPort: number;
    integrationMethod: "wrapper" | "plugin" | "integration" | "generic";
}
/**
 * Detect the framework used in a project
 */
declare function detectFramework(projectPath?: string): FrameworkInfo;
/**
 * Get setup instructions for a framework
 */
declare function getSetupInstructions(framework: FrameworkInfo): string;

export { type FrameworkInfo, type FrameworkType, detectFramework, getSetupInstructions };
