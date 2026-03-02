/**
 * CopilotModule
 * Orquestrador da Inteligência Suite.
 */
class CopilotModule {
    constructor() {
        this.engine = null;
        this.decisionEngine = null;
        this.alertEngine = new EarningsAlertEngine();
        this.container = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa o módulo com as configurações do motorista.
     * @param {Object} config 
     */
    init(config) {
        if (this.isInitialized) return;

        this.engine = new CopilotEngine(config);
        this.decisionEngine = new DecisionEngine(config);
        this.injectStyles();
        this.renderContainer();
        this.isInitialized = true;

        console.log('🚀 Copiloto GiroPro Inicializado');
    }

    injectStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'features/copilot/components/styles.css';
        document.head.appendChild(link);
    }

    renderContainer() {
        const target = document.getElementById('shift-content');
        if (!target) return;

        this.container = document.createElement('div');
        this.container.id = 'intelligence-suite';
        this.container.className = 'intel-cockpit';
        this.container.innerHTML = `
            <div class="intel-header">
                <span class="intel-badge">AI COPILOT</span>
                <span class="intel-title">Vantagem Financeira</span>
            </div>
            <div class="intel-grid">
                <div class="intel-card">
                    <span class="ic-label">Margem Real</span>
                    <span class="ic-value" id="intel-margin">...</span>
                </div>
                <div class="intel-card">
                    <span class="ic-label">Custo Total</span>
                    <span class="ic-value warning" id="intel-cost">...</span>
                </div>
            </div>
            <div id="intel-prediction-box" class="intel-prediction">
                <span class="ip-text">Previsão de Fechamento: <span class="ip-value" id="intel-proj-value">...</span></span>
            </div>
            <div id="intel-evaluator-box" class="intel-evaluator">
                <p class="ic-label">💼 Avaliador de Oportunidade</p>
                <div class="eval-inputs">
                    <input type="number" id="intel-eval-val" placeholder="R$ valor" class="intel-input-sm">
                    <input type="number" id="intel-eval-km" placeholder="km total" class="intel-input-sm">
                    <input type="number" id="intel-eval-time" placeholder="minutos" class="intel-input-sm">
                    <button class="intel-btn-eval" id="intel-btn-eval">AVALIAR</button>
                </div>
                <div id="intel-eval-result" class="intel-eval-result hidden"></div>
            </div>
            <div id="intel-advisor-area" class="intel-advisor">
                <!-- Alertas aqui -->
            </div>
        `;

        // Inserir após o profit-hero-cockpit
        const hero = document.querySelector('.profit-hero-cockpit');
        if (hero) {
            hero.insertAdjacentElement('afterend', this.container);
        } else {
            target.prepend(this.container);
        }
    }

    /**
     * Atualiza o estado da UI com novos dados.
     */
    update(revenue, distanceKm, durationHours, goal) {
        if (!this.isInitialized) return;

        const metrics = this.engine.calculateRealTimeMetrics(revenue, distanceKm, durationHours);
        const projection = this.engine.projectClosing(metrics, goal, 4); // Assume 4h restantes para exemplo

        // Atualizar UI
        document.getElementById('intel-margin').textContent = `R$ ${metrics.hourlyRate}/h`;
        document.getElementById('intel-cost').textContent = `R$ ${metrics.operationalCost}`;
        document.getElementById('intel-proj-value').textContent = `R$ ${projection.estimatedClosing}`;

        // Analisar Alertas
        const context = {
            recentHourlyRate: metrics.hourlyRate, // Simplificado
            goalReached: metrics.netProfit >= goal,
            avgHistoricalRate: 25 // Exemplo de valor histórico
        };

        const alerts = this.alertEngine.analyze(metrics, context);
        this.renderAlerts(alerts);
        this.setupEvaluator();
    }

    setupEvaluator() {
        if (this.evaluatorInitialized) return;

        const btn = document.getElementById('intel-btn-eval');
        if (!btn) return;

        btn.onclick = () => {
            const valor = parseFloat(document.getElementById('intel-eval-val').value);
            const km = parseFloat(document.getElementById('intel-eval-km').value);
            const time = parseFloat(document.getElementById('intel-eval-time').value) || 0;
            const resultArea = document.getElementById('intel-eval-result');

            if (!valor || !km) return;

            const result = this.decisionEngine.evaluate(valor, km, time);

            let color = 'warning';
            if (result.verdict === 'EXCELENTE' || result.verdict === 'BOM') color = 'success';
            if (result.verdict === 'RUIM') color = 'critical';

            resultArea.innerHTML = `
                <div class="eval-verdict ${color}">${result.verdict}</div>
                <div class="eval-recommendation">${result.recommendation}</div>
                <div class="eval-summary">
                    Lucro Real: <strong>R$ ${result.netProfit.toFixed(2)}</strong><br/>
                    ${result.profitPerHour.toFixed(2)}/h &nbsp;·&nbsp; ${result.profitPerKm.toFixed(2)}/km
                </div>
            `;
            resultArea.classList.remove('hidden');
        };

        this.evaluatorInitialized = true;
    }

    renderAlerts(alerts) {
        const area = document.getElementById('intel-advisor-area');
        if (alerts.length === 0) {
            area.innerHTML = `<p style="font-size: 11px; color: var(--text3); text-align: center;">Monitorando oportunidades em tempo real...</p>`;
            return;
        }

        area.innerHTML = alerts.map(alert => `
            <div class="advisor-alert ${alert.priority}">
                <div class="aa-icon">${alert.priority === 'CRITICAL' ? '🚨' : '💡'}</div>
                <div class="aa-content">
                    <div class="aa-message">${alert.message}</div>
                    ${alert.actionLabel ? `<div class="aa-action">${alert.actionLabel}</div>` : ''}
                </div>
            </div>
        `).join('');
    }
}

window.copilotModule = new CopilotModule();
