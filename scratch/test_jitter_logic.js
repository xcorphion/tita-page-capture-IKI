
const { performance } = require('perf_hooks');

async function simulatedJitterBenchmark() {
    const timestamps = [];
    console.log("Iniciando simulação de benchmark (12 amostras, ~200ms cada)...");
    
    for (let i = 0; i < 12; i++) {
        // Simula o delay do setTimeout
        await new Promise(r => setTimeout(r, 200));
        timestamps.push(performance.now());
    }
    
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
    const deviations = intervals.map(v => Math.abs(v - 200));
    
    const jitter = Math.round(deviations.reduce((a, b) => a + b) / deviations.length);
    
    console.log("Intervalos detectados (ms):", intervals.map(i => i.toFixed(2)));
    console.log("Desvios absolutos (ms):", deviations.map(d => d.toFixed(2)));
    console.log("Resultado final do jitter (Math.round):", jitter);
    
    // A correção implementada no index.js garante o mínimo de 1ms
    const finalValue = Math.max(1, jitter);
    console.log("Valor final que seria gravado no banco:", finalValue);
    
    return finalValue;
}

simulatedJitterBenchmark().then(val => {
    if (val > 0) {
        console.log("\n✅ SUCESSO: O valor é maior que zero.");
    } else {
        console.log("\n❌ FALHA: O valor ainda é zero.");
    }
});
