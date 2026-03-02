// ==================== REAL TIME PROFIT ENGINE ====================
// GiroPro — turno.js
// Copiloto financeiro em tempo real para motoristas de aplicativo

// ==================== STATE ====================
const shift = {
    active: false,
    startTime: null,
    timerInterval: null,
    updateInterval: null,
    insightInterval: null,
    elapsedSeconds: 0,
    rides: [],
    totalReceita: 0,
    totalKm: 0,
    metaValor: 300,
    drivingMode: false,
    milestones: [25, 50, 75, 100],
    milestonesHit: new Set(),
    lastHourLucro: 0,
    lastHourTimestamp: null,
};

// Config (loaded from storage or defaults)
let cfg = {
    combustivel: 6.20,
    consumo: 10,
    taxa: 25,
    manutencao: 0.08,
    valorCarro: 45000,
    vidaUtil: 5,
    kmAnual: 36000,
    seguroMensal: 280,
    horasMes: 176,
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    setGreeting();
    loadPreStats();
    syncConfigInputs();
    evaluateRide();

    // Load saved theme
    const theme = localStorage.getItem('GiroPro_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Restore active shift if page was refreshed
    const savedShift = localStorage.getItem('GiroPro_active_shift');
    if (savedShift) {
        const s = JSON.parse(savedShift);
        if (s.active && s.startTime) {
            restoreShift(s);
        }
    }
});

// ==================== CONFIG ====================
function loadConfig() {
    const saved = localStorage.getItem('GiroPro_turno_cfg');
    if (saved) {
        cfg = { ...cfg, ...JSON.parse(saved) };
    }
    // Also sync from main app config
    const mainCfg = localStorage.getItem('GiroPro_config');
    if (mainCfg) {
        const mc = JSON.parse(mainCfg);
        if (mc.combustivel) cfg.combustivel = mc.combustivel;
        if (mc.consumo) cfg.consumo = mc.consumo;
        if (mc.valorCarro) cfg.valorCarro = mc.valorCarro;
        if (mc.vidaUtil) cfg.vidaUtil = mc.vidaUtil;
        if (mc.kmAnual) cfg.kmAnual = mc.kmAnual;
    }
}

function saveConfig() {
    localStorage.setItem('GiroPro_turno_cfg', JSON.stringify(cfg));
}

function syncConfigInputs() {
    setVal('cfg-combustivel', cfg.combustivel);
    setVal('cfg-consumo', cfg.consumo);
    setVal('cfg-taxa', cfg.taxa);
    setVal('cfg-manutencao', cfg.manutencao);
    setVal('cfg-valor-carro', cfg.valorCarro);
    setVal('cfg-vida-util', cfg.vidaUtil);
    setVal('cfg-km-anual', cfg.kmAnual);
    setVal('cfg-seguro-mensal', cfg.seguroMensal);
    setVal('cfg-horas-mes', cfg.horasMes);
}

function openSettings() {
    syncConfigInputs();
    document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
    cfg.valorCarro = parseFloat(getVal('cfg-valor-carro')) || 45000;
    cfg.vidaUtil = parseFloat(getVal('cfg-vida-util')) || 5;
    cfg.kmAnual = parseFloat(getVal('cfg-km-anual')) || 36000;
    cfg.seguroMensal = parseFloat(getVal('cfg-seguro-mensal')) || 280;
    cfg.horasMes = parseFloat(getVal('cfg-horas-mes')) || 176;
    saveConfig();
    closeSettings();
    showToast('✓ Configurações salvas', 'success');
}

// ==================== GREETING ====================
function setGreeting() {
    const h = new Date().getHours();
    let g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    setText('greeting-time', g);
}

