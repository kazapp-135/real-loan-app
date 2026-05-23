function calculateLoan() {
    // 入力値の取得
    const price = parseFloat(document.getElementById('price').value) || 0;
    const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0; // 単位：年
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const bonusTimes = parseInt(document.getElementById('bonus-times').value);
    const bonusAmount = parseFloat(document.getElementById('bonus-amount').value) || 0;

    // バリデーション
    if (price <= 0 || years <= 0) {
        alert("車両価格と支払期間は正しく入力してください。");
        return;
    }
    if (downPayment >= price) {
        alert("頭金が車両価格を超えています。");
        return;
    }

    // ローン元金（借入総額）
    const P = price - downPayment;
    
    // 総支払回数（ヶ月）
    const M = years * 12;
    
    // 月利の計算
    const r = rate / 100 / 12;

    // 総ボーナス回数とボーナス支払総額
    const totalBonusCount = years * bonusTimes;
    const T = bonusAmount * totalBonusCount;

    let x = 0; // 月々の支払額
    let d = 0; // 増えた分（利息）

    if (r > 0) {
        // 【元金二分割・現在価値法】
        // ボーナスが支払われる間隔（年2回なら6ヶ月ごと、年1回なら12ヶ月ごと）
        const interval = 12 / bonusTimes; 
        
        // 各ボーナス月の割引因子の総和を等比数列の和の公式で計算
        // 割引因子 x_factor = (1 + r)^(-interval)
        const x_factor = Math.pow(1 + r, -interval);
        const pvBonus = bonusAmount * x_factor * ((1 - Math.pow(x_factor, totalBonusCount)) / (1 - x_factor));

        // 毎月返済分に割り当てられる純粋な元金
        const P_monthly = P - pvBonus;

        if (P_monthly < 0) {
            alert("ボーナス払いの設定額が高すぎます。借入元金を超えています。");
            return;
        }

        // 毎月分の元金(P_monthly)に対して、元利均等返済の公式を適用
        x = P_monthly * (r * Math.pow(1 + r, M)) / (Math.pow(1 + r, M) - 1);
        
        // 利息の総額 ＝（毎月の返済総額 ＋ ボーナス返済総額）− 最初に借りた元金
        d = (x * M + T) - P;

    } else {
        // 金利が0%の場合
        x = (P - T) / M;
        d = 0;
        if (x < 0) {
            alert("ボーナス払いの設定額が高すぎます。借入元金を超えています。");
            return;
        }
    }

    // 画面に表示（小数点第1位まで）
    document.getElementById('res-monthly').innerText = x.toFixed(1);
    document.getElementById('res-interest').innerText = d.toFixed(1);

    // 結果エリアを表示する
    document.getElementById('result-section').classList.remove('hidden');
    
    // スクロールして結果を見やすくする
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}
