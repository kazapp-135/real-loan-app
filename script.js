/* 全体のリセットとベース設定 */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: #000000;
    color: #FFD700;
    font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
    display: flex;
    justify-content: center;
    min-height: 100vh;
}

/* スマホサイズのコンテナ */
.app-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: #000000;
}

/* ヘッダー */
header {
    text-align: center;
    margin-bottom: 25px;
    padding-top: 10px;
}
h1 {
    font-size: 24px;
    letter-spacing: 2px;
    margin-bottom: 10px;
}
.notice-text {
    font-size: 11px;
    color: #CCCC00;
    line-height: 1.4;
    text-align: left;
    background-color: #111100;
    border: 1px solid #555500;
    padding: 10px;
    border-radius: 6px;
}

/* 入力エリア */
.input-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.input-group label {
    display: block;
    font-size: 14px;
    margin-bottom: 5px;
    font-weight: bold;
}

input, select {
    width: 100%;
    background-color: #111111;
    color: #FFD700;
    border: 2px solid #FFD700;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    outline: none;
    transition: 0.3s;
}

input:focus, select:focus {
    box-shadow: 0 0 10px #FFD700;
    background-color: #222222;
}
input::placeholder {
    color: #887700;
}

/* メインボタン */
#calc-btn {
    margin-top: 10px;
    width: 100%;
    background-color: #FFD700;
    color: #000000;
    border: none;
    padding: 15px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
}
#calc-btn:active {
    transform: scale(0.98);
    box-shadow: none;
}

/* 詳細表示ボタン (枠線だけのデザイン) */
.secondary-btn {
    width: 100%;
    background-color: transparent;
    color: #FFD700;
    border: 1px solid #FFD700;
    padding: 10px;
    font-size: 14px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
    margin-bottom: 10px;
    transition: 0.2s;
}
.secondary-btn:active {
    background-color: #333300;
}

/* 結果表示エリア */
.hidden {
    display: none !important;
}
#result-section {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    border-top: 2px dashed #FFD700;
    padding-top: 20px;
}
.result-box {
    background-color: #1a1a00;
    border: 2px solid #FFD700;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
}
.result-title {
    font-size: 14px;
    margin-bottom: 5px;
}
.result-value {
    font-size: 32px;
    font-weight: bold;
}
.unit {
    font-size: 16px;
    font-weight: normal;
}
.joke-text {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #FFF;
    text-shadow: 0 0 5px #FFD700;
    margin-bottom: 5px;
}

/* 推移表（テーブル）のデザイン */
#schedule-section {
    overflow-x: auto; /* スマホではみ出た場合に横スクロール */
    background-color: #111;
    border-radius: 6px;
    border: 1px solid #555500;
    margin-top: 10px;
}
.schedule-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    text-align: right;
    white-space: nowrap;
}
.schedule-table th, .schedule-table td {
    padding: 10px 6px;
    border-bottom: 1px solid #333300;
}
.schedule-table th {
    background-color: #222200;
    color: #FFD700;
    text-align: center;
    font-weight: normal;
}
.schedule-table td:first-child {
    text-align: center;
    color: #AAAAAA;
}
/* ボーナス月の行のスタイル */
.bonus-row {
    background-color: #2a2a00;
}
.bonus-row td {
    color: #FFF;
    font-weight: bold;
}

/* 計算式エリア */
.formula-section {
    margin-top: 40px;
    border-top: 2px solid #FFD700;
    padding-top: 20px;
    padding-bottom: 30px;
}
.formula-section h3 {
    font-size: 15px;
    margin-bottom: 5px;
    text-align: center;
}
.formula-section > p {
    font-size: 12px;
    color: #CCCC00;
    text-align: center;
    margin-bottom: 20px;
}
.formula-block {
    background-color: #111111;
    border: 1px solid #444400;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
}
.formula-title {
    font-size: 12px;
    font-weight: bold;
    color: #FFF;
    margin-bottom: 4px;
}
.formula-exp {
    font-size: 14px;
    font-family: 'Courier New', Courier, monospace;
    color: #FFD700;
    word-break: break-all;
}
