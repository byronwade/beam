"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    root: node_path_1.default.resolve(__dirname),
    test: {
        environment: "node",
        include: ["test/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            thresholds: {
                lines: 70,
                branches: 60,
                functions: 70,
                statements: 70,
            },
        },
    },
    resolve: {
        alias: {
            vscode: node_path_1.default.resolve(__dirname, "test/__mocks__/vscode.ts"),
            "@extension": node_path_1.default.resolve(__dirname, "src"),
        },
    },
});
