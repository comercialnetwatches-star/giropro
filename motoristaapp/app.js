// ==================== SUPABASE INIT ====================
const SUPABASE_URL = 'https://cwskgewfqvkxjuzhdamn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3c2tnZXdmcXZreGp1emhkYW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDcyNzMsImV4cCI6MjA4Nzc4MzI3M30._wSWPUJ-iNAcSLvTx1E3ZbkOMt3ku3whFnUsGxFu7lE';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ==================== STATE ====================
let state = {
    entries: [],
    config: {
        valorCarro: 45000,
        vidaUtil: 5,
        kmAnual: 36000,
        combustivel: 6.20,
        consumo: 10
    },
    meta: {
        valor: 6000,
        dias: 22
    },
    user: null,
    currentView: 'dashboard',
    charts: {}
};

// ==================== MOCK DATA ====================
const mockEntries = [
    // Receitas - Fevereiro 2026
    { id: 1, tipo: 'receita', categoria: 'uber', descricao: 'Corridas manhã', data: '2026-02-18', valor: 185.50, km: 120, horas: 6 },
    { id: 2, tipo: 'receita', categoria: '99', descricao: 'Corridas tarde', data: '2026-02-18', valor: 95.00, km: 65, horas: 3 },
    { id: 3, tipo: 'receita', categoria: 'uber', descricao: 'Corridas manhã', data: '2026-02-17', valor: 210.00, km: 145, horas: 7 },
    { id: 4, tipo: 'receita', categoria: 'indrive', descricao: 'Corridas noite', data: '2026-02-17', valor: 130.00, km: 90, horas: 4 },
    { id: 5, tipo: 'receita', categoria: 'uber', descricao: 'Corridas dia', data: '2026-02-16', valor: 175.00, km: 110, horas: 6 },
    { id: 6, tipo: 'receita', categoria: 'gorjeta', descricao: 'Gorjetas da semana', data: '2026-02-16', valor: 45.00, km: 0, horas: 0 },
    { id: 7, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-15', valor: 198.00, km: 130, horas: 7 },
    { id: 8, tipo: 'receita', categoria: '99', descricao: 'Corridas', data: '2026-02-14', valor: 155.00, km: 100, horas: 5 },
    { id: 9, tipo: 'receita', categoria: 'bonus', descricao: 'Bônus Uber semanal', data: '2026-02-14', valor: 80.00, km: 0, horas: 0 },
    { id: 10, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-13', valor: 220.00, km: 150, horas: 8 },
    { id: 11, tipo: 'receita', categoria: 'indrive', descricao: 'Corridas', data: '2026-02-12', valor: 145.00, km: 95, horas: 5 },
    { id: 12, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-11', valor: 190.00, km: 125, horas: 6 },
    { id: 13, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-10', valor: 205.00, km: 135, horas: 7 },
    { id: 14, tipo: 'receita', categoria: '99', descricao: 'Corridas', data: '2026-02-09', valor: 160.00, km: 105, horas: 5 },
    { id: 15, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-08', valor: 230.00, km: 155, horas: 8 },
    { id: 16, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-07', valor: 175.00, km: 115, horas: 6 },
    { id: 17, tipo: 'receita', categoria: 'indrive', descricao: 'Corridas', data: '2026-02-06', valor: 120.00, km: 80, horas: 4 },
    { id: 18, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-05', valor: 195.00, km: 130, horas: 7 },
    { id: 19, tipo: 'receita', categoria: 'bonus', descricao: 'Bônus Uber', data: '2026-02-05', valor: 60.00, km: 0, horas: 0 },
    { id: 20, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-04', valor: 215.00, km: 140, horas: 7 },
    { id: 21, tipo: 'receita', categoria: '99', descricao: 'Corridas', data: '2026-02-03', valor: 140.00, km: 90, horas: 5 },
    { id: 22, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-02', valor: 180.00, km: 120, horas: 6 },
    { id: 23, tipo: 'receita', categoria: 'uber', descricao: 'Corridas', data: '2026-02-01', valor: 200.00, km: 130, horas: 7 },

    // Despesas Fixas
    { id: 30, tipo: 'despesa-fixa', categoria: 'financiamento', descricao: 'Parcela do carro', data: '2026-02-01', valor: 850.00 },
    { id: 31, tipo: 'despesa-fixa', categoria: 'seguro', descricao: 'Seguro auto', data: '2026-02-01', valor: 280.00 },
    { id: 32, tipo: 'despesa-fixa', categoria: 'internet', descricao: 'Internet celular', data: '2026-02-01', valor: 89.90 },
    { id: 33, tipo: 'despesa-fixa', categoria: 'celular', descricao: 'Plano celular', data: '2026-02-01', valor: 59.90 },

    // Despesas Variáveis
    { id: 40, tipo: 'despesa-variavel', categoria: 'combustivel', descricao: 'Gasolina semana 1', data: '2026-02-07', valor: 280.00 },
    { id: 41, tipo: 'despesa-variavel', categoria: 'combustivel', descricao: 'Gasolina semana 2', data: '2026-02-14', valor: 295.00 },
    { id: 42, tipo: 'despesa-variavel', categoria: 'combustivel', descricao: 'Gasolina semana 3', data: '2026-02-18', valor: 180.00 },
    { id: 43, tipo: 'despesa-variavel', categoria: 'lavajato', descricao: 'Lavagem completa', data: '2026-02-10', valor: 45.00 },
    { id: 44, tipo: 'despesa-variavel', categoria: 'manutencao', descricao: 'Troca de óleo', data: '2026-02-05', valor: 180.00 },
    { id: 45, tipo: 'despesa-variavel', categoria: 'estacionamento', descricao: 'Estacionamentos', data: '2026-02-15', valor: 35.00 },
];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    if (state.entries.length === 0) {
        state.entries = mockEntries;
    }

    // Check for dashboard direct link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'dashboard') {
        loginSuccess();
    }

    // Set today's date in modal
    const today = new Date().toISOString().split('T')[0];
    const modalData = document.getElementById('modal-data');
    if (modalData) modalData.value = today;

    updateModalCategories();
    calcularSimulador();
    calcularHorario();
    updateConfigResults();
});

// ==================== STORAGE ====================
function saveToStorage() {
    localStorage.setItem('GiroPro_entries', JSON.stringify(state.entries));
    localStorage.setItem('GiroPro_config', JSON.stringify(state.config));
    localStorage.setItem('GiroPro_meta', JSON.stringify(state.meta));
}

function loadFromStorage() {
    const entries = localStorage.getItem('GiroPro_entries');
    const config = localStorage.getItem('GiroPro_config');
    const meta = localStorage.getItem('GiroPro_meta');

    if (entries) state.entries = JSON.parse(entries);
    if (config) state.config = { ...state.config, ...JSON.parse(config) };
    if (meta) state.meta = { ...state.meta, ...JSON.parse(meta) };
}

// ==================== NAVIGATION ====================
function showPage(pageId) {
    // Force pages out of any nested structure that might hide them
    document.querySelectorAll('.page').forEach(page => {
        if (page.parentElement !== document.body) {
            document.body.appendChild(page);
        }
    });

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
        p.style.visibility = 'hidden';
        p.style.opacity = '0';
    });

    const target = document.getElementById(pageId);
    if (target) {
        // Special case for app-page which needs flex
        if (pageId === 'app-page') {
            target.style.display = 'flex';
        } else {
            target.style.display = 'block';
        }
        target.style.visibility = 'visible';
        target.style.opacity = '1';
        target.classList.add('active');
    }
}

function showLogin(mode = 'login') {
    try {
        console.log("Navigating to auth page, mode: " + mode);
        showPage('login-page');
        toggleAuthMode(mode);
        window.scrollTo(0, 0);
    } catch (e) {
        alert("Erro no código: " + e.toString());
    }
}

let authMode = 'login'; // 'login' or 'register'

function toggleAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + mode).classList.add('active');

    const groupName = document.getElementById('group-name');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'register') {
        groupName.style.display = 'block';
        document.getElementById('auth-name').required = true;
        subtitle.textContent = "Crie sua conta e assuma o controle do seu lucro.";
        submitBtn.innerHTML = "Criar Conta Grátis 🚀";
    } else {
        groupName.style.display = 'none';
        document.getElementById('auth-name').required = false;
        subtitle.textContent = "A sua central de inteligência financeira ao volante.";
        submitBtn.innerHTML = "Acessar Painel 🚀";
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    if (authMode === 'login') {
        showToast("Autenticando na rede GiroPro... 🔐", 2000);

        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                showToast("Erro de acesso: " + error.message, 4000);
                return;
            }

            loginSuccess(data.user);
        } else {
            setTimeout(() => {
                if (email === 'demo@GiroPro.com' && password === 'demo123') {
                    loginSuccess({ email, user_metadata: { full_name: 'Usuário Demo' } });
                } else {
                    showToast("Serviço offline. Credenciais de demo falharam.", 3000);
                }
            }, 800);
        }
    } else {
        // REGISTER MODE
        showToast("Criando sua conta PRO... 🚀", 2000);

        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                showToast("Erro ao criar conta: " + error.message, 4000);
                return;
            }

            if (data.session) {
                loginSuccess(data.user);
            } else {
                showToast("Conta criada! Verifique seu e-mail para confirmar o acesso.", 5000);
                toggleAuthMode('login');
            }
        } else {
            setTimeout(() => {
                showToast("Serviço offline. Conta demo local criada com sucesso!", 3000);
                loginSuccess({ email, id: 'demo-local', user_metadata: { full_name: name || 'Novo Usuário' } });
            }, 1000);
        }
    }
}