// ==================== PRE-STATS ====================
function loadPreStats() {
    const entries = JSON.parse(localStorage.getItem('GiroPro_entries') || '[]');

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Lucro ontem
    const yesterdayEntries = entries.filter(e => e.data === yesterday);
    const lucroOntem = calcLucroFromEntries(yesterdayEntries);
    setText('pre-lucro-ontem', formatCurrency(lucroOntem));

    // Melhor dia do mês
    const monthEntries = getMonthEntries(entries);
    const byDay = {};
    monthEntries.forEach(e => {
        if (!byDay[e.data]) byDay[e.data] = [];
        byDay[e.data].push(e);
    });

    let melhorDia = 0;
    Object.values(byDay).forEach(dayEntries => {
        const l = calcLucroFromEntries(dayEntries);
        if (l > melhorDia) melhorDia = l;
    });
    setText('pre-melhor-dia', formatCurrency(melhorDia));

    // Média diária
    const days = Object.keys(byDay).length;
    const totalLucro = Object.values(byDay).reduce((sum, de) => sum + calcLucroFromEntries(de), 0);
    const media = days > 0 ? totalLucro / days : 0;
    setText('pre-media-dia', formatCurrency(media));
}

function calcLucroFromEntries(entries) {
    const receita = entries.filter(e => e.tipo === 'receita').reduce((s, e) => s + e.valor, 0);
    const despesas = entries.filter(e => e.tipo !== 'receita').reduce((s, e) => s + e.valor, 0);
    const km = entries.filter(e => e.tipo === 'receita').reduce((s, e) => s + (e.km || 0), 0);
    const dep = calcDepreciacao(km);
    return receita - despesas - dep;
}

