/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} priority
 * @property {string} message
 * @property {string} [actionLabel]
 */

/**
 * EarningsAlertEngine
 * Monitora anomalias e gera alertas financeiros proativos.
 */
class EarningsAlertEngine {
    constructor() {
        this.activeAlerts = new Map();
        this.lastAlertTime = {};
        this.COOLDOWN_MS = 15 * 60 * 1000; // 15 minutos de cooldown por categoria
    }

    /**
     * Analisa as métricas atuais e o histórico para gerar alertas.
     * @param {import('../copilot/core/engine').CopilotMetrics} metrics 
     * @param {Object} context 
     * @returns {Alert[]}
     */
    analyze(metrics, context) {
        const alerts = [];

        // 1. Regra de Stop-Loss (Prejuízo Real)
        if (metrics.netProfit < -10 && metrics.hourlyRate < 0) {
            alerts.push(this.createAlert('STOP_LOSS', 'CRITICAL',
                'Pare de rodar agora. Você está em zona de prejuízo real acumulado.', 'Encerrar Turno'));
        }

        // 2. Regra de Decaimento de Eficiência (Margem Marginal)
        if (context.recentHourlyRate < metrics.hourlyRate * 0.7) {
            alerts.push(this.createAlert('EFFICIENCY_DROP', 'HIGH',
                'Sua rentabilidade caiu 30% na última hora. Considere mudar de região.'));
        }

        // 3. Otimização de Meta (Meta alcançada)
        if (context.goalReached && metrics.hourlyRate < context.avgHistoricalRate) {
            alerts.push(this.createAlert('GOAL_OPTIMIZATION', 'MEDIUM',
                'Meta batida e lucro/h em queda. É um ótimo momento para encerrar com lucro máximo.', 'Ver Resumo'));
        }

        // Filtrar por Cooldown para evitar spam
        return alerts.filter(alert => this.shouldFire(alert.id));
    }

    createAlert(id, priority, message, actionLabel) {
        return { id, priority, message, actionLabel };
    }

    /**
     * Verifica se o alerta pode ser disparado respeitando o cooldown.
     */
    shouldFire(alertId) {
        const now = Date.now();
        const lastTime = this.lastAlertTime[alertId] || 0;

        if (now - lastTime > this.COOLDOWN_MS) {
            this.lastAlertTime[alertId] = now;
            return true;
        }
        return false;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EarningsAlertEngine;
} else {
    window.EarningsAlertEngine = EarningsAlertEngine;
}