function handleDemoLogin() {
    // For demo, we can just use the SUCCESS state with a mock user
    // or trigger a specific public demo account. Using mock for now.
    loginSuccess({ email: 'visitante@giropro.com', user_metadata: { full_name: 'Motorista Visitante' } });
}

async function loginSuccess(user) {
    state.user = user;
    showPage('app-page');
    navigateTo('dashboard');

    if (typeof loadDataFromSupabase === 'function') {
        await loadDataFromSupabase();
    }

    setTimeout(() => {
        initDashboard();
        showToast("Bem-vindo ao GiroPro Executive, " + (user.user_metadata?.full_name || user.email.split('@')[0]) + "! 🚀");
    }, 100);
}

async function loadDataFromSupabase() {
    if (!supabaseClient || !state.user) return;
    try {
        const { data, error } = await supabaseClient.from('entries').select('*').eq('user_id', state.user.id);
        if (data && !error && data.length > 0) {
            state.entries = data;
        }
    } catch (e) {
        console.warn('Erro ao carregar Supabase:', e);
    }
}

async function handleLogout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    state.user = null;
    showPage('landing-page');
    showToast("Sessão encerrada com segurança. Até breve! 👋");
}

function navigateTo(view, clickedEl) {
    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById('view-' + view);
    if (viewEl) viewEl.classList.add('active');

    // Update sidebar nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Update bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
    const bnItem = document.getElementById('bn-' + view);
    if (bnItem) bnItem.classList.add('active');

    if (clickedEl) {
        clickedEl.classList.add('active');
        // Also update sidebar if bottom nav was clicked
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + view + "'")) {
                item.classList.add('active');
            }
        });
    }

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        lancamentos: 'Lançamentos',
        relatorios: 'Relatórios',
        metas: 'Metas',
        simulador: 'Simulador',
        configuracoes: 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[view] || view;

    state.currentView = view;

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');

    // Initialize view-specific content
    switch (view) {
        case 'dashboard': initDashboard(); break;
        case 'lancamentos': renderTables(); break;
        case 'relatorios':
            initRelatorios();
            generateReportInsights();
            break;
        case 'metas': updateMeta(); break;
        case 'simulador': calcularSimulador(); calcularHorario(); break;
        case 'configuracoes': updateConfigResults(); break;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu) navMenu.classList.toggle('active');

    // Optional: add a class to the toggle button for animation (X transformation)
    if (menuToggle) menuToggle.classList.toggle('active');
}

