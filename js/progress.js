import { STATE, els } from './state.js';

const STORAGE_KEY = 'quickquiz-progress-v2';
const LEGACY_STORAGE_KEY = 'quickquiz-progress-v1';

export function loadSavedProgress(subjectId = STATE.selectedSubjectId, setId = STATE.selectedSetId) {
    if (!subjectId || !setId) return null;

    try {
        const store = readProgressStore();
        const progress = store.quizzes[getProgressKey(subjectId, setId)] || loadLegacyProgress(subjectId, setId);

        if (!isValidProgress(progress)) {
            return null;
        }

        return progress;
    } catch (error) {
        console.warn('Failed to load quiz progress:', error);
        clearSavedProgress();
        return null;
    }
}

export function saveProgress(view = 'quiz') {
    if (!STATE.selectedSubjectId || STATE.questions.length === 0) return;
    if (STATE.results.length === 0) {
        clearSavedProgress();
        return;
    }

    try {
        const store = readProgressStore();
        const progress = {
            version: 2,
            savedAt: new Date().toISOString(),
            selectedSubjectId: STATE.selectedSubjectId,
            selectedSetId: STATE.selectedSetId,
            randomNext: STATE.randomNext,
            index: STATE.index,
            score: STATE.score,
            order: STATE.order,
            results: STATE.results,
            view
        };

        store.quizzes[getProgressKey(STATE.selectedSubjectId, STATE.selectedSetId)] = progress;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
        console.warn('Failed to save quiz progress:', error);
    }
}

export function clearSavedProgress(subjectId = STATE.selectedSubjectId, setId = STATE.selectedSetId) {
    if (!subjectId || !setId) return;

    try {
        const store = readProgressStore();
        delete store.quizzes[getProgressKey(subjectId, setId)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

        const legacyProgress = readLegacyProgress();
        if (legacyProgress?.selectedSubjectId === subjectId && legacyProgress?.selectedSetId === setId) {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
    } catch (error) {
        console.warn('Failed to clear quiz progress:', error);
    }
}

export function hasUnfinishedProgress(progress) {
    return Boolean(
        progress &&
        Array.isArray(progress.results) &&
        progress.results.length > 0 &&
        progress.results.length < STATE.questions.length
    );
}

export function restoreProgress(progress) {
    if (!canRestoreProgress(progress)) return false;

    STATE.randomNext = Boolean(progress.randomNext);
    els.randomToggle.checked = STATE.randomNext;
    STATE.order = restoreOrder(progress.order);
    STATE.results = restoreResults(progress.results);
    STATE.score = STATE.results.reduce((total, result) => {
        if (!result.correct) return total;

        const question = STATE.questions[result.questionIndex];
        return total + (question?.score || 0);
    }, 0);
    STATE.index = clampIndex(progress.index);
    STATE.isAnswered = STATE.results.some(result => result.questionIndex === STATE.order[STATE.index]);

    return true;
}

function canRestoreProgress(progress) {
    return Boolean(
        progress &&
        progress.selectedSubjectId === STATE.selectedSubjectId &&
        progress.selectedSetId === STATE.selectedSetId &&
        STATE.questions.length > 0
    );
}

function restoreOrder(savedOrder) {
    const defaultOrder = [...Array(STATE.questions.length).keys()];

    if (!Array.isArray(savedOrder) || savedOrder.length !== STATE.questions.length) {
        return defaultOrder;
    }

    const uniqueIndexes = new Set(savedOrder);
    const hasEveryQuestion = defaultOrder.every(index => uniqueIndexes.has(index));
    if (uniqueIndexes.size !== STATE.questions.length || !hasEveryQuestion) {
        return defaultOrder;
    }

    return savedOrder;
}

function restoreResults(savedResults) {
    if (!Array.isArray(savedResults)) return [];

    const seen = new Set();

    return savedResults.reduce((results, item) => {
        const questionIndex = Number(item?.questionIndex);
        const question = STATE.questions[questionIndex];
        if (!Number.isInteger(questionIndex) || !question || seen.has(questionIndex)) {
            return results;
        }

        seen.add(questionIndex);

        const userAnswer = Array.isArray(item.userAnswer)
            ? item.userAnswer.filter(answer => typeof answer === 'string')
            : [];
        const correct = isSameAnswer(userAnswer, question.answer);

        results.push({
            questionId: question.id,
            questionIndex,
            correct,
            userAnswer
        });

        return results;
    }, []);
}

function isSameAnswer(userAnswer, correctAnswer) {
    if (!Array.isArray(correctAnswer) || userAnswer.length !== correctAnswer.length) {
        return false;
    }

    const sortedUserAnswer = [...userAnswer].sort();
    const sortedCorrectAnswer = [...correctAnswer].sort();
    return sortedUserAnswer.every((answer, index) => answer === sortedCorrectAnswer[index]);
}

function clampIndex(index) {
    const parsedIndex = Number(index);
    if (!Number.isInteger(parsedIndex)) return 0;

    return Math.min(Math.max(parsedIndex, 0), STATE.questions.length - 1);
}

function readProgressStore() {
    const defaultStore = { version: 2, quizzes: {} };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore;

    const store = JSON.parse(raw);
    if (!store || store.version !== 2 || !store.quizzes || typeof store.quizzes !== 'object') {
        return defaultStore;
    }

    return store;
}

function loadLegacyProgress(subjectId, setId) {
    const legacyProgress = readLegacyProgress();
    if (!legacyProgress) return null;

    return legacyProgress.selectedSubjectId === subjectId && legacyProgress.selectedSetId === setId
        ? legacyProgress
        : null;
}

function readLegacyProgress() {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    try {
        const progress = JSON.parse(raw);
        return progress?.version === 1 ? progress : null;
    } catch (error) {
        console.warn('Failed to load legacy quiz progress:', error);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return null;
    }
}

function isValidProgress(progress) {
    return Boolean(
        progress &&
        (progress.version === 1 || progress.version === 2) &&
        progress.selectedSubjectId &&
        progress.selectedSetId
    );
}

function getProgressKey(subjectId, setId) {
    return `${subjectId}::${setId}`;
}