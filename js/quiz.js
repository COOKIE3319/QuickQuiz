import { STATE, els } from './state.js';

export async function loadSubjects() {
    try {
        const res = await fetch('data/index.json');
        if (!res.ok) throw new Error('Failed to load index.json');
        const data = await res.json();
        STATE.subjects = data.subjects || [];
        renderSubjectCards();
    } catch (e) {
        console.error(e);
        els.subjectList.innerHTML = '<div class="loading">加载科目失败，请刷新页面。</div>';
    }
}

function renderSubjectCards() {
    els.subjectList.innerHTML = '';
    STATE.subjects.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <h3>${sub.name}</h3>
            ${sub.contributor ? `<div class="contributor-tag">感谢: ${sub.contributor}</div>` : ''}
        `;
        card.onclick = () => selectSubject(sub.id);
        els.subjectList.appendChild(card);
    });
}

export async function selectSubject(subjectId) {
    const sub = STATE.subjects.find(s => s.id === subjectId);
    if (!sub) return;

    STATE.selectedSubjectId = subjectId;
    STATE.selectedSetId = 'all';
    els.currentSubjectName.textContent = sub.name;

    // Show quiz view, hide home
    els.homeView.style.display = 'none';
    els.quizView.style.display = 'block';
    els.quizControls.style.display = 'flex';
    els.randomControls.style.display = 'flex';
    els.exitSubjectBtn.style.display = 'block';

    // Load data for this subject
    const sets = [];
    for (const file of sub.files) {
        try {
            const res = await fetch(`data/${file}`);
            if (!res.ok) throw new Error(`Failed to load ${file}`);
            const data = await res.json();
            sets.push(...normalize(data, file));
        } catch (e) {
            console.error(e);
            alert(`无法加载题目文件: ${file}`);
        }
    }
    STATE.sets = sets;
    populateSetSelect();
    applySelection();
}

export function exitSubject() {
    STATE.selectedSubjectId = null;
    STATE.sets = [];
    STATE.questions = [];
    els.homeView.style.display = 'block';
    els.quizView.style.display = 'none';
    els.contributeView.style.display = 'none';
    els.quizControls.style.display = 'none';
    els.randomControls.style.display = 'none';
    els.exitSubjectBtn.style.display = 'none';
}

export function showContribute() {
    els.homeView.style.display = 'none';
    els.contributeView.style.display = 'block';
}

function normalize(data, filename) {
    // data can be array of questions, { sets: [] }, or { id/name, questions }
    if (Array.isArray(data)) {
        return [{ id: filename, name: filename, questions: validate(data) }];
    }
    if (data.sets && Array.isArray(data.sets)) {
        return data.sets.map(s => ({ ...s, questions: validate(s.questions) }));
    }
    if (data.questions && Array.isArray(data.questions)) {
        return [{ id: data.id || filename, name: data.name || filename, questions: validate(data.questions) }];
    }
    return [];
}

function validate(questions) {
    return questions.filter(q => {
        if (!q.text || !q.options || !q.answer || !Array.isArray(q.answer)) {
            console.warn('Malformed question skipped:', q);
            return false;
        }
        const keys = q.options.map(o => o.key);
        const validAnswers = q.answer.every(a => keys.includes(a));
        if (!validAnswers) {
            console.warn('Invalid answer key in question:', q);
            return false;
        }
        return true;
    });
}

function populateSetSelect() {
    if (!els.setSelect) return;
    els.setSelect.innerHTML = '<option value="all">全部题目集（混做）</option>';
    STATE.sets.forEach(set => {
        const opt = document.createElement('option');
        opt.value = set.id;
        opt.textContent = set.name;
        els.setSelect.appendChild(opt);
    });
}

export function applySelection() {
    const setId = els.setSelect.value;
    STATE.selectedSetId = setId;
    
    if (setId === 'all') {
        STATE.questions = STATE.sets.flatMap(s => s.questions);
    } else {
        STATE.questions = STATE.sets.find(s => s.id == setId)?.questions || [];
    }

    resetQuiz();
}

export function resetQuiz() {
    STATE.index = 0;
    STATE.score = 0;
    STATE.results = [];
    STATE.order = [...Array(STATE.questions.length).keys()];
    if (STATE.randomNext) {
        STATE.order.sort(() => Math.random() - 0.5);
    }
    
    els.statsCard.style.display = 'none';
    els.questionCard.style.display = 'block';
    renderQuestion();
}

export function renderQuestion() {
    if (STATE.questions.length === 0) {
        els.questionText.textContent = '当前题目集为空';
        els.optionsList.innerHTML = '';
        els.statusBar.textContent = '';
        els.submitBtn.disabled = true;
        return;
    }

    const qIndex = STATE.order[STATE.index];
    const q = STATE.questions[qIndex];
    STATE.isAnswered = false;

    els.statusBar.textContent = `题目 ${STATE.index + 1} / ${STATE.questions.length} | 得分: ${STATE.score}`;
    els.questionText.textContent = q.text;
    renderQuestionMedia(q);
    els.optionsList.innerHTML = '';
    els.feedback.style.display = 'none';
    els.submitBtn.style.display = q.type === 'multiple' ? 'block' : 'none';
    els.submitBtn.disabled = true;
    els.nextBtn.style.display = 'none';

    q.options.forEach(opt => {
        const li = document.createElement('li');
        li.className = 'option-item';
        li.innerHTML = `
            <input type="${q.type === 'multiple' ? 'checkbox' : 'radio'}" 
                   name="option" value="${opt.key}" class="option-input" id="opt-${opt.key}">
            <span class="option-key">${opt.key}.</span>
            <span class="option-text">${opt.text}</span>
        `;
        li.onclick = () => {
            if (STATE.isAnswered) return;
            const input = li.querySelector('input');
            const isMultiple = q.type === 'multiple';

            if (!isMultiple) {
                els.optionsList.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
            }
            
            input.checked = isMultiple ? !input.checked : true;
            li.classList.toggle('selected', input.checked);
            
            const checked = els.optionsList.querySelectorAll('input:checked');
            els.submitBtn.disabled = checked.length === 0;

            // 单选题或判断题直接提交
            if (!isMultiple) {
                checkAnswer();
            }
        };
        els.optionsList.appendChild(li);
    });
}

// 图片支持
function renderQuestionMedia(question) {
    if (!els.questionMedia) return;

    const media = [];

    if (Array.isArray(question.images)) {
        question.images.forEach(item => {
            if (typeof item === 'string') {
                media.push({ src: item, alt: '题目配图' });
            } else if (item && item.src) {
                media.push({ src: item.src, alt: item.alt || '题目配图' });
            }
        });
    }

    if (typeof question.image === 'string') {
        media.push({ src: question.image, alt: '题目配图' });
    } else if (question.image && question.image.src) {
        media.push({ src: question.image.src, alt: question.image.alt || '题目配图' });
    }

    if (typeof question.imageUrl === 'string') {
        media.push({ src: question.imageUrl, alt: '题目配图' });
    }

    els.questionMedia.innerHTML = '';
    if (media.length === 0) {
        els.questionMedia.classList.remove('has-media');
        return;
    }

    media.forEach(item => {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        els.questionMedia.appendChild(img);
    });

    els.questionMedia.classList.add('has-media');
}

export function checkAnswer() {
    const qIndex = STATE.order[STATE.index];
    const q = STATE.questions[qIndex];
    const checked = Array.from(els.optionsList.querySelectorAll('input:checked')).map(i => i.value);
    
    const isCorrect = checked.length === q.answer.length && 
                      checked.sort().every((v, i) => v === q.answer.sort()[i]);

    STATE.isAnswered = true;
    STATE.results.push({ questionId: q.id, correct: isCorrect, userAnswer: checked });

    const items = els.optionsList.querySelectorAll('.option-item');
    items.forEach(item => {
        const key = item.querySelector('input').value;
        if (q.answer.includes(key)) {
            item.classList.add('correct');
        } else if (checked.includes(key)) {
            item.classList.add('wrong');
        }
    });

    if (isCorrect) {
        STATE.score += q.score || 0;
        els.feedback.textContent = '回答正确！';
        els.feedback.className = 'feedback correct';
        setTimeout(() => nextQuestion(), 700);
    } else {
        els.feedback.textContent = `回答错误。正确答案是: ${q.answer.join(', ')}`;
        els.feedback.className = 'feedback wrong';
        els.nextBtn.style.display = 'block';
    }
    
    els.submitBtn.disabled = true;
    els.statusBar.textContent = `题目 ${STATE.index + 1} / ${STATE.questions.length} | 得分: ${STATE.score}`;
}

export function nextQuestion() {
    STATE.index++;
    if (STATE.index >= STATE.questions.length) {
        import('./stats.js').then(m => m.showStats());
    } else {
        renderQuestion();
    }
}