// ==================== CALCULATIONS ====================
function getMonthEntries() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return state.entries.filter(e => {
        const d = new Date(e.data);
        return d.getFullYear() === year && d.getMonth() === month;
    });
}

function getTodayEntries() {
    const today = new Date().toISOString().split('T')[0];
    return state.entries.filter(e => e.data === today);
}

function getWeekEntries() {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    return state.entries.filter(e => new Date(e.data) >= weekAgo);
}

function calcReceita(entries) {
    return entries.filter(e => e.tipo === 'receita').reduce((sum, e) => sum + e.valor, 0);
}

function calcDespesas(entries) {
    return entries.filter(e => e.tipo !== 'receita').reduce((sum, e) => sum + e.valor, 0);
}

function calcDepreciacao(km) {
    const { valorCarro, vidaUtil, kmAnual } = state.config;
    const depPorKm = valorCarro / (vidaUtil * kmAnual);
    return depPorKm * km;
}

function calcDepreciacaoPorKm() {
    const { valorCarro, vidaUtil, kmAnual } = state.config;
    return valorCarro / (vidaUtil * kmAnual);
}

function calcCustoCombustivelPorKm() {
    return state.config.combustivel / state.config.consumo;
}

function calcMetrics(entries) {
    const receitas = entries.filter(e => e.tipo === 'receita');
    const totalReceita = receitas.reduce((sum, e) => sum + e.valor, 0);
    const totalDespesas = calcDespesas(entries);
    const totalKm = receitas.reduce((sum, e) => sum + (e.km || 0), 0);
    const totalHoras = receitas.reduce((sum, e) => sum + (e.horas || 0), 0);
    const depreciacao = calcDepreciacao(totalKm);
    const lucroReal = totalReceita - totalDespesas - depreciacao;
    const ganhoPorHora = totalHoras > 0 ? lucroReal / totalHoras : 0;
    const ganhoPorKm = totalKm > 0 ? lucroReal / totalKm : 0;
    const custoPorKm = calcCustoCombustivelPorKm() + calcDepreciacaoPorKm();
    const taxaApps = totalReceita > 0 ? (totalDespesas / totalReceita) * 100 : 0;

    return { totalReceita, totalDespesas, totalKm, totalHoras, depreciacao, lucroReal, ganhoPorHora, ganhoPorKm, custoPorKm, taxaApps };
}

// ==================== DASHBOARD ====================
function initDashboard() {
    const monthEntries = getMonthEntries();
    const todayEntries = getTodayEntries();
    const weekEntries = getWeekEntries();

    const monthMetrics = calcMetrics(monthEntries);
    const todayMetrics = calcMetrics(todayEntries);
    const weekMetrics = calcMetrics(weekEntries);

    // KPI Cards
    setText('kpi-receita-dia', formatCurrency(todayMetrics.totalReceita));
    setText('kpi-receita-semana', formatCurrency(weekMetrics.totalReceita));
    setText('kpi-receita-mes', formatCurrency(monthMetrics.totalReceita));
    setText('kpi-lucro-real', formatCurrency(monthMetrics.lucroReal));

    // KPI changes
    const lucroEl = document.getElementById('kpi-lucro-change');
    if (lucroEl) {
        const pct = monthMetrics.totalReceita > 0 ? (monthMetrics.lucroReal / monthMetrics.totalReceita * 100).toFixed(1) : 0;
        lucroEl.textContent = `${pct}% da receita`;
        lucroEl.className = 'kpi-change ' + (monthMetrics.lucroReal > 0 ? 'positive' : 'negative');
    }

    setText('kpi-receita-dia-change', todayMetrics.totalReceita > 0 ? `+${formatCurrency(todayMetrics.totalReceita)}` : 'Sem corridas hoje');
    setText('kpi-receita-semana-change', `${weekMetrics.totalKm} km rodados`);
    setText('kpi-receita-mes-change', `${monthMetrics.totalKm} km no mês`);

    // Differential Metrics
    setText('metric-hora', formatCurrency(monthMetrics.ganhoPorHora));
    setText('metric-km', formatCurrency(monthMetrics.ganhoPorKm));
    setText('metric-custo-km', formatCurrency(monthMetrics.custoPorKm));
    setText('metric-taxa', `${monthMetrics.taxaApps.toFixed(1)}%`);

    // Status indicators
    setStatus('metric-hora-status', monthMetrics.ganhoPorHora >= 20 ? '🟢' : monthMetrics.ganhoPorHora >= 12 ? '🟡' : '🔴');
    setStatus('metric-km-status', monthMetrics.ganhoPorKm >= 1.5 ? '🟢' : monthMetrics.ganhoPorKm >= 0.8 ? '🟡' : '🔴');
    setStatus('metric-custo-status', monthMetrics.custoPorKm <= 0.8 ? '🟢' : monthMetrics.custoPorKm <= 1.2 ? '🟡' : '🔴');
    setStatus('metric-taxa-status', monthMetrics.taxaApps <= 30 ? '🟢' : monthMetrics.taxaApps <= 45 ? '🟡' : '🔴');

    // Insight
    generateInsight(monthMetrics);

    // Alerts
    generateAlerts(monthMetrics);

    // Charts
    initDashboardCharts(monthEntries);
}

