import { vi, beforeAll } from 'vitest';

// Mock process.exit to prevent it from actually exiting during tests
beforeAll(() => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        // Do nothing - prevent actual exit
        return undefined as never;
    });

    // Make sure the mock is not restored between tests
    mockExit.mockRestore = () => {};
});
