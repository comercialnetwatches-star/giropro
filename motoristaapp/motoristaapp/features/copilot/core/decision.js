/**
 * DecisionEngine
 * O cérebro de suporte à decisão do GiroPro.
 * Calcula a viabilidade financeira de uma corrida em milissegundos.
 */
class DecisionEngine {
    constructor(config) {
        this.config = config;

        // Pré-cálculo de constantes de custo para máxima performance
        this.costs = {
            fuelPerKm: config.combustivel / config.consumo,
            depreciationPerKm: config.valorCarro / (config.vidaUtil * config.kmAnual),
            maintenancePerKm: config.manutencao || 0.08,
            appFeeRate: (config.taxa || 25) / 100
        };

        this.costs.totalVariablePerKm = this.costs.fuelPerKm + this.costs.depreciationPerKm + this.costs.maintenancePerKm;
    }

    /**
     * Avalia uma corrida instantaneamente.
     * @param {number} value - Valor bruto da corrida oferecido pelo app (R$).
     * @param {number} distanceKm - Distância total (até passageiro + viagem).
     * @param {number} estimatedTimeMinutes - Tempo estimado (incluindo trânsito).
     * @returns {Object} Veredito financeiro completo.
     */
    evaluate(value, distanceKm, estimatedTimeMinutes) {
        const timeHours = estimatedTimeMinutes / 60;

        // 1. Custos Diretos
        const appFee = value * this.costs.appFeeRate;
        const vehicleCost = distanceKm * this.costs.totalVariablePerKm;

        // 2. Custo de Oportunidade (Fixed Rate / Hour)
        // Rateamos custos fixos mensais por hora de trabalho
        const fixedCostPerHour = (this.config.seguroMensal / this.config.horasMes) || 1.60;
        const opportunityCost = timeHours * fixedCostPerHour;

        // 3. Lucro Líquido Real
        const netProfit = value - appFee - vehicleCost - opportunityCost;

        // 4. KPIs de Decisão
        const profitPerKm = distanceKm > 0 ? netProfit / distanceKm : 0;
        const profitPerHour = timeHours > 0 ? netProfit / timeHours : 0;

        // 5. Matriz de Veredito (Lógica de Score)
        const verdict = this.getVerdict(profitPerKm, profitPerHour);

        return {
            netProfit: Number(netProfit.toFixed(2)),
            profitPerKm: Number(profitPerKm.toFixed(2)),
            profitPerHour: Number(profitPerHour.toFixed(2)),
            verdict: verdict.type,
            recommendation: verdict.message,
            score: verdict.score // 0-100
        };
    }

    /**
     * Lógica de Veredito Profissional
     * @private
     */
    getVerdict(ppk, pph) {
        // Pesos: Lucro/KM é mais importante para preservação de patrimônio, 
        // Lucro/Hora é mais importante para meta diária.

        if (ppk >= 1.5 && pph >= 25) {
            return { type: 'EXCELENTE', message: 'ACEITAR AGORA. Alta margem e alta taxa horária.', score: 95 };
        }

        if (ppk >= 1.0 && pph >= 18) {
            return { type: 'BOM', message: 'ACEITAR. Corrida saudável para bater a meta.', score: 75 };
        }

        if (ppk >= 0.7 && pph >= 12) {
            return { type: 'NEUTRO', message: 'ACEITAR COM RESSALVAS. Use apenas para completar volume ou se mover para zona melhor.', score: 50 };
        }

        if (ppk < 0.5 || pph < 8) {
            return { type: 'RUIM', message: 'RECUSAR. Prejuízo invisível ou taxa horária de sobrevivência.', score: 20 };
        }

        return { type: 'NEUTRO', message: 'ACEITAR COM RESSALVAS. Margem apertada.', score: 40 };
    }
}

// Export initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DecisionEngine;
} else {
    window.DecisionEngine = DecisionEngine;
}