function generateInsight(metrics) {
    const insights = [];

    if (metrics.ganhoPorKm > 0 && metrics.ganhoPorKm < 1.2) {
        insights.push(`Você rodou ${metrics.totalKm} km este mês e seu lucro real foi ${formatCurrency(metrics.lucroReal)}. Seu ganho por km está abaixo do ideal (${formatCurrency(metrics.ganhoPorKm)}/km). Considere rodar em horários com tarifa dinâmica para aumentar sua rentabilidade.`);
    } else if (metrics.ganhoPorKm >= 2.0) {
        insights.push(`Excelente! Seu ganho por km está em ${formatCurrency(metrics.ganhoPorKm)}/km — acima da média do mercado. Continue priorizando corridas longas e horários de pico.`);
    } else if (metrics.lucroReal < 0) {
        insights.push(`⚠️ Atenção: seu lucro real este mês está negativo (${formatCurrency(metrics.lucroReal)}). Seus custos estão superando sua receita. Revise suas despesas urgentemente.`);
    } else if (metrics.ganhoPorHora >= 25) {
        insights.push(`Sua produtividade está ótima! Você está ganhando ${formatCurrency(metrics.ganhoPorHora)}/hora — acima da média de R$20/hora para motoristas de app. Continue assim!`);
    } else {
        insights.push(`Este mês você rodou ${metrics.totalKm} km e gerou ${formatCurrency(metrics.totalReceita)} de receita. Seu lucro real após todos os custos é ${formatCurrency(metrics.lucroReal)}. Acompanhe suas métricas diariamente para otimizar seus ganhos.`);
    }

    setText('insight-text', insights[0]);
}

