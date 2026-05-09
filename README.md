# QuickQuiz

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-GPLv3-0071e3?style=for-the-badge&logo=gnu&logoColor=white" alt="License">
  <img src="https://img.shields.io/github/stars/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3&logo=github" alt="Stars">
  <img src="https://img.shields.io/github/forks/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3&logo=github" alt="Forks">
  <img src="https://img.shields.io/github/languages/top/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3" alt="Language">
  <img src="https://img.shields.io/github/repo-size/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3" alt="Size">
</p>

QuickQuiz is a minimal, elegant, and reliable Single Page Application (SPA) quiz system designed for efficient practice across multiple subjects and question sets. Built with vanilla HTML, CSS, and JavaScript, it features a glassmorphism UI inspired by Apple's design language, supporting multiple question types including single-choice, multiple-choice, and true/false. By prioritizing data integrity and seamless interaction—such as auto-advancing on correct answers and subject-scoped randomization—QuickQuiz provides a pure, distraction-free environment for users to master their knowledge with ease.

## Key Features

- **Pure Frontend Implementation**: No backend, no database, and no build process. Open it and start using it.
- **Multi-Subject Question Bank Management**: Organize subjects and question sets through `data/index.json`, making it easy to add new courses or chapters.
- **Multiple Question Types**: Supports `single` single-choice, `multiple` multiple-choice, and `tf` true/false questions.
- **Fast Practice Flow**: Single-choice questions can be submitted immediately after selection, and correct answers automatically advance to the next question.
- **Progress Tracking**: Saves answer status, statistics, and practice progress locally, and asks whether to restore progress when reopened.
- **Theme Switching**: Supports light, dark, and several soft color themes.
- **Data Resilience**: Includes built-in question data normalization to handle and recover from non-standard JSON question formats where possible.

## Getting Started

QuickQuiz only needs a static web server. The quickest way to run it is with Python:

```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## License
QuickQuiz is licensed under the [GNU General Public License v3.0](LICENSE).

## Author/Contributors
- [BaoZhuhan](https://github.com/BaoZhuhan)
- [COOKIE3319](https://github.com/COOKIE3319)
