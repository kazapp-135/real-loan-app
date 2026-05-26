function calculateLoan() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const bonusTimes = parseInt(document.getElementById('bonus-times').value);
    const bonusAmount = parseFloat(document.getElementById('bonus-amount').value) || 0;

    if (price <= 0 || years <= 0) {
        alert("車両価格と支払期間は正しく入力してください。");
        return;
    }
    if (downPayment >= price) {
        alert("頭金が車両価格を超えています。");
        return;
    }

    const P = price - downPayment;
    const M = years * 12;
    const r = rate / 100 / 12;
    const totalBonusCount = years * bonusTimes;
    const T = bonusAmount * totalBonusCount;

    let x = 0;
    let d = 0;
    const interval = 12 / bonusTimes;

    if (r > 0) {
        const x_factor = Math.pow(1 + r, -interval);
        const pvBonus = bonusAmount * x_factor * ((1 - Math.pow(x_factor, totalBonusCount)) / (1 - x_factor));
        const P_monthly = P - pvBonus;

        if (P_monthly < 0) {
            alert("ボーナス払いの設定額が高すぎます。借入元金を超えています。");
            return;
        }

        x = P_monthly * (r * Math.pow(1 + r, M)) / (Math.pow(1 + r, M) - 1);
        d = (x * M + T) - P;
    } else {
        x = (P - T) / M;
        d = 0;
        if (x < 0) {
            alert("ボーナス払いの設定額が高すぎます。借入元金を超えています。");
            return;
        }
    }

    // 基本結果の表示
    document.getElementById('res-monthly').innerText = x.toFixed(1);
    document.getElementById('res-interest').innerText = d.toFixed(1);

    // --- ここから推移表（スケジュール）の生成処理 ---
    let currentBalance = P; // 最初は元金フルマックスからスタート
    let scheduleHTML = '';

    for (let i = 1; i <= M; i++) {
        // 今月はボーナス月かどうか判定
        const isBonus = (i % interval === 0);
        const currentBonus = isBonus ? bonusAmount : 0;
        
        // 今月の支払総額 (基本の月々額 + ボーナスがあればボーナス)
        const paymentThisMonth = x + currentBonus;

        // 今月の利息 (先月の残高 × 月利)
        const interestThisMonth = currentBalance * r;
        
        // 今月返した「純粋な借金(元金)」の額
        const principalThisMonth = paymentThisMonth - interestThisMonth;

        // 残高から元金分を引く
        currentBalance -= principalThisMonth;

        // 小数点の計算誤差で最後の月に残高が微量のマイナスになるのを防ぐ
        if (currentBalance < 0 || i === M) {
            currentBalance = 0;
        }

        // 年と月のラベル生成 (0年1ヶ月目からスタート)
        const yearLabel = Math.floor((i - 1) / 12);
        const monthLabel = ((i - 1) % 12) + 1;
        
        // ボーナス月なら行のクラスを変更（CSSで色を変えるため）
        const rowClass = isBonus ? ' class="bonus-row"' : '';

        // 表の1行分のHTMLを作成
        scheduleHTML += `<tr${rowClass}>
            <td>${yearLabel}年${monthLabel}ヶ月</td>
            <td>${paymentThisMonth.toFixed(1)}</td>
            <td>${interestThisMonth.toFixed(1)}</td>
            <td>${currentBalance.toFixed(1)}</td>
        </tr>`;
    }

    // 作成したHTMLを表の中に流し込む
    document.getElementById('schedule-body').innerHTML = scheduleHTML;

    // 計算し直すたびに表は一旦閉じた状態に戻す
    document.getElementById('schedule-section').classList.add('hidden');
    document.getElementById('toggle-btn').innerText = '詳細を表示';

    // エリアを表示してスクロール
    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}

// 詳細ボタンを押した時の開閉（トグル）機能
function toggleSchedule() {
    const sec = document.getElementById('schedule-section');
    const btn = document.getElementById('toggle-btn');
    
    if (sec.classList.contains('hidden')) {
        sec.classList.remove('hidden');
        btn.innerText = '詳細を閉じる';
        // 表の下まで少しスクロール
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        sec.classList.add('hidden');
        btn.innerText = '詳細を表示';
    }
}
