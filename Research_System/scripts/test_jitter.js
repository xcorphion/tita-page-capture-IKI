
/**
 * Jitter Benchmark Test Script (2026 Best Practices)
 * This script implements a robust jitter benchmark to measure event loop lag.
 * It uses performance.now() and multiple samples to ensure accuracy.
 */

async function runJitterBenchmark(samples = 20, expectedInterval = 100) {
    const delays = [];
    
    for (let i = 0; i < samples; i++) {
        const start = performance.now();
        await new Promise(r => setTimeout(r, expectedInterval));
        const end = performance.now();
        
        const actualInterval = end - start;
        const jitter = Math.abs(actualInterval - expectedInterval);
        delays.push(jitter);
    }
    
    // Remove outliers (highest 10%)
    delays.sort((a, b) => a - b);
    const trimmedDelays = delays.slice(0, Math.floor(samples * 0.9));
    
    const avgJitter = trimmedDelays.reduce((a, b) => a + b, 0) / trimmedDelays.length;
    const maxJitter = Math.max(...trimmedDelays);
    
    return {
        avg_jitter_ms: Math.round(avgJitter * 100) / 100,
        max_jitter_ms: Math.round(maxJitter * 100) / 100,
        samples: trimmedDelays.length
    };
}

// Export for use in browser or node (if performance.now is available)
if (typeof window !== 'undefined') {
    window.runJitterBenchmark = runJitterBenchmark;
} else if (typeof global !== 'undefined') {
    global.runJitterBenchmark = runJitterBenchmark;
}

// Self-test if run directly
if (typeof performance !== 'undefined') {
    console.log("Starting Jitter Benchmark Test...");
    runJitterBenchmark().then(res => {
        console.log("Benchmark Results:", res);
        if (res.avg_jitter_ms === 0 && res.max_jitter_ms === 0) {
            console.warn("WARNING: Jitter recorded as 0. This might be due to low timer resolution or extremely stable environment.");
        }
    });
}
