document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES ---
    const quizContainer = document.getElementById('quiz-container');
    const submitQuiz = document.getElementById('submit-quiz-btn');
    const modalStep1 = document.getElementById('forum-modal-step1');
    const modalStep2 = document.getElementById('forum-modal-step2');
    const createSubjectBtn = document.getElementById('create-subject-btn');
    let selectedSubject = "";

    // --- NAVIGATION ---
    function navigateTo(targetId) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active-section');
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active-section');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if(targetId !== 'accueil') navigateTo('accueil');
        }

        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active-link');
            if (targetId.startsWith(link.getAttribute('data-navigate'))) {
                link.classList.add('active-link');
            }
        });
    }

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-navigate]');
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute('data-navigate'));
        }
    });

    // --- RECHERCHE ---
    const searchBtn = document.getElementById('search-button');
    const searchInp = document.getElementById('search-input');
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            const val = searchInp.value.toLowerCase();
            if (val.includes('math') || val.includes('nombre')) navigateTo('maths');
            else if (val.includes('francais')) navigateTo('francais');
            else if (val.includes('histoire')) navigateTo('histoire');
            else if (val.includes('science')) navigateTo('sciences');
            else alert("Essaie : maths, français, histoire...");
        });
    }

    // --- QUIZ (15 Questions + Aléatoire + Stats) ---
    const quizData = [
        {q:"4 x 8 ?", o:["32","24","36"], a:0, r:"4x8=32"}, {q:"Capitale France ?", o:["Lyon","Paris"], a:1, r:"Paris"},
        {q:"3 + 3 x 2 ?", o:["12","9"], a:1, r:"Priorité multiplication"}, {q:"Verbe être futur ?", o:["serai","suis"], a:0, r:"Je serai"},
        {q:"1h en min ?", o:["60","100"], a:0, r:"60 min"}, {q:"Clovis roi des ?", o:["Francs","Gaulois"], a:0, r:"Francs"},
        {q:"100 / 2 ?", o:["50","25"], a:0, r:"Moitié de 100"}, {q:"L'eau bout à ?", o:["100°C","90°C"], a:0, r:"100 degrés"},
        {q:"7 x 7 ?", o:["49","42"], a:0, r:"49"}, {q:"Pluriel de 'Nez' ?", o:["Nez","Nezs"], a:0, r:"Invariable"},
        {q:"Opposé de 'Grand' ?", o:["Petit","Haut"], a:0, r:"Petit"}, {q:"Louis XIV est ?", o:["Roi Soleil","Roi Lune"], a:0, r:"Soleil"},
        {q:"1kg = ?g", o:["1000","100"], a:0, r:"1000g"}, {q:"Le sang est ?", o:["Liquide","Solide"], a:0, r:"Liquide"},
        {q:"3 x 3 ?", o:["9","6"], a:0, r:"9"}, {q:"Paris est en ?", o:["France","Espagne"], a:0, r:"France"},
        {q:"Le ciel est ?", o:["Bleu","Vert"], a:0, r:"Bleu"}, {q:"50 + 50 ?", o:["100","200"], a:0, r:"100"},
        {q:"Un carré a ?", o:["4 côtés","3 côtés"], a:0, r:"4 côtés"}, {q:"1 min = ? s", o:["60","100"], a:0, r:"60s"}
    ];
    let currentQuestions = [];

    function renderQuiz() {
        if(!quizContainer) return;
        updateStatsDisplay(); 
        currentQuestions = quizData.sort(() => 0.5 - Math.random()).slice(0, 15);
        quizContainer.innerHTML = currentQuestions.map((item, index) => `
            <div class="quiz-question" id="q-${index}">
                <p><strong>${index+1}.</strong> ${item.q}</p>
                ${item.o.map((opt, i) => `<label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>`).join('')}
                <div class="correction-rationale"></div>
            </div>
        `).join('');
        document.getElementById('quiz-result').classList.add('notification-hidden');
        submitQuiz.textContent = "Valider mes réponses";
        submitQuiz.onclick = checkQuiz;
        submitQuiz.style.display = 'inline-block';
    }

    function checkQuiz() {
        let score = 0;
        let allAnswered = true;
        currentQuestions.forEach((item, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const div = document.getElementById(`q-${index}`);
            const rationale = div.querySelector('.correction-rationale');
            div.classList.remove('correct', 'incorrect');
            rationale.style.display = 'block';
            if(selected) {
                if(parseInt(selected.value) === item.a) {
                    score++;
                    div.classList.add('correct');
                    rationale.innerHTML = `✅ Correct ! (${item.r})`;
                } else {
                    div.classList.add('incorrect');
                    rationale.innerHTML = `❌ Faux. (${item.r})`;
                }
            } else { allAnswered = false; }
        });

        if(!allAnswered) { alert("Répondez à tout !"); return; }
        saveScore(score);
        document.getElementById('score-text').textContent = `Note : ${score} / 15`;
        document.getElementById('quiz-result').classList.remove('notification-hidden');
        submitQuiz.textContent = "Recommencer (Nouveau tirage)";
        submitQuiz.onclick = renderQuiz;
        updateStatsDisplay();
    }

    function saveScore(score) {
        let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
        history.push(score);
        localStorage.setItem('quizHistory', JSON.stringify(history));
    }
    
    function updateStatsDisplay() {
        const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
        if(history.length === 0) return;
        const sum = history.reduce((a, b) => a + b, 0);
        const avg = (sum / history.length).toFixed(1);
        const best = Math.max(...history);
        document.getElementById('stat-total').textContent = history.length;
        document.getElementById('stat-average').textContent = `${avg}/15`;
        document.getElementById('stat-best').textContent = `${best}/15`;
        const barsContainer = document.getElementById('chart-bars-area');
        if(barsContainer) {
            barsContainer.innerHTML = '';
            history.slice(-5).forEach(s => {
                let h = (s / 15) * 100;
                let bar = document.createElement('div');
                bar.className = 'stat-bar';
                bar.style.height = h + "%";
                bar.style.backgroundColor = s >= 10 ? "#28a745" : "#dc3545";
                bar.title = `Score: ${s}/15`;
                barsContainer.appendChild(bar);
            });
        }
    }
    
    const statsBtn = document.getElementById('show-stats-btn');
    if(statsBtn) statsBtn.onclick = () => {
        const pan = document.getElementById('quiz-stats-container');
        pan.style.display = pan.style.display === 'none' ? 'block' : 'none';
        updateStatsDisplay();
    };
    if(submitQuiz) renderQuiz();

    // --- DÉFI DU JOUR ---
    const dailyData = [{q: "Capitale de la France ?", a: "paris"}, {q: "20 + 20 ?", a: "40"}, {q: "Animal qui aboie ?", a: "chien"}];
    function normalize(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
    
    // Correction de l'index pour être stable sur la journée
    const todayIndex = new Date().getDay() % dailyData.length;
    const todayQ = dailyData[todayIndex];
    
    const defiTitle = document.getElementById('defi-question-text');
    if(defiTitle) defiTitle.textContent = todayQ.q;
    const defiBtn = document.getElementById('valider-defi-btn');
    const defiInput = document.getElementById('defi-user-answer');
    const feedbackBox = document.getElementById('defi-feedback');
    const myScoreEl = document.getElementById('my-defi-score');
    const rankingScoreEl = document.getElementById('ranking-score-display');
    let userDefiScore = parseInt(localStorage.getItem('userDefiScore')) || 12;
    if(myScoreEl) myScoreEl.textContent = userDefiScore;
    if(rankingScoreEl) rankingScoreEl.textContent = userDefiScore + " pts";

    if(defiBtn) {
        defiBtn.addEventListener('click', () => {
            const userRep = normalize(defiInput.value);
            const correctRep = normalize(todayQ.a);
            feedbackBox.classList.remove('feedback-hidden', 'feedback-success', 'feedback-error');
            if (userRep === correctRep) {
                feedbackBox.textContent = "✅ Bravo ! Bonne réponse (+1 pt)";
                feedbackBox.classList.add("feedback-bubble", "feedback-success");
                triggerConfetti();
                userDefiScore++;
                localStorage.setItem('userDefiScore', userDefiScore);
                if(myScoreEl) myScoreEl.textContent = userDefiScore;
                if(rankingScoreEl) rankingScoreEl.textContent = userDefiScore + " pts";
            } else {
                feedbackBox.textContent = `❌ Faux ! La réponse était : ${todayQ.a}`;
                feedbackBox.classList.add("feedback-bubble", "feedback-error");
            }
            defiBtn.disabled = true;
            defiInput.disabled = true;
        });
    }

    // --- CONFETTI ---
    function triggerConfetti() {
        const container = document.getElementById('confetti-container');
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.classList.add('confetti');
            c.style.left = Math.random() * 100 + 'vw';
            c.style.background = `hsl(${Math.random()*360}, 100%, 50%)`;
            c.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(c);
            setTimeout(() => c.remove(), 4000);
        }
    }

    // --- FORUM & CONTRIBUTION ---
    if(createSubjectBtn) createSubjectBtn.onclick = () => modalStep1.style.display = 'flex';
    window.closeAllModals = function() { document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none'); };

    document.querySelectorAll('.select-subject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSubject = btn.getAttribute('data-sub');
            const className = btn.getAttribute('data-class');
            modalStep1.style.display = 'none';
            modalStep2.style.display = 'flex';
            document.getElementById('forum-selected-info').textContent = `Sujet en : ${selectedSubject}`;
            document.getElementById('forum-selected-info').className = className;
        });
    });

    const publishBtn = document.getElementById('publish-forum-btn');
    if(publishBtn) {
        publishBtn.addEventListener('click', () => {
            const title = document.getElementById('new-post-title').value;
            const body = document.getElementById('new-post-body').value;
            const isAnon = document.getElementById('anon-check').checked;
            if(!title || !body) { alert("Remplissez tout !"); return; }
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes()}`;
            const author = isAnon ? "Anonyme" : "Moi";
            let tagClass = "math"; 
            if(selectedSubject === "Histoire") tagClass = "history";
            if(selectedSubject === "Sciences") tagClass = "science";
            if(selectedSubject === "Français") tagClass = "francais";

            // Ajout avec zone de réponse
            const html = `
            <div class="forum-card">
                <div class="forum-icon">📝</div>
                <div class="forum-content">
                    <div class="forum-header">
                        <span class="tag-subject ${tagClass}">${selectedSubject}</span>
                        <span class="forum-date">Aujourd'hui ${time}</span>
                    </div>
                    <h4>${title}</h4>
                    <p>${body}</p>
                    <div class="replies-container"></div>
                    <div class="reply-action-area">
                        <button class="reply-btn-small trigger-reply">↩️ Répondre</button>
                        <div class="reply-input-box" style="display: none;">
                            <textarea placeholder="Ta réponse..."></textarea>
                            <button class="nav-button-small send-reply">Envoyer</button>
                        </div>
                    </div>
                    <div class="forum-footer">
                        <span>Par <strong>${author}</strong></span>
                    </div>
                </div>
            </div>`;
            document.getElementById('forum-posts-container').insertAdjacentHTML('afterbegin', html);
            modalStep2.style.display = 'none';
            attachReplyEvents(); // Réattacher les événements aux nouveaux boutons
        });
    }

    const contribForm = document.getElementById('contribution-form');
    if(contribForm) {
        contribForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('contributor-email').value;
            const popup = document.getElementById('notification-popup');
            popup.innerHTML = `<p>✅ Bien reçu ! Une réponse vous sera envoyée à <strong>${email}</strong>.</p>`;
            popup.classList.remove('notification-hidden');
            setTimeout(() => popup.classList.add('notification-hidden'), 4000);
            contribForm.reset();
        });
    }

    // --- GESTION REPONSES FORUM ---
    function attachReplyEvents() {
        document.querySelectorAll('.trigger-reply').forEach(btn => {
            // Evite les doublons d'écouteurs
            btn.onclick = null;
            btn.onclick = function() {
                const box = this.nextElementSibling;
                box.style.display = box.style.display === 'none' ? 'flex' : 'none';
            };
        });

        document.querySelectorAll('.send-reply').forEach(btn => {
            btn.onclick = null;
            btn.onclick = function() {
                const textarea = this.previousElementSibling;
                const text = textarea.value;
                if(text) {
                    const container = this.closest('.forum-content').querySelector('.replies-container');
                    container.innerHTML += `<div class="reply-display-box"><strong>Moi :</strong> ${text}</div>`;
                    textarea.value = '';
                    this.closest('.reply-input-box').style.display = 'none';
                }
            };
        });
    }
    attachReplyEvents(); // Initial

    // --- UTILS ---
    window.toggleMode = function(btn, mode) {
        const section = btn.closest('.page-section');
        section.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active-mode'));
        btn.classList.add('active-mode');
        section.querySelectorAll('.content-mode').forEach(c => c.classList.remove('active-mode'));
        section.querySelector('.'+mode+'-mode').classList.add('active-mode');
    }
    
    document.querySelectorAll('.show-answer-btn').forEach(btn => {
        btn.onclick = function() {
            const sol = this.nextElementSibling;
            sol.style.display = sol.style.display === 'block' ? 'none' : 'block';
        }
    });

    // Compte à rebours
    setInterval(() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24,0,0,0);
        const diff = midnight - now;
        const h = Math.floor(diff/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        const el = document.getElementById('countdown');
        if(el) el.innerText = `${h}h ${m}m ${s}s`;
    }, 1000);

});