function getMonthEntries(entries) {
    const now = new Date();
    return entries.filter(e => {
        const d = new Date(e.data);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
}

// ==================== META ====================
function setMeta(valor) {
    document.getElementById('meta-dia-valor').value = valor;
    document.querySelectorAll('.meta-preset').forEach(b => {
        b.classList.toggle('active', parseInt(b.textContent.replace('R$', '')) === valor);
    });
}

// ==================== SHIFT CONTROL ====================
function startShift() {
    // Read config from inputs
    cfg.combustivel = parseFloat(getVal('cfg-combustivel')) || 6.20;
    cfg.consumo = parseFloat(getVal('cfg-consumo')) || 10;
    cfg.taxa = parseFloat(getVal('cfg-taxa')) || 25;
    cfg.manutencao = parseFloat(getVal('cfg-manutencao')) || 0.08;
    saveConfig();

    shift.metaValor = parseFloat(getVal('meta-dia-valor')) || 300;
    shift.active = true;
    shift.startTime = Date.now();
    shift.elapsedSeconds = 0;
    shift.rides = [];
    shift.totalReceita = 0;
    shift.totalKm = 0;
    shift.milestonesHit = new Set();
    shift.lastHourLucro = 0;
    shift.lastHourTimestamp = Date.now();

    // Update goal display
    setText('goal-target', formatCurrency(shift.metaValor));

    // Switch screen
    showScreen('screen-active');

    // Start timers
    shift.timerInterval = setInterval(updateTimer, 1000);
    shift.updateInterval = setInterval(updateDashboard, 500); // 500ms updates
    shift.insightInterval = setInterval(generateInsight, 30000); // insight every 30s

    // Save to storage (for page refresh recovery)
    saveShiftState();

    // Initial update
    updateDashboard();
    generateInsight();

    // Initialize Intelligence Suite
    if (window.copilotModule) {
        window.copilotModule.init(cfg);
    }

    // Animate start button
    const btn = document.getElementById('btn-start');
    if (btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 200);
    }
}

function restoreShift(saved) {
    shift.active = true;
    shift.startTime = saved.startTime;
    shift.rides = saved.rides || [];
    shift.metaValor = saved.metaValor || 300;
    shift.milestonesHit = new Set(saved.milestonesHit || []);

    // Recalculate totals
    shift.totalReceita = shift.rides.reduce((s, r) => s + r.valor, 0);
    shift.totalKm = shift.rides.reduce((s, r) => s + (r.km || 0), 0);

    showScreen('screen-active');
    setText('goal-target', formatCurrency(shift.metaValor));

    shift.timerInterval = setInterval(updateTimer, 1000);
    shift.updateInterval = setInterval(updateDashboard, 500);
    shift.insightInterval = setInterval(generateInsight, 30000);

    renderShiftRides();
    updateDashboard();
    generateInsight();

    // Initialize Intelligence Suite
    if (window.copilotModule) {
        window.copilotModule.init(cfg);
    }
}

function endShift() {
    if (!confirm('Encerrar o turno agora?')) return;

    clearInterval(shift.timerInterval);
    clearInterval(shift.updateInterval);
    clearInterval(shift.insightInterval);

    shift.active = false;
    localStorage.removeItem('GiroPro_active_shift');

    // Save rides to main app storage
    saveShiftToMainApp();

    // Show summary
    showSummary();
    showScreen('screen-summary');
}

function saveShiftState() {
    localStorage.setItem('GiroPro_active_shift', JSON.stringify({
        active: shift.active,
        startTime: shift.startTime,
        rides: shift.rides,
        metaValor: shift.metaValor,
        milestonesHit: [...shift.milestonesHit],
    }));
}

function saveShiftToMainApp() {
    const existing = JSON.parse(localStorage.getItem('GiroPro_entries') || '[]');
    const today = new Date().toISOString().split('T')[0];

    shift.rides.forEach(ride => {
        existing.push({
            id: Date.now() + Math.random(),
            tipo: 'receita',
            categoria: ride.plataforma,
            descricao: `Corrida (turno)`,
            data: today,
            valor: ride.valor,
            km: ride.km || 0,
            horas: 0,
        });
    });

    // Add fuel cost
    const custosComb = calcCombustivelTotal();
    if (custosComb > 0) {
        existing.push({
            id: Date.now() + Math.random() + 1,
            tipo: 'despesa-variavel',
            categoria: 'combustivel',
            descricao: 'Combustível do turno',
            data: today,
            valor: custosComb,
        });
    }

    localStorage.setItem('GiroPro_entries', JSON.stringify(existing));
}

// ==================== TIMER ====================
function updateTimer() {
    shift.elapsedSeconds = Math.floor((Date.now() - shift.startTime) / 1000);
    const h = Math.floor(shift.elapsedSeconds / 3600);
    const m = Math.floor((shift.elapsedSeconds % 3600) / 60);
    const s = shift.elapsedSeconds % 60;
    setText('shift-timer', `${pad(h)}:${pad(m)}:${pad(s)}`);
}

// ==================== CALCULATIONS ====================
function calcDepreciacao(km) {
    const depPorKm = cfg.valorCarro / (cfg.vidaUtil * cfg.kmAnual);
    return depPorKm * km;
}

function calcDepreciacaoPorKm() {
    return cfg.valorCarro / (cfg.vidaUtil * cfg.kmAnual);
}

function calcCombustivelPorKm() {
    return cfg.combustivel / cfg.consumo;
}

function calcCombustivelTotal() {
    return calcCombustivelPorKm() * shift.totalKm;
}

function calcManutencaoTotal() {
    return cfg.manutencao * shift.totalKm;
}

function calcTaxaApps() {
    return shift.totalReceita * (cfg.taxa / 100);
}

function calcSeguroRateado() {
    // Seguro mensal / horas por mês * horas do turno
    const horasTurno = shift.elapsedSeconds / 3600;
    return (cfg.seguroMensal / cfg.horasMes) * horasTurno;
}

function calcLucroReal() {
    const receita = shift.totalReceita;
    const combustivel = calcCombustivelTotal();
    const manutencao = calcManutencaoTotal();
    const depreciacao = calcDepreciacao(shift.totalKm);
    const taxa = calcTaxaApps();
    const seguro = calcSeguroRateado();

    return receita - combustivel - manutencao - depreciacao - taxa - seguro;
}

function calcGanhoPorHora() {
    const horas = shift.elapsedSeconds / 3600;
    if (horas < 0.01) return 0;
    return calcLucroReal() / horas;
}

function calcGanhoPorKm() {
    if (shift.totalKm < 0.1) return 0;
    return calcLucroReal() / shift.totalKm;
}

// ==================== DASHBOARD UPDATE ====================
function updateDashboard() {
    const lucro = calcLucroReal();
    const combustivel = calcCombustivelTotal();
    const depreciacao = calcDepreciacao(shift.totalKm);
    const manutencao = calcManutencaoTotal();
    const taxa = calcTaxaApps();
    const seguro = calcSeguroRateado();
    const ganhoPorHora = calcGanhoPorHora();
    const ganhoPorKm = calcGanhoPorKm();

    // Profit Hero
    const profitEl = document.getElementById('profit-value');
    if (profitEl) {
        const prev = profitEl.textContent;
        const newVal = formatCurrency(lucro);
        if (prev !== newVal) {
            animateValue(profitEl, parseCurrency(prev), lucro, 600);
            profitEl.classList.add('number-flash');
            setTimeout(() => profitEl.classList.remove('number-flash'), 300);
        }

        // Color
        profitEl.className = 'profit-value ' + (lucro > 0 ? 'positive' : lucro > -10 ? 'neutral' : 'negative');
    }

    // Status (Cockpit Style)
    const statusBadge = document.getElementById('profit-status-badge');
    const statusText = document.getElementById('profit-status-text');
    if (statusBadge && statusText) {
        if (shift.rides.length === 0) {
            statusBadge.style.background = 'rgba(255, 255, 255, 0.05)';
            statusBadge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            statusBadge.style.color = 'var(--text-secondary)';
            statusText.textContent = 'AGUARDANDO CORRIDAS...';
        } else if (lucro > 0 && ganhoPorHora >= 20) {
            statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
            statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            statusBadge.style.color = 'var(--green)';
            statusText.textContent = '🟢 TURNO ALTAMENTE LUCRATIVO';
        } else if (lucro > 0) {
            statusBadge.style.background = 'rgba(245, 158, 11, 0.1)';
            statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
            statusBadge.style.color = 'var(--yellow)';
            statusText.textContent = '🟡 ATENÇÃO AO LUCRO/HORA';
        } else {
            statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            statusBadge.style.color = 'var(--red)';
            statusText.textContent = '🔴 CUSTOS SUPERANDO RECEITA';
        }
    }

    // Metrics (Cockpit Style)
    setText('rt-receita', formatCurrency(shift.totalReceita));
    setText('rt-combustivel', formatCurrency(combustivel));
    setText('rt-depreciacao', formatCurrency(depreciacao));
    setText('rt-manutencao', formatCurrency(manutencao));

    // Update Progress Bars in Cockpit Grid
    const fuelBars = document.querySelectorAll('.cg-progress-fill.fuel');
    if (fuelBars.length > 0) {
        const fuelPct = shift.totalReceita > 0 ? (combustivel / shift.totalReceita * 100) : 0;
        fuelBars.forEach(b => b.style.width = Math.min(100, fuelPct) + '%');
    }

    // Performance
    setText('perf-hora', formatCurrency(ganhoPorHora) + '/h');
    setText('perf-km', formatCurrency(ganhoPorKm) + '/km');
    setText('perf-km-total', shift.totalKm.toFixed(1) + ' km');
    setText('perf-corridas', shift.rides.length.toString());


    // Performance indicators
    setText('perf-hora-ind', ganhoPorHora >= 20 ? '🟢' : ganhoPorHora >= 12 ? '🟡' : shift.rides.length > 0 ? '🔴' : '—');
    setText('perf-km-ind', ganhoPorKm >= 1.5 ? '🟢' : ganhoPorKm >= 0.8 ? '🟡' : shift.rides.length > 0 ? '🔴' : '—');
    setText('perf-km-total-ind', shift.totalKm > 0 ? '📍' : '—');
    setText('perf-corridas-ind', shift.rides.length > 0 ? '✓' : '—');

    // Goal progress
    updateGoalProgress(lucro);

    // Driving mode update
    if (shift.drivingMode) {
        setText('dm-lucro', formatCurrency(lucro));
        setText('dm-hora', formatCurrency(ganhoPorHora) + '/h');
        setText('dm-km', formatCurrency(ganhoPorKm) + '/km');
        const dmBar = document.getElementById('dm-meta-bar');
        if (dmBar) {
            const pct = Math.min(100, (lucro / shift.metaValor) * 100);
            dmBar.style.width = Math.max(0, pct) + '%';
        }
        const falta = Math.max(0, shift.metaValor - lucro);
        setText('dm-meta-text', `Meta: ${formatCurrency(falta)} restante`);
    }

    // Update Intelligence Suite (Proactive Advisor)
    if (window.copilotModule && shift.active) {
        const horas = shift.elapsedSeconds / 3600;
        window.copilotModule.update(shift.totalReceita, shift.totalKm, horas, shift.metaValor);
    }
}

function updateGoalProgress(lucro) {
    const pct = Math.min(100, Math.max(0, (lucro / shift.metaValor) * 100));
    const falta = Math.max(0, shift.metaValor - lucro);

    const bar = document.getElementById('goal-bar');
    if (bar) bar.style.width = pct + '%';

    setText('goal-pct', pct.toFixed(1) + '%');
    setText('goal-current', formatCurrency(Math.max(0, lucro)) + ' conquistados');
    setText('goal-remaining', lucro >= shift.metaValor ? '🎉 Meta atingida!' : `Falta ${formatCurrency(falta)}`);

    // Milestone celebrations
    const milestones = [25, 50, 75, 100];
    milestones.forEach(m => {
        if (pct >= m && !shift.milestonesHit.has(m)) {
            shift.milestonesHit.add(m);
            showMilestone(m);
            saveShiftState();
        }
    });
}

function showMilestone(pct) {
    const badge = document.getElementById('milestone-badge');
    const text = document.getElementById('milestone-text');
    if (!badge || !text) return;

    const msgs = {
        25: '25% da meta! Continue assim! 💪',
        50: 'Metade do caminho! Você está arrasando! 🔥',
        75: '75% da meta! Quase lá! ⚡',
        100: 'META ATINGIDA! Incrível! 🏆',
    };

    text.textContent = msgs[pct] || `${pct}% da meta!`;
    badge.classList.remove('hidden');

    setTimeout(() => badge.classList.add('hidden'), 4000);
}

// ==================== INSIGHT ENGINE ====================
function generateInsight() {
    if (!shift.active) return;

    const lucro = calcLucroReal();
    const ganhoPorHora = calcGanhoPorHora();
    const ganhoPorKm = calcGanhoPorKm();
    const horasTurno = shift.elapsedSeconds / 3600;
    const combustivelPct = shift.totalReceita > 0 ? (calcCombustivelTotal() / shift.totalReceita * 100) : 0;
    const taxaPct = cfg.taxa;

    let insight = '';
    let icon = '🧠';
    let actions = [];

    // Análise de queda de lucro/hora
    if (shift.lastHourTimestamp && horasTurno > 1) {
        const lucroNaUltimaHora = lucro - shift.lastHourLucro;
        const lucroHoraAnterior = shift.lastHourLucro / Math.max(1, horasTurno - 1);
        const lucroHoraAtual = lucroNaUltimaHora;

        if (lucroHoraAnterior > 0 && lucroHoraAtual < lucroHoraAnterior * 0.72) {
            const queda = ((lucroHoraAnterior - lucroHoraAtual) / lucroHoraAnterior * 100).toFixed(0);
            insight = `⚠️ Seu lucro por hora caiu ${queda}% na última hora. Considere mudar de região ou aguardar horário de pico.`;
            icon = '⚠️';
            actions = [{ label: 'Entendido', action: '' }];
        }
    }

    // Atualiza referência de hora
    if (!shift.lastHourTimestamp || Date.now() - shift.lastHourTimestamp >= 3600000) {
        shift.lastHourLucro = lucro;
        shift.lastHourTimestamp = Date.now();
    }

    // Combustível alto
    if (!insight && combustivelPct > 40 && shift.rides.length > 0) {
        insight = `⚠️ Combustível está consumindo ${combustivelPct.toFixed(1)}% da sua receita. Considere rotas mais curtas ou reabastecer em posto mais barato.`;
        icon = '⛽';
    }

    // Lucro negativo
    if (!insight && lucro < -5 && shift.rides.length > 0) {
        insight = `🔴 Atenção: você está no prejuízo (${formatCurrency(lucro)}). Os custos estão superando a receita. Aceite mais corridas ou encerre o turno.`;
        icon = '🔴';
    }

    // Ganho/hora excelente
    if (!insight && ganhoPorHora >= 30 && shift.rides.length >= 2) {
        insight = `✅ Excelente produtividade! Você está ganhando ${formatCurrency(ganhoPorHora)}/hora — acima da média. Continue nesse ritmo!`;
        icon = '🔥';
    }

    // Perto da meta
    if (!insight && shift.metaValor > 0) {
        const pct = (lucro / shift.metaValor) * 100;
        if (pct >= 80 && pct < 100) {
            const falta = shift.metaValor - lucro;
            insight = `🎯 Você está a ${formatCurrency(falta)} da sua meta! Mais ${Math.ceil(falta / (ganhoPorHora || 20))} hora(s) de trabalho para atingi-la.`;
            icon = '🎯';
        }
    }

    // Poucas corridas
    if (!insight && horasTurno > 1 && shift.rides.length === 0) {
        insight = `💡 Você está há ${horasTurno.toFixed(1)}h sem registrar corridas. Lembre-se de registrar cada corrida para calcular seu lucro real.`;
        icon = '💡';
    }

    // Ganho/km baixo
    if (!insight && ganhoPorKm > 0 && ganhoPorKm < 0.8 && shift.rides.length >= 2) {
        insight = `📍 Seu ganho por km está em ${formatCurrency(ganhoPorKm)}/km — abaixo do ideal. Priorize corridas mais longas ou com valor maior.`;
        icon = '📍';
        actions = [{ label: 'Avaliar corrida', action: 'scrollToEvaluator()' }];
    }

    // Default
    if (!insight) {
        const msgs = [
            `🧠 Turno em andamento há ${formatTime(shift.elapsedSeconds)}. Lucro atual: ${formatCurrency(lucro)}. Continue registrando suas corridas!`,
            `📊 Você rodou ${shift.totalKm.toFixed(1)} km neste turno. Custo de combustível: ${formatCurrency(calcCombustivelTotal())}.`,
            `⏱️ Sua média de lucro por hora está em ${formatCurrency(ganhoPorHora)}. Meta recomendada: R$20/hora.`,
        ];
        insight = msgs[Math.floor(Date.now() / 30000) % msgs.length];
        icon = '🧠';
    }

    // Update UI
    setText('ie-icon', icon);
    setText('ie-text', insight);

    const actionsEl = document.getElementById('ie-actions');
    if (actionsEl) {
        actionsEl.innerHTML = actions.map(a =>
            `<button class="ie-action-btn" onclick="${a.action}">${a.label}</button>`
        ).join('');
    }
}

// ==================== RIDES ====================
function addRide() {
    const plataforma = getVal('ride-plataforma');
    const valor = parseFloat(getVal('ride-valor'));
    const km = parseFloat(getVal('ride-km')) || 0;

    if (!valor || valor <= 0) {
        showToast('Informe o valor da corrida', 'error');
        return;
    }

    const ride = {
        id: Date.now(),
        plataforma,
        valor,
        km,
        timestamp: Date.now(),
    };

    shift.rides.push(ride);
    shift.totalReceita += valor;
    shift.totalKm += km;

    // Clear inputs
    setVal('ride-valor', '');
    setVal('ride-km', '');

    renderShiftRides();
    updateDashboard();
    generateInsight();
    saveShiftState();

    showToast(`✓ Corrida de ${formatCurrency(valor)} adicionada!`, 'success');
}

function deleteRide(id) {
    const ride = shift.rides.find(r => r.id === id);
    if (!ride) return;

    shift.rides = shift.rides.filter(r => r.id !== id);
    shift.totalReceita -= ride.valor;
    shift.totalKm -= (ride.km || 0);

    renderShiftRides();
    updateDashboard();
    saveShiftState();
}

function renderShiftRides() {
    const container = document.getElementById('shift-rides-list');
    if (!container) return;

    if (shift.rides.length === 0) {
        container.innerHTML = '<div class="empty-rides">Nenhuma corrida registrada ainda</div>';
        return;
    }

    // Calculate lucro per ride (simplified)
    container.innerHTML = [...shift.rides].reverse().map(ride => {
        const custoPorKm = calcCombustivelPorKm() + calcDepreciacaoPorKm() + cfg.manutencao;
        const custoRide = custoPorKm * (ride.km || 0) + ride.valor * (cfg.taxa / 100);
        const lucroRide = ride.valor - custoRide;
        const platformClass = ride.plataforma === '99' ? 'n99' : ride.plataforma;

        return `
      <div class="ride-item">
        <div class="ride-item-left">
          <span class="ride-platform ${platformClass}">${ride.plataforma}</span>
          ${ride.km ? `<span class="ride-km">${ride.km} km</span>` : ''}
        </div>
        <div class="ride-item-right">
          <div>
            <div class="ride-valor">${formatCurrency(ride.valor)}</div>
            <div class="ride-lucro">lucro ~${formatCurrency(lucroRide)}</div>
          </div>
          <button class="ride-delete" onclick="deleteRide(${ride.id})">✕</button>
        </div>
      </div>
    `;
    }).join('');
}

// ==================== RIDE EVALUATOR ====================
function evaluateRide() {
    const valor = parseFloat(getVal('re-valor')) || 0;
    const distPassageiro = parseFloat(getVal('re-dist-passageiro')) || 0;
    const distViagem = parseFloat(getVal('re-dist-viagem')) || 0;

    const resultEl = document.getElementById('re-result');
    if (!resultEl) return;

    if (!valor || !distViagem) {
        resultEl.classList.add('hidden');
        return;
    }

    const result = calcRideValue(valor, distPassageiro, distViagem);
    renderRideResult(resultEl, result);
}

function evaluateRideActive() {
    const valor = parseFloat(getVal('re-valor-active')) || 0;
    const distPassageiro = parseFloat(getVal('re-dist-passageiro-active')) || 0;
    const distViagem = parseFloat(getVal('re-dist-viagem-active')) || 0;

    const resultEl = document.getElementById('re-result-active');
    if (!resultEl) return;

    if (!valor || !distViagem) {
        resultEl.classList.add('hidden');
        return;
    }

    const result = calcRideValue(valor, distPassageiro, distViagem);
    renderRideResult(resultEl, result);
}

function calcRideValue(valor, distPassageiro, distViagem) {
    const custoPorKm = calcCombustivelPorKm() + calcDepreciacaoPorKm() + cfg.manutencao;
    const kmTotal = distPassageiro + distViagem;
    const custoTotal = custoPorKm * kmTotal + valor * (cfg.taxa / 100);
    const lucroEstimado = valor - custoTotal;
    const lucroKm = distViagem > 0 ? lucroEstimado / distViagem : 0;
    const tempoEstimado = kmTotal / 30; // ~30km/h média urbana
    const lucroHora = tempoEstimado > 0 ? lucroEstimado / tempoEstimado : 0;

    let verdict, type;
    if (lucroEstimado > 0 && lucroKm >= 1.2 && lucroHora >= 18) {
        verdict = '✅ Alta lucratividade';
        type = 'positive';
    } else if (lucroEstimado > 0 && lucroKm >= 0.5) {
        verdict = '🟡 Corrida neutra';
        type = 'neutral';
    } else {
        verdict = '❌ Prejuízo provável';
        type = 'negative';
    }

    return { valor, distPassageiro, distViagem, kmTotal, custoTotal, lucroEstimado, lucroKm, lucroHora, verdict, type };
}

function renderRideResult(el, r) {
    el.className = `re-result ${r.type}`;
    el.innerHTML = `
    <div class="re-verdict">${r.verdict}</div>
    <div class="re-details">
      Lucro estimado: <strong>${formatCurrency(r.lucroEstimado)}</strong><br/>
      Custo total: ${formatCurrency(r.custoTotal)} (${r.kmTotal.toFixed(1)} km)<br/>
      Ganho/km: ${formatCurrency(r.lucroKm)}/km &nbsp;·&nbsp; Ganho/hora: ${formatCurrency(r.lucroHora)}/h
    </div>
  `;
}

// ==================== SUMMARY ====================
function showSummary() {
    const lucro = calcLucroReal();
    const horas = shift.elapsedSeconds / 3600;
    const ganhoPorHora = horas > 0 ? lucro / horas : 0;
    const ganhoPorKm = shift.totalKm > 0 ? lucro / shift.totalKm : 0;
    const custoTotal = shift.totalReceita - lucro;

    // Color the profit
    const profitEl = document.getElementById('summary-lucro');
    if (profitEl) {
        profitEl.textContent = formatCurrency(lucro);
        profitEl.style.color = lucro > 0 ? 'var(--green)' : 'var(--red)';
    }

    // Meta status
    const pct = shift.metaValor > 0 ? (lucro / shift.metaValor * 100) : 0;
    const metaStatus = pct >= 100 ? `🏆 Meta atingida! (${pct.toFixed(0)}%)` :
        pct >= 75 ? `💪 Quase lá! ${pct.toFixed(0)}% da meta` :
            pct >= 50 ? `📊 ${pct.toFixed(0)}% da meta de ${formatCurrency(shift.metaValor)}` :
                `📉 ${pct.toFixed(0)}% da meta de ${formatCurrency(shift.metaValor)}`;
    setText('summary-meta-status', metaStatus);

    // Metrics
    setText('sum-receita', formatCurrency(shift.totalReceita));
    setText('sum-custos', formatCurrency(Math.max(0, custoTotal)));
    setText('sum-tempo', formatTime(shift.elapsedSeconds));
    setText('sum-km', shift.totalKm.toFixed(1) + ' km');
    setText('sum-hora', formatCurrency(ganhoPorHora) + '/h');
    setText('sum-km-lucro', formatCurrency(ganhoPorKm) + '/km');
    setText('sum-corridas', shift.rides.length.toString());
    setText('sum-combustivel', formatCurrency(calcCombustivelTotal()));

    // Date
    const now = new Date();
    setText('summary-date', now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));

    // Insight
    let summaryInsight = '';
    if (lucro > 0 && ganhoPorHora >= 25) {
        summaryInsight = `🔥 Turno excelente! Você ganhou ${formatCurrency(ganhoPorHora)}/hora — acima da média do mercado. Seu custo de combustível foi ${formatCurrency(calcCombustivelTotal())} para ${shift.totalKm.toFixed(0)} km rodados.`;
    } else if (lucro > 0) {
        summaryInsight = `✅ Turno positivo! Lucro de ${formatCurrency(lucro)} em ${formatTime(shift.elapsedSeconds)}. Para melhorar, tente rodar em horários de pico onde o ganho/hora tende a ser maior.`;
    } else {
        summaryInsight = `⚠️ Turno no prejuízo. Seus custos (${formatCurrency(Math.abs(custoTotal))}) superaram a receita (${formatCurrency(shift.totalReceita)}). Revise suas despesas e considere rodar em horários mais lucrativos.`;
    }
    setText('summary-insight-text', summaryInsight);
}

function resetToPreShift() {
    shift.active = false;
    shift.rides = [];
    shift.totalReceita = 0;
    shift.totalKm = 0;
    shift.elapsedSeconds = 0;
    shift.milestonesHit = new Set();

    showScreen('screen-pre');
    loadPreStats();
}

// ==================== DRIVING MODE ====================
function toggleDrivingMode() {
    shift.drivingMode = !shift.drivingMode;
    const overlay = document.getElementById('driving-mode-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !shift.drivingMode);
    }

    if (shift.drivingMode) {
        // Keep screen on (if supported)
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').catch(() => { });
        }
        updateDashboard();
    }
}

// ==================== NAVIGATION ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function scrollToEvaluator() {
    const el = document.querySelector('.ride-evaluator-card.compact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ==================== SETTINGS MODAL ====================
// (already defined above)

// ==================== TOAST ====================
let toastTimeout;
function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `toast ${type}`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

// ==================== UTILS ====================
function formatCurrency(v) {
    return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.textContent = formatCurrency(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
}

