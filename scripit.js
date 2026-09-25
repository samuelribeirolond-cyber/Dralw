/* ==================== ESTADO DO APP ==================== */
const state = {
    totalScore: 0,
    desenhosNoSketchbook: 0,
    historicoMensal: {
        "1/2026": 0,
        "2/2026": 0
    },
    challengeAccepted: false,
    challengeDeadline: null,
    currentChallenge: null,
    noRefMode: false,
    minigameSorteado: false,
    minigameImage: null
};

// Listas para o Mini Game
const personagens = ["Um monstro de lava", "Um cavaleiro cibernético", "Uma fada das sombras", "Um robô enferrujado", "Uma sereia do deserto"];
const caracteristicas = ["Com olhos brilhantes", "Usando um chapéu enorme", "Com cicatrizes de batalha", "Muito elegante", "Segurando um guarda-chuva"];
const habilidades = ["Controla o tempo", "Fala com animais", "Pode voar", "Cria ilusões", "Super força"];

const desafios = [
    { titulo: "Monstro de Lava", desc: "Crie um monstro feito de lava e rochas. Ele deve ter pelo menos 3 olhos e estar em um ambiente vulcânico." },
    { titulo: "Cidade Flutuante", desc: "Desenhe uma cidade que flutua nas nuvens. Inclua detalhes de como as pessoas se locomovem." },
    { titulo: "Guerreiro Samurai", desc: "Um samurai em posição de ataque. Preste atenção na armadura e na espada." },
    { titulo: "Floresta Biônica", desc: "Uma floresta onde as árvores são feitas de metal e circuitos." }
];

/* ==================== NAVEGAÇÃO ==================== */
function changeScreen(screenId, element) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    if (screenId === 'challenges') {
        renderChallenge();
    }
}

/* ==================== SISTEMA DE PONTOS ==================== */
function toggleScoreDetails() {
    const details = document.getElementById('scoreDetails');
    details.classList.toggle('active');
    updateScoreUI();
}

function updateScoreUI() {
    document.getElementById('totalScore').textContent = state.totalScore;
    
    const monthlyList = document.getElementById('monthlyScores');
    monthlyList.innerHTML = '';
    for (const [mes, pontos] of Object.entries(state.historicoMensal)) {
        const li = document.createElement('li');
        li.innerHTML = `<span>${mes}</span> <span style="color: ${pontos >= 0 ? '#00e5ff' : '#ff5252'}">${pontos > 0 ? '+' : ''}${pontos} pts</span>`;
        monthlyList.appendChild(li);
    }
}

function addScore(pontos) {
    state.totalScore += pontos;
    state.historicoMensal["1/2026"] += pontos;
    updateScoreUI();
}

/* ==================== TELA 1: SKETCHBOOK ==================== */
function handleSketchUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgSrc = e.target.result;
        
        const album = document.getElementById('sketchAlbum');
        const emptyState = document.getElementById('emptyState');
        if (emptyState) emptyState.style.display = 'none';

        const date = new Date().toLocaleDateString('pt-BR');
        
        const card = document.createElement('div');
        card.className = 'sketch-card';
        card.innerHTML = `
            <img src="${imgSrc}" alt="Desenho">
            <div class="sketch-info">
                <span class="sketch-date">${date}</span>
                <span class="sketch-score" id="score-${Date.now()}">Analisando...</span>
            </div>
        `;
        album.prepend(card);

        // Lógica de Pontuação
        state.desenhosNoSketchbook++;
        
        // Regra: Primeiros 10 desenhos dão nota. Depois, a cada 5.
        if (state.desenhosNoSketchbook <= 10 || state.desenhosNoSketchbook % 5 === 0) {
            setTimeout(() => {
                const nota = Math.floor(Math.random() * 7) - 1; // -1 a 5
                addScore(nota);
                const scoreBadge = card.querySelector('.sketch-score');
                scoreBadge.textContent = `Nota: ${nota}`;
                scoreBadge.style.color = nota >= 0 ? '#00e5ff' : '#ff5252';
            }, 2000);
        } else {
            setTimeout(() => {
                const scoreBadge = card.querySelector('.sketch-score');
                scoreBadge.textContent = 'Salvo';
                scoreBadge.style.color = '#aaa';
            }, 1000);
        }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

/* ==================== TELA 2: CRÍTICAS ==================== */
function handleRefUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('refPreview');
        img.src = e.target.result;
        img.style.display = 'block';
        document.querySelector('#refBox span').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function handleDrawUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('drawPreview');
        img.src = e.target.result;
        img.style.display = 'block';
        document.querySelector('#drawBox span').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function toggleNoRef() {
    state.noRefMode = !state.noRefMode;
    const btn = document.getElementById('noRefBtn');
    const refBox = document.getElementById('refBox');
    
    if (state.noRefMode) {
        btn.classList.add('active');
        btn.textContent = 'Nenhuma Referência (Ativo)';
        refBox.style.opacity = '0.3';
        refBox.style.pointerEvents = 'none';
    } else {
        btn.classList.remove('active');
        btn.textContent = 'Nenhuma Referência';
        refBox.style.opacity = '1';
        refBox.style.pointerEvents = 'auto';
    }
}

