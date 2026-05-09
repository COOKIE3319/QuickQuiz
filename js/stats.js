import { STATE, els } from './state.js';
import { saveProgress } from './progress.js';

export function showStats() {
    els.questionCard.style.display = 'none';
    els.statsCard.style.display = 'block';

    const answeredCount = STATE.results.length;
    const totalCount = STATE.questions.length;
    const correctCount = STATE.results.filter(r => r.correct).length;
    const acc = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    els.accuracy.textContent = `${acc}%`;
    els.scoreCount.textContent = `${correctCount} / ${answeredCount} (得分: ${STATE.score} | 总题量: ${totalCount})`;

    renderWrongList();
    saveProgress('stats');
}

function renderWrongList() {
    els.wrongList.innerHTML = '';
    const wrongs = STATE.results.filter(r => !r.correct);
    
    if (wrongs.length === 0) {
        els.wrongList.innerHTML = '<p style="text-align:center; color:var(--success);">完美！没有错题。</p>';
        return;
    }

    wrongs.forEach(res => {
        const q = STATE.questions[res.questionIndex] || STATE.questions.find(q => q.id === res.questionId);
        const item = document.createElement('div');
        item.className = 'wrong-item';
        item.innerHTML = `
            <div class="wrong-text">${q?.text || '题目已不可用'}</div>
            <div class="wrong-answer">正确答案: ${q?.answer?.join(', ') || '无'} | 你的回答: ${res.userAnswer.join(', ') || '无'}</div>
        `;
        els.wrongList.appendChild(item);
    });
}
