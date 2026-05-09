# QuickQuiz

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-GPLv3-0071e3?style=for-the-badge&logo=gnu&logoColor=white" alt="License">
  <img src="https://img.shields.io/github/stars/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3&logo=github" alt="Stars">
  <img src="https://img.shields.io/github/forks/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3&logo=github" alt="Forks">
  <img src="https://img.shields.io/github/languages/top/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3" alt="Language">
  <img src="https://img.shields.io/github/repo-size/BaoZhuhan/QuickQuiz?style=for-the-badge&color=0071e3" alt="Size">
</p>

QuickQuiz 是一个轻量、优雅、可靠的单页题库练习系统，适合用于多学科、多题集的高效刷题与复习。项目基于原生 HTML、CSS 和 JavaScript 构建，无需打包工具和额外依赖，可以直接部署到任意静态网站服务。它支持单选题、多选题、判断题等常见题型，并提供自动判题、答题进度记录、错题与统计、主题切换等功能。界面采用简洁的 Apple 玻璃拟态风格，尽量减少干扰，让用户专注于题目本身。

## 功能特点

- **纯前端实现**：无需后端、无需数据库、无需构建流程，打开即可运行。
- **多学科题库管理**：通过 `data/index.json` 组织科目和题集，方便扩展新课程或新章节。
- **多题型支持**：支持 `single` 单选题、`multiple` 多选题和 `tf` 判断题。
- **即时交互体验**：单选题可在选择后即时提交，答对后自动进入下一题，降低重复操作成本。
- **学习进度记录**：本地保存答题状态、统计信息和练习进度，退出后重新打开会询问是否恢复进度。
- **主题切换**：支持浅色、深色以及多种柔和配色主题。
- **数据兼容处理**：内置题目数据规范化逻辑，能够尽量兼容和修复不完全标准的 JSON 题库格式。

## 快速开始

QuickQuiz 只需要一个静态 Web 服务即可运行。最简单的方式是使用 Python：

```bash
python3 -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000` 。

## 许可证

QuickQuiz 基于 [GNU General Public License v3.0](LICENSE) 开源。

## 作者/贡献者

- [BaoZhuhan](https://github.com/BaoZhuhan)
- [COOKIE3319](https://github.com/COOKIE3319)
