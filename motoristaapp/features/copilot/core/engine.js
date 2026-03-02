/**
 * @typedef {Object} CopilotMetrics
 * @property {number} netProfit - Lucro líquido atual.
 * @property {number} hourlyRate - Taxa de ganho por hora.
 * @property {number} kmRate - Taxa de ganho por KM.
 * @property {number} operationalCost - Custo total operacional (combustível + depreciação + manutenção).
 */

/**
 * CopilotEngine
 * O "cérebro" financeiro da GiroPro.
 */
class CopilotEngine {
    constructor(config) {
        this.config = config;
        this.history = [];
    }

    /**
     * Calcula o lucro líquido real baseado na telemetria atual.
     * @param {number} revenue - Receita bruta acumulada.
     * @param {number} distanceKm - Distância total percorrida em KM.
     * @param {number} durationHours - Duração do turno em horas.
     * @returns {CopilotMetrics}
     */
    calculateRealTimeMetrics(revenue, distanceKm, durationHours) {
        const fuelCost = distanceKm * (this.config.combustivel / this.config.consumo);
        const depreciationCost = this.calculateDepreciation(distanceKm);
        const maintenanceCost = distanceKm * (this.config.manutencaoPerKm || 0.08);
        const fixedCosts = durationHours * (this.config.fixedCostsPerHour || 1.60);

        const totalOperationalCost = fuelCost + depreciationCost + maintenanceCost + fixedCosts;
        const netProfit = revenue - totalOperationalCost;

        const hourlyRate = durationHours > 0 ? netProfit / durationHours : 0;
        const kmRate = distanceKm > 0 ? netProfit / distanceKm : 0;

        return {
            netProfit: Number(netProfit.toFixed(2)),
            hourlyRate: Number(hourlyRate.toFixed(2)),
            kmRate: Number(kmRate.toFixed(2)),
            operationalCost: Number(totalOperationalCost.toFixed(2))
        };
    }

    /**
     * Calcula a depreciação dinâmica baseada no uso.
     * @param {number} km - Kilometragem percorrida.
     */
    calculateDepreciation(km) {
        const { valorCarro, vidaUtilAnos, kmAnualEstimado } = this.config;
        const depPerKm = valorCarro / (vidaUtilAnos * kmAnualEstimado);
        return km * depPerKm;
    }

    /**
     * Gera uma projeção de lucro para o fechamento do turno.
     * @param {CopilotMetrics} currentMetrics
     * @param {number} goal - Meta do turno.
     * @param {number} remainingHours - Horas restantes de trabalho.
     */
    projectClosing(currentMetrics, goal, remainingHours) {
        const projectedAdditionalProfit = currentMetrics.hourlyRate * remainingHours;
        const estimatedClosing = currentMetrics.netProfit + projectedAdditionalProfit;
        const probabilityOfGoal = estimatedClosing >= goal ? 1 : estimatedClosing / goal;

        return {
            estimatedClosing: Number(estimatedClosing.toFixed(2)),
            probabilityOfGoal: Number((probabilityOfGoal * 100).toFixed(0))
        };
    }
}

// Export for usage in ES modules environment (if supported) or global attachment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CopilotEngine;
} else {
    window.CopilotEngine = CopilotEngine;
}