function generateAlerts(metrics) {
    const container = document.getElementById('alerts-container');
    if (!container) return;
    container.innerHTML = '';

    const alerts = [];

    // Combustível > 45% da receita
    const monthEntries = getMonthEntries();
    const combustivelTotal = monthEntries.filter(e => e.categoria === 'combustivel').reduce((sum, e) => sum + e.valor, 0);
    const pctCombustivel = metrics.totalReceita > 0 ? (combustivelTotal / metrics.totalReceita * 100) : 0;

    if (pctCombustivel > 45) {
        alerts.push({ type: 'danger', msg: `⚠️ Seu custo com combustível passou de 45% da receita (${pctCombustivel.toFixed(1)}%). Considere otimizar rotas ou abastecer em postos mais baratos.` });
    }

    if (metrics.lucroReal < 0) {
        alerts.push({ type: 'danger', msg: `🔴 Você está no prejuízo este mês. Seus custos (${formatCurrency(metrics.totalDespesas + metrics.depreciacao)}) superam sua receita (${formatCurrency(metrics.totalReceita)}).` });
    }

    if (metrics.ganhoPorHora < 15 && metrics.totalHoras > 0) {
        alerts.push({ type: 'warning', msg: `⚠️ Você está rodando muito e lucrando pouco. Seu ganho por hora (${formatCurrency(metrics.ganhoPorHora)}/h) está abaixo do mínimo recomendado de R$15/h.` });
    }

    // Check if this is a good week
    const weekEntries = getWeekEntries();
    const weekMetrics = calcMetrics(weekEntries);
    if (weekMetrics.lucroReal > 800) {
        alerts.push({ type: 'success', msg: `✅ Essa foi uma ótima semana! Você lucrou ${formatCurrency(weekMetrics.lucroReal)} nos últimos 7 dias.` });
    }

    alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-banner ${alert.type}`;
        div.textContent = alert.msg;
        container.appendChild(div);
    });
}

function initDashboardCharts(monthEntries) {
    // Chart 1: Receita vs Despesas (last 7 days)
    const last7Days = getLast7DaysData();

    destroyChart('chart-receita-despesas');
    const ctx1 = document.getElementById('chart-receita-despesas');
    if (ctx1) {
        state.charts['chart-receita-despesas'] = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: last7Days.labels,
                datasets: [
                    {
                        label: 'Receita',
                        data: last7Days.receitas,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6,
                    },
                    {
                        label: 'Despesas',
                        data: last7Days.despesas,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        borderRadius: 6,
                    }
                ]
            },
            options: getChartOptions('bar')
        });
    }

    // Chart 2: Receita por App (pie)
    const appData = getAppRevenueData(monthEntries);
    destroyChart('chart-apps');
    const ctx2 = document.getElementById('chart-apps');
    if (ctx2) {
        state.charts['chart-apps'] = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: appData.labels,
                datasets: [{
                    data: appData.values,
                    backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                ...getChartOptions('doughnut'),
                cutout: '65%'
            }
        });
    }
}

// ==================== RELATÓRIOS ====================
function initRelatorios() {
    const period = document.getElementById('relatorio-periodo')?.value || '30';
    let data;
    if (period === '7') data = getLast7DaysData();
    else if (period === '90') data = getLast90DaysData();
    else data = getLast30DaysData();

    const last30Days = data; // Keep variable name for compatibility with charts

    // Populate Summary KPI's
    const totalRec = data.receitas.reduce((a, b) => a + b, 0);
    const totalDesp = data.despesas.reduce((a, b) => a + b, 0);
    const totalLucro = totalRec - totalDesp;
    const avgHora = data.ganhoPorHora.filter(v => v !== null).reduce((a, b, i, arr) => a + b / arr.length, 0);

    const setRepText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setRepText('rep-total-receita', formatCurrency(totalRec));
    setRepText('rep-total-despesa', formatCurrency(totalDesp));
    setRepText('rep-total-lucro', formatCurrency(totalLucro));
    setRepText('rep-avg-hora', formatCurrency(avgHora));

    // AI Insights update
    generateReportInsights();

    // Chart: Receita vs Despesas Full
    destroyChart('chart-receita-despesas-full');
    const ctx1 = document.getElementById('chart-receita-despesas-full');
    if (ctx1) {
        state.charts['chart-receita-despesas-full'] = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: last30Days.labels,
                datasets: [
                    {
                        label: 'Receita',
                        data: last30Days.receitas,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Despesas',
                        data: last30Days.despesas,
                        backgroundColor: 'rgba(239, 68, 68, 0.6)',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            },
            options: getChartOptions('bar')
        });
    }

    // Chart: Lucro ao longo do tempo
    destroyChart('chart-lucro-tempo');
    const ctx2 = document.getElementById('chart-lucro-tempo');
    if (ctx2) {
        state.charts['chart-lucro-tempo'] = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: last30Days.labels,
                datasets: [{
                    label: 'Lucro Acumulado',
                    data: last30Days.lucroAcumulado,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#6366f1',
                }]
            },
            options: getChartOptions('line')
        });
    }

    // Chart: Receita por App Full
    const monthEntries = getMonthEntries();
    const appData = getAppRevenueData(monthEntries);
    destroyChart('chart-apps-full');
    const ctx3 = document.getElementById('chart-apps-full');
    if (ctx3) {
        state.charts['chart-apps-full'] = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: appData.labels,
                datasets: [{
                    data: appData.values,
                    backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                ...getChartOptions('doughnut'),
                cutout: '60%'
            }
        });
    }

    // Chart: Ganho por hora
    destroyChart('chart-ganho-hora');
    const ctx4 = document.getElementById('chart-ganho-hora');
    if (ctx4) {
        state.charts['chart-ganho-hora'] = new Chart(ctx4, {
            type: 'line',
            data: {
                labels: last30Days.labels,
                datasets: [{
                    label: 'Ganho/hora (R$)',
                    data: last30Days.ganhoPorHora,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b',
                }]
            },
            options: getChartOptions('line')
        });
    }
}

// ==================== REPORT AI INSIGHTS ====================
function generateReportInsights() {
    const container = document.getElementById('report-ai-insights');
    if (!container) return;

    const entries = getMonthEntries();
    const metrics = calcMetrics(entries);
    const appData = getAppRevenueData(entries);

    // Safety check for data arrays
    const labels = appData.labels || [];
    const values = appData.values || [];
    const uberIndex = labels.indexOf('Uber');
    const uberRevenue = uberIndex !== -1 ? values[uberIndex] : 0;

    // Dynamic Insights logic
    let insights = [
        {
            title: "📈 Eficiência Operacional",
            text: metrics.ganhoPorHora > 25
                ? "Sua performance por hora está excelente. Mantenha o ritmo atual para maximizar o ROI."
                : "Atenção ao ganho/hora. Considere mudar a zona de atuação para locais com maior densidade de pedidos."
        },
        {
            title: "🚗 Mix de Aplicativos",
            text: uberRevenue > (metrics.totalReceita * 0.7)
                ? "Alta dependência da plataforma Uber (mais de 70%). Tente diversificar com outros aplicativos para mitigar riscos de instabilidade no app."
                : "Boa distribuição entre plataformas, o que garante estabilidade nos seus ganhos diários."
        },
        {
            title: "⛽ Gestão de Custos",
            text: metrics.taxaApps > 35
                ? "Seus custos operacionais estão acima da média (35%). Revise seu consumo de combustível e possíveis manutenções preventivas."
                : "Gestão de custos dentro do padrão GiroPro Gold. Você está otimizando bem suas despesas operacionais."
        },
        {
            title: "🤖 Recomendação GiroPro AI",
            text: "Baseado nos dados do período, o horário entre 16:00 e 20:00 é onde sua margem líquida é mais estável. Priorize rodar nesse intervalo."
        }
    ];

    container.innerHTML = insights.map(i => `
        <div class="insight-item-box">
            <h4>${i.title}</h4>
            <p>${i.text}</p>
        </div>
    `).join('');
}

// ==================== DATA HELPERS ====================
function getLast7DaysData() {
    const labels = [];
    const receitas = [];
    const despesas = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayEntries = state.entries.filter(e => e.data === dateStr);

        labels.push(d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }));
        receitas.push(calcReceita(dayEntries));
        despesas.push(calcDespesas(dayEntries));
    }

    return { labels, receitas, despesas };
}

function getLast30DaysData() {
    const labels = [];
    const receitas = [];
    const despesas = [];
    const lucroAcumulado = [];
    const ganhoPorHora = [];
    let lucroAcc = 0;

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayEntries = state.entries.filter(e => e.data === dateStr);

        if (i % 3 === 0 || i === 0) {
            labels.push(d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }));
        } else {
            labels.push('');
        }

        const rec = calcReceita(dayEntries);
        const desp = calcDespesas(dayEntries);
        const km = dayEntries.filter(e => e.tipo === 'receita').reduce((s, e) => s + (e.km || 0), 0);
        const horas = dayEntries.filter(e => e.tipo === 'receita').reduce((s, e) => s + (e.horas || 0), 0);
        const dep = calcDepreciacao(km);
        const lucro = rec - desp - dep;
        lucroAcc += lucro;

        receitas.push(rec);
        despesas.push(desp);
        lucroAcumulado.push(Math.round(lucroAcc * 100) / 100);
        ganhoPorHora.push(horas > 0 ? Math.round((lucro / horas) * 100) / 100 : null);
    }

    return { labels, receitas, despesas, lucroAcumulado, ganhoPorHora };
}

function getAppRevenueData(entries) {
    const apps = { 'Uber': 0, '99': 0, 'InDrive': 0, 'Gorjetas': 0, 'Bônus': 0 };
    entries.filter(e => e.tipo === 'receita').forEach(e => {
        if (e.categoria === 'uber') apps['Uber'] += e.valor;
        else if (e.categoria === '99') apps['99'] += e.valor;
        else if (e.categoria === 'indrive') apps['InDrive'] += e.valor;
        else if (e.categoria === 'gorjeta') apps['Gorjetas'] += e.valor;
        else if (e.categoria === 'bonus') apps['Bônus'] += e.valor;
    });

    const filtered = Object.entries(apps).filter(([, v]) => v > 0);
    return {
        labels: filtered.map(([k]) => k),
        values: filtered.map(([, v]) => Math.round(v * 100) / 100)
    };
}

// ==================== CHART OPTIONS ====================
function getChartOptions(type) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#8888aa' : '#6666aa';

    const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor, font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 16 }
            },
            tooltip: {
                backgroundColor: isDark ? '#16161f' : '#ffffff',
                titleColor: isDark ? '#f0f0f8' : '#1a1a2e',
                bodyColor: textColor,
                borderColor: isDark ? '#2a2a3a' : '#e2e2ef',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        if (type === 'doughnut') return ` ${ctx.label}: ${formatCurrency(ctx.raw)}`;
                        return ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
                    }
                }
            }
        }
    };

    if (type === 'doughnut') return base;

    return {
        ...base,
        scales: {
            x: {
                grid: { color: gridColor },
                ticks: { color: textColor, font: { family: 'Inter', size: 11 }, maxRotation: 0 }
            },
            y: {
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    font: { family: 'Inter', size: 11 },
                    callback: (v) => 'R$' + v.toLocaleString('pt-BR')
                }
            }
        }
    };
}

function destroyChart(id) {
    if (state.charts[id]) {
        state.charts[id].destroy();
        delete state.charts[id];
    }
}

// ==================== LANÇAMENTOS ====================
function renderTables() {
    renderReceitas();
    renderDespesasFixas();
    renderDespesasVariaveis();
    updateSummaryBar();
}

function renderReceitas() {
    const tbody = document.getElementById('tbody-receitas');
    if (!tbody) return;
    const entries = state.entries.filter(e => e.tipo === 'receita').sort((a, b) => b.data.localeCompare(a.data));

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Nenhuma receita lançada ainda. Adicione sua primeira corrida!</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(e => `
    <tr>
      <td>${formatDate(e.data)}</td>
      <td><span class="category-badge ${getCategoryClass(e.categoria)}">${formatCategoria(e.categoria)}</span></td>
      <td>${e.descricao || '—'}</td>
      <td>${e.km ? e.km + ' km' : '—'}</td>
      <td>${e.horas ? e.horas + 'h' : '—'}</td>
      <td class="green" style="font-weight:700">${formatCurrency(e.valor)}</td>
      <td><button class="btn-delete" onclick="deleteEntry(${e.id})">✕</button></td>
    </tr>
  `).join('');
}

function renderDespesasFixas() {
    const tbody = document.getElementById('tbody-despesas-fixas');
    if (!tbody) return;
    const entries = state.entries.filter(e => e.tipo === 'despesa-fixa').sort((a, b) => b.data.localeCompare(a.data));

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Nenhuma despesa fixa lançada.</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(e => `
    <tr>
      <td>${formatDate(e.data)}</td>
      <td><span class="category-badge default">${formatCategoria(e.categoria)}</span></td>
      <td>${e.descricao || '—'}</td>
      <td class="red" style="font-weight:700">${formatCurrency(e.valor)}</td>
      <td><button class="btn-delete" onclick="deleteEntry(${e.id})">✕</button></td>
    </tr>
  `).join('');
}

function renderDespesasVariaveis() {
    const tbody = document.getElementById('tbody-despesas-variaveis');
    if (!tbody) return;
    const entries = state.entries.filter(e => e.tipo === 'despesa-variavel').sort((a, b) => b.data.localeCompare(a.data));

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Nenhuma despesa variável lançada.</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(e => `
    <tr>
      <td>${formatDate(e.data)}</td>
      <td><span class="category-badge ${getCategoryClass(e.categoria)}">${formatCategoria(e.categoria)}</span></td>
      <td>${e.descricao || '—'}</td>
      <td class="red" style="font-weight:700">${formatCurrency(e.valor)}</td>
      <td><button class="btn-delete" onclick="deleteEntry(${e.id})">✕</button></td>
    </tr>
  `).join('');
}

function updateSummaryBar() {
    const monthEntries = getMonthEntries();
    const metrics = calcMetrics(monthEntries);

    setText('total-receitas', formatCurrency(metrics.totalReceita));
    setText('total-despesas', formatCurrency(metrics.totalDespesas));

    const lucroEl = document.getElementById('total-lucro');
    if (lucroEl) {
        lucroEl.textContent = formatCurrency(metrics.lucroReal);
        lucroEl.className = 'summary-value ' + (metrics.lucroReal >= 0 ? 'green' : 'red');
    }

    setText('total-depreciacao', formatCurrency(metrics.depreciacao));
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// ==================== MODAL ====================
function openAddModal() {
    document.getElementById('modal-overlay').classList.add('active');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('modal-data').value = today;
    updateModalCategories();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function updateModalCategories() {
    const tipo = document.getElementById('modal-tipo')?.value;
    const catSelect = document.getElementById('modal-categoria');
    if (!catSelect) return;

    const categories = {
        receita: [
            { value: 'uber', label: 'Uber' },
            { value: '99', label: '99' },
            { value: 'indrive', label: 'InDrive' },
            { value: 'particular', label: 'Corrida Particular' },
            { value: 'gorjeta', label: 'Gorjeta' },
            { value: 'bonus', label: 'Bônus' },
        ],
        'despesa-fixa': [
            { value: 'financiamento', label: 'Financiamento / Aluguel do Carro' },
            { value: 'seguro', label: 'Seguro' },
            { value: 'internet', label: 'Internet' },
            { value: 'celular', label: 'Plano do Celular' },
        ],
        'despesa-variavel': [
            { value: 'combustivel', label: 'Combustível' },
            { value: 'manutencao', label: 'Manutenção' },
            { value: 'lavajato', label: 'Lava-jato' },
            { value: 'oleo', label: 'Troca de Óleo' },
            { value: 'pneus', label: 'Pneus' },
            { value: 'multa', label: 'Multa' },
            { value: 'estacionamento', label: 'Estacionamento' },
            { value: 'outros', label: 'Outros' },
        ]
    };

    const cats = categories[tipo] || categories.receita;
    catSelect.innerHTML = cats.map(c => `<option value="${c.value}">${c.label}</option>`).join('');

    // Show/hide km and horas fields
    const kmGroup = document.getElementById('modal-km-group');
    const horasGroup = document.getElementById('modal-horas-group');
    if (kmGroup) kmGroup.style.display = tipo === 'receita' ? 'block' : 'none';
    if (horasGroup) horasGroup.style.display = tipo === 'receita' ? 'block' : 'none';
}

function saveEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        tipo: document.getElementById('modal-tipo').value,
        categoria: document.getElementById('modal-categoria').value,
        descricao: document.getElementById('modal-descricao').value,
        data: document.getElementById('modal-data').value,
        valor: parseFloat(document.getElementById('modal-valor').value),
        km: parseFloat(document.getElementById('modal-km')?.value) || 0,
        horas: parseFloat(document.getElementById('modal-horas')?.value) || 0,
    };

    state.entries.push(entry);
    saveToStorage();
    closeModal();
    renderTables();

    // Reset form
    document.getElementById('modal-valor').value = '';
    document.getElementById('modal-descricao').value = '';
    if (document.getElementById('modal-km')) document.getElementById('modal-km').value = '';
    if (document.getElementById('modal-horas')) document.getElementById('modal-horas').value = '';
}

function deleteEntry(id) {
    state.entries = state.entries.filter(e => e.id !== id);
    saveToStorage();
    renderTables();
}

// ==================== QUICK ADD ====================
function addQuickEntry() {
    const tipo = document.getElementById('quick-tipo').value;
    const categoria = document.getElementById('quick-categoria').value;
    const valor = parseFloat(document.getElementById('quick-valor').value);
    const km = parseFloat(document.getElementById('quick-km').value) || 0;

    if (!valor || valor <= 0) {
        alert('Por favor, informe um valor válido.');
        return;
    }

    const entry = {
        id: Date.now(),
        tipo: tipo === 'receita' ? 'receita' : 'despesa-variavel',
        categoria,
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        valor,
        km,
        horas: 0
    };

    state.entries.push(entry);
    saveToStorage();

    // Reset
    document.getElementById('quick-valor').value = '';
    document.getElementById('quick-km').value = '';

    // Refresh dashboard
    initDashboard();

    // Show feedback
    const btn = document.querySelector('.quick-add-form .btn-primary');
    const original = btn.textContent;
    btn.textContent = '✓ Adicionado!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
    }, 1500);
}

// ==================== METAS ====================
function updateMeta() {
    const metaValor = parseFloat(document.getElementById('meta-valor')?.value) || 6000;
    const metaDias = parseInt(document.getElementById('meta-dias')?.value) || 22;

    state.meta = { valor: metaValor, dias: metaDias };
    saveToStorage();

    const monthEntries = getMonthEntries();
    const metrics = calcMetrics(monthEntries);
    const lucroAtual = Math.max(0, metrics.lucroReal);

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const diasRestantes = daysInMonth - now.getDate();
    const falta = Math.max(0, metaValor - lucroAtual);
    const mediaDiariaNecessaria = diasRestantes > 0 ? falta / diasRestantes : 0;
    const mediaAtual = now.getDate() > 0 ? lucroAtual / now.getDate() : 0;
    const pct = Math.min(100, (lucroAtual / metaValor) * 100);

    // Update UI
    const pctEl = document.getElementById('meta-percentage');
    if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';

    const bar = document.getElementById('meta-progress-bar');
    if (bar) bar.style.width = pct + '%';

    setText('meta-atual', lucroAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setText('meta-total', metaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setText('meta-falta', formatCurrency(falta));
    setText('meta-dias-restantes', diasRestantes);
    setText('meta-media-diaria', formatCurrency(mediaDiariaNecessaria));
    setText('meta-media-atual', formatCurrency(mediaAtual));

    const now2 = new Date();
    setText('meta-periodo', now2.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
}

// ==================== SIMULADOR ====================
function calcularSimulador() {
    const atualConsumo = parseFloat(document.getElementById('sim-atual-consumo')?.value) || 10;
    const atualKm = parseFloat(document.getElementById('sim-atual-km')?.value) || 3000;
    const atualComb = parseFloat(document.getElementById('sim-atual-combustivel')?.value) || 6.20;

    const novoConsumo = parseFloat(document.getElementById('sim-novo-consumo')?.value) || 14;
    const novoKm = parseFloat(document.getElementById('sim-novo-km')?.value) || 3000;
    const novoComb = parseFloat(document.getElementById('sim-novo-combustivel')?.value) || 6.20;

    const custoAtual = (atualKm / atualConsumo) * atualComb;
    const custoNovo = (novoKm / novoConsumo) * novoComb;
    const economia = custoAtual - custoNovo;

    setText('sim-custo-atual', formatCurrency(custoAtual));
    setText('sim-custo-novo', formatCurrency(custoNovo));
    setText('sim-economia', formatCurrency(economia));
    setText('sim-economia-anual', formatCurrency(economia * 12));
}

function calcularHorario() {
    const ganhoHora = parseFloat(document.getElementById('sim-ganho-hora')?.value) || 25;
    const horasDia = parseFloat(document.getElementById('sim-horas-dia')?.value) || 8;
    const diasMes = parseFloat(document.getElementById('sim-dias-mes')?.value) || 22;

    const receitaAtual = ganhoHora * horasDia * diasMes;
    const receitaDinamico = ganhoHora * 1.2 * horasDia * diasMes;
    const ganhoExtra = receitaDinamico - receitaAtual;

    setText('sim-receita-atual', formatCurrency(receitaAtual));
    setText('sim-receita-dinamico', formatCurrency(receitaDinamico));
    setText('sim-ganho-extra', formatCurrency(ganhoExtra));
}

// ==================== CONFIGURAÇÕES ====================
function saveConfig() {
    state.config = {
        valorCarro: parseFloat(document.getElementById('config-valor-carro')?.value) || 45000,
        vidaUtil: parseFloat(document.getElementById('config-vida-util')?.value) || 5,
        kmAnual: parseFloat(document.getElementById('config-km-anual')?.value) || 36000,
        combustivel: parseFloat(document.getElementById('config-combustivel')?.value) || 6.20,
        consumo: parseFloat(document.getElementById('config-consumo')?.value) || 10,
    };
    saveToStorage();
    updateConfigResults();
}

function updateConfigResults() {
    const depKm = calcDepreciacaoPorKm();
    const custoCombKm = calcCustoCombustivelPorKm();

    setText('config-depreciacao-km', `R$ ${depKm.toFixed(4)}/km`);
    setText('config-custo-km-comb', `R$ ${custoCombKm.toFixed(4)}/km`);

    // Sync config inputs
    const fields = ['config-valor-carro', 'config-vida-util', 'config-km-anual', 'config-combustivel', 'config-consumo'];
    const keys = ['valorCarro', 'vidaUtil', 'kmAnual', 'combustivel', 'consumo'];
    fields.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = state.config[keys[i]];
    });
}

// ==================== THEME ====================
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';

    // Update theme buttons in config
    document.getElementById('theme-dark-btn')?.classList.toggle('active', theme === 'dark');
    document.getElementById('theme-light-btn')?.classList.toggle('active', theme === 'light');

    localStorage.setItem('GiroPro_theme', theme);

    // Re-render charts with new colors
    if (state.currentView === 'dashboard') initDashboard();
    if (state.currentView === 'relatorios') initRelatorios();
}

// Load saved theme
const savedTheme = localStorage.getItem('GiroPro_theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// ==================== UTILS ====================
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR');
}

function formatCategoria(cat) {
    const map = {
        uber: 'Uber', '99': '99', indrive: 'InDrive', particular: 'Particular',
        gorjeta: 'Gorjeta', bonus: 'Bônus', financiamento: 'Financiamento',
        seguro: 'Seguro', internet: 'Internet', celular: 'Celular',
        combustivel: 'Combustível', manutencao: 'Manutenção', lavajato: 'Lava-jato',
        oleo: 'Troca de Óleo', pneus: 'Pneus', multa: 'Multa',
        estacionamento: 'Estacionamento', outros: 'Outros'
    };
    return map[cat] || cat;
}

function getCategoryClass(cat) {
    if (cat === 'uber') return 'uber';
    if (cat === '99') return 'n99';
    if (cat === 'indrive') return 'indrive';
    if (cat === 'combustivel') return 'combustivel';
    if (cat === 'manutencao') return 'manutencao';
    return 'default';
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setStatus(id, emoji) {
    const el = document.getElementById(id);
    if (el) el.textContent = emoji;
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// ==================== CHARTS UPDATE ====================
function updateCharts() {
    if (state.currentView === 'relatorios') initRelatorios();
}

// ==================== PDF REPORT GENERATION ====================
function generatePDF() {
    const element = document.getElementById('view-relatorios');
    if (!element) return;

    // 1. Prepare Data & Branded Header
    generateReportInsights();
    const dateEl = document.getElementById('pdf-report-date');
    if (dateEl) dateEl.textContent = `Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // 2. Visual Feedback
    showToast("Finalizando design do relatório A4... 📄", 5000);

    // 3. Temporary UI State for Senior-Level A4 Capture
    const headerActions = element.querySelector('.view-header > div:last-child');
    const pdfHeader = document.getElementById('report-pdf-header');
    const chartsGrid = element.querySelector('.charts-full-grid');
    const viewTitle = element.querySelector('.view-title');
    const viewSubtitle = element.querySelector('.view-subtitle');

    // Save originals for restoration
    const originalStyles = {
        width: element.style.width,
        maxWidth: element.style.maxWidth,
        padding: element.style.padding,
        margin: element.style.margin,
        backgroundColor: element.style.backgroundColor,
        boxSizing: element.style.boxSizing
    };

    // Force Perfect A4 Portrait Width (794px is standard for A4)
    element.style.width = '794px';
    element.style.maxWidth = '794px';
    element.style.padding = '40px';
    element.style.margin = '0';
    element.style.boxSizing = 'border-box';
    element.style.backgroundColor = '#05070a';

    if (headerActions) headerActions.style.display = 'none';
    if (pdfHeader) pdfHeader.style.display = 'flex';
    if (viewTitle) viewTitle.style.display = 'none';
    if (viewSubtitle) viewSubtitle.style.display = 'none';

    if (chartsGrid) {
        chartsGrid.style.display = 'block';
        chartsGrid.style.width = '100%';
    }

    const options = {
        margin: [10, 10, 10, 10], // Equal margins for natural centering
        filename: `giropro-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#05070a',
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            width: 794 // Capture exact forced width
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
    };

    // 4. Generate with Frame Delay (Ensures Chart.js stable state)
    setTimeout(() => {
        html2pdf().set(options).from(element).save().then(() => {
            // Restore screen layout
            element.style.width = originalStyles.width;
            element.style.maxWidth = originalStyles.maxWidth;
            element.style.padding = originalStyles.padding;
            element.style.margin = originalStyles.margin;
            element.style.backgroundColor = originalStyles.backgroundColor;
            element.style.boxSizing = originalStyles.boxSizing;

            if (headerActions) headerActions.style.display = 'flex';
            if (pdfHeader) pdfHeader.style.display = 'none';
            if (viewTitle) viewTitle.style.display = 'block';
            if (viewSubtitle) viewSubtitle.style.display = 'block';
            if (chartsGrid) {
                chartsGrid.style.display = 'grid';
            }
            showToast("Relatório A4 centralizado com sucesso! ✅", 3000);
        }).catch(err => {
            console.error("PDF Error:", err);
            showToast("Erro na geração. Tente novamente.", 3000);
        });
    }, 600);
}