function analyzeDrawing() {
    const drawImg = document.getElementById('drawPreview').src;
    if (!drawImg) {
        alert("Por favor, envie o seu desenho primeiro.");
        return;
    }

    const loader = document.getElementById('critiqueLoader');
    const result = document.getElementById('critiqueResult');
    
    loader.style.display = 'block';
    result.style.display = 'none';

    setTimeout(() => {
        loader.style.display = 'none';
        result.style.display = 'block';
        
        const refText = state.noRefMode ? "sem referência" : "com base na sua referência";
        document.getElementById('critiqueText').innerHTML = `
            Analisei seu desenho <span class="highlight">${refText}</span>. 
            <br><br>
            <strong>O que está bom:</strong> A composição geral está interessante e você tem um bom controle de traço.
            <br><br>
            <strong>O que melhorar:</strong> A proporção anatômica pode ser ajustada. Tente usar formas geométricas básicas antes de detalhar.
            <br><br>
            <strong>O que estudar:</strong> Recomendo estudar <em>Luz e Sombra</em> e <em>Anatomia Humana - Membros Superiores</em>.
        `;
        document.getElementById('practicalTips').style.display = 'none';
    }, 2500);
}

function showPracticalTips() {
    const tips = document.getElementById('practicalTips');
    tips.style.display = tips.style.display === 'none' ? 'block' : 'none';
}

/* ==================== TELA 3: DESAFIOS ==================== */
function renderChallenge() {
    const container = document.getElementById('challengeContent');
    
    if (state.challengeAccepted && state.challengeDeadline) {
        const now = new Date().getTime();
        const distance = state.challengeDeadline - now;
        
        if (distance < 0) {
            state.challengeAccepted = false;
            addScore(-7);
            alert("Tempo esgotado! Você perdeu -7 pontos.");
            renderChallenge();
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="challenge-card">
                <h3>${state.currentChallenge.titulo}</h3>
                <p>${state.currentChallenge.desc}</p>
                <div class="timer">${hours}h ${minutes}m ${seconds}s</div>
                <p style="font-size: 12px;">Tempo restante para entregar</p>
            </div>
            <label class="upload-area" for="challengeUpload">
                <div class="upload-icon">📤</div>
                <p>Entregar Desenho</p>
                <input type="file" id="challengeUpload" accept="image/*" capture="environment" onchange="submitChallenge(event)">
            </label>
        `;
        
        setTimeout(renderChallenge, 1000);

    } else {
        const randomIndex = Math.floor(Math.random() * desafios.length);
        state.currentChallenge = desafios[randomIndex];

        container.innerHTML = `
            <div class="challenge-card">
                <h3>Desafio do Dia</h3>
                <p><strong>${state.currentChallenge.titulo}</strong></p>
                <p>${state.currentChallenge.desc}</p>
            </div>
            <div class="challenge-actions">
                <button class="btn btn-cyan" onclick="acceptChallenge()">Aceitar</button>
                <button class="btn btn-outline" style="border-color: white; color: white;" onclick="recuseChallenge()">Recusar</button>
            </div>
        `;
    }
}

function acceptChallenge() {
    state.challengeAccepted = true;
    state.challengeDeadline = new Date().getTime() + (24 * 60 * 60 * 1000);
    renderChallenge();
}

function recuseChallenge() {
    renderChallenge();
}

function submitChallenge(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        alert("Desenho entregue! Analisando...");
        
        setTimeout(() => {
            const nota = Math.floor(Math.random() * 16) - 5; // -5 a 10
            addScore(nota);
            state.challengeAccepted = false;
            state.challengeDeadline = null;
            
            alert(`Análise concluída! Nota do desafio: ${nota}`);
            renderChallenge();
        }, 2000);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

/* ==================== TELA 4: MINI GAMES ==================== */
function sortearPersonagem() {
    const p = personagens[Math.floor(Math.random() * personagens.length)];
    const c = caracteristicas[Math.floor(Math.random() * caracteristicas.length)];
    const h = habilidades[Math.floor(Math.random() * habilidades.length)];

    document.querySelector('#slot1 span').textContent = p;
    document.querySelector('#slot2 span').textContent = c;
    document.querySelector('#slot3 span').textContent = h;

    state.minigameSorteado = true;
    document.getElementById('minigameResult').style.display = 'block';
}

function handleMinigameUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        state.minigameImage = e.target.result;
        alert("Imagem carregada! Clique em Enviar Desenho.");
    };
    reader.readAsDataURL(file);
}

function submitMinigame() {
    if (!state.minigameSorteado) {
        alert("Sorteie um personagem primeiro!");
        return;
    }
    if (!state.minigameImage) {
        alert("Por favor, envie o desenho do personagem sorteado.");
        return;
    }
    
    alert("Desenho do Mini Game enviado! Análise em andamento...");
    setTimeout(() => {
        const nota