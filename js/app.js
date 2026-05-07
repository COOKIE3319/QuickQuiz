import { STATE, els } from './state.js';
import { initTheme } from './theme.js';
import { loadSubjects, applySelection, resetQuiz, checkAnswer, nextQuestion, exitSubject, showContribute } from './quiz.js';
import { showStats } from './stats.js';

function bindEvents() {
    els.setSelect.addEventListener('change', applySelection);
    
    els.randomToggle.addEventListener('change', (e) => {
        STATE.randomNext = e.target.checked;
        applySelection(); // 重新排序
    });

    els.submitBtn.addEventListener('click', checkAnswer);
    els.nextBtn.addEventListener('click', nextQuestion);
    els.resetBtn.addEventListener('click', resetQuiz);
    els.endBtn.addEventListener('click', showStats);
    els.backBtn.addEventListener('click', resetQuiz);
    els.exitSubjectBtn.addEventListener('click', exitSubject);
    els.answeredToggle.addEventListener('click', () => {
        const collapsed = els.answeredPanel.classList.toggle('collapsed');
        els.answeredToggle.setAttribute('aria-expanded', String(!collapsed));
        els.answeredToggle.setAttribute('aria-label', collapsed ? '展开题目总览' : '收起题目总览');
    });
    
    els.logo.addEventListener('click', (e) => {
        e.preventDefault();
        exitSubject();
    });
    els.contributeBtn.addEventListener('click', showContribute);
    els.closeContributeBtn.addEventListener('click', exitSubject);

    // Menu logic
    els.menuToggle.addEventListener('click', () => {
        els.nav.classList.toggle('show');
        els.overlay.classList.toggle('show');
        document.body.classList.toggle('lock-scroll');
    });

    const closeMenu = () => {
        els.nav.classList.remove('show');
        els.overlay.classList.remove('show');
        document.body.classList.remove('lock-scroll');
    };

    els.overlay.addEventListener('click', closeMenu);
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 600) closeMenu();
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!STATE.isAnswered && !els.submitBtn.disabled) {
                checkAnswer();
            } else if (STATE.isAnswered && els.nextBtn.style.display !== 'none') {
                nextQuestion();
            }
        }
    });
}

async function init() {
    initTheme();
    await loadSubjects();
    bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
