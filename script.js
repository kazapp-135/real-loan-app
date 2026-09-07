function calculateLoan() {
    // 変数の取得と空欄の特定プロセス
    const ids = ['price', 'down-payment', 'monthly', 'years', 'rate', 'bonus-amount'];
    let vals = {};
    let emptyFields = [];

    ids.forEach(id => {
        const el = document.getElementById(id);
        const val = el.value.trim();
        
        // 頭金は特別処理（空欄の場合は暗黙的に0万円として扱うため逆算対象から除外）
        if (id === 'down-payment') {
            vals[id] = val === '' ? 0 : parseFloat(val);
            return; 
        }

        if (val === '') {
            emptyFields.push(id);
            vals[id] = null;
        } else {
            vals[id] = parseFloat(val);
        }
    });

    const bonusTimes = parseInt(document.getElementById('bonus-times').value);
    const interval = bonusTimes > 0 ? 12 / bonusTimes : 999;

    // 空欄入力のバリデーションチェック
    if (emptyFields.length !== 1) {
        alert("逆算したい項目を『1つだけ』空欄にしてシミュレーションボタンを押してください。\n(※頭金は空欄の場合、0万円として扱われます)");
        return;
    }

    let target = emptyFields[0];
    let price = vals['price'];
    let down = vals['down-payment'];
    let monthly = vals['monthly'];
    let years = vals['years'];
    let rate = vals['rate'];
    let bonus = vals['bonus-amount'];

    if (bonusTimes === 0 && target === 'bonus-amount') {
        alert("ボーナス設定が「年0回」のため、ボーナス額の逆算はできません。");
        return;
    }

    // 確定している初期変数の代入
    let P = target !== 'price' ? price - down : null;
    let M = target !== 'years' ? years * 12 : null;
    let r = target !== 'rate' ? rate / 100 / 12 : null;

    // ヘルパー関数：現在価値(PV)の算出
    // 月々支払額の現在価値（元金換算）
    const calcPV_m = (x, m, r_m) => (r_m === 0) ? x * m : x * (1 - Math.pow(1 + r_m, -m)) / r_m;
    
    // ボーナス支払額の現在価値（元金換算）
    const calcPV_b = (b, m, r_m, inv) => {
        if (bonusTimes === 0) return 0;
        let totalTimes = Math.floor(m / inv);
        if (r_m === 0) return b * totalTimes;
        let x_factor = Math.pow(1 + r_m, -inv);
        return b * x_factor * (1 - Math.pow(x_factor, totalTimes)) / (1 - x_factor);
    };

    // 逆算エンジンのコアロジック
    try {
        if (target === 'monthly') {
            let pv_b = calcPV_b(bonus, M, r, interval);
            let pv_m_needed = P - pv_b;
            if (pv_m_needed < 0) throw "エラー：ボーナス設定額が高すぎます。ボーナス分のみで借入元金を超過しています。";
            
            if (r === 0) monthly = pv_m_needed / M;
            else monthly = pv_m_needed * r / (1 - Math.pow(1 + r, -M));
        } 
        else if (target === 'bonus-amount') {
            let pv_m = calcPV_m(monthly, M, r);
            let pv_b_needed = P - pv_m;
            let totalTimes = Math.floor(M / interval);
            
            if (pv_b_needed <= 0) throw "エラー：月々の支払額のみで完済可能な設定です。ボーナス払いは不要です。";
            if (totalTimes === 0) throw "エラー：指定された支払期間内にボーナス月が一度も到来しません。";
            
            if (r === 0) bonus = pv_b_needed / totalTimes;
            else {
                let x_factor = Math.pow(1 + r, -interval);
                let factor = x_factor * (1 - Math.pow(x_factor, totalTimes)) / (1 - x_factor);
                bonus = pv_b_needed / factor;
            }
        } 
        else if (target === 'price') {
            P = calcPV_m(monthly, M, r) + calcPV_b(bonus, M, r, interval);
            price = P + down;
        } 
        else if (target === 'years') {
            let bal = P;
            let m = 0;
            // 期間の逆算は残高減少シミュレーションによって導出
            while (bal > 0.001 && m < 1200) { 
                m++;
                let interest = bal * r;
                bal += interest;
                bal -= monthly;
                if (bonusTimes > 0 && m % interval === 0) bal -= bonus;
                
                if (m === 1 && bal >= P) throw "エラー：毎月の支払額が利息分を下回っており、元金が減少しないため永遠に完済できません。";
            }
            if (m === 1200) throw "エラー：返済期間が100年を超過します。毎月の支払額またはボーナス額を増額してください。";
            M = m;
            years = M / 12;
        } 
        else if (target === 'rate') {
            let totalExpected = monthly * M + (bonusTimes > 0 ? bonus * Math.floor(M / interval) : 0);
            if (totalExpected < P) throw "エラー：入力された総支払額が借入元金を下回っています（マイナス金利となるため計算不可）。";
            
            // 金利の逆算：二分法による収束計算アルゴリズム
            let low = 0, high = 1.0; 
            let r_ans = 0;
            for (let i = 0; i < 100; i++) {
                let mid = (low + high) / 2;
                let r_mid = mid / 12;
                let pv_m = calcPV_m(monthly, M, r_mid);
                let pv_b = calcPV_b(bonus, M, r_mid, interval);
                if ((pv_m + pv_b) > P) low = mid; 
                else high = mid; 
                r_ans = mid;
            }
            rate = r_ans * 100;
            r = rate / 100 / 12;
        }
    } catch (error) {
        alert(error);
        return;
    }

    // 全変数が確定した段階での再計算（フォーマット用）
    P = price - down;
    let final_pv_b = calcPV_b(bonus, M, r, interval);

    // ★労働金庫（労金）等における「ボーナス返済50%ルール」の判定と警告★
    // ボーナスが負担する元金（現在価値）が、借入総元金の50%を超えているかを検知
    let bonusPrincipalRatio = (final_pv_b / P) * 100;
    if (bonusPrincipalRatio > 50) {
        alert(`【規定超過アラート：ボーナス割合 ${bonusPrincipalRatio.toFixed(1)}%】\n労金等の一般的なカーローン規定では、ボーナス払いによる元金充当は「借入総額の50%以内」に制限されています。\n\n現在の設定は規定上限をオーバーしているため実際の審査では非承認となる可能性が高いですが、シミュレーションとして計算を続行し結果を表示します。`);
    }

    // 計算結果のUI反映処理
    let solvedValue = 0;
    if (target === 'monthly') solvedValue = monthly;
    else if (target === 'bonus-amount') solvedValue = bonus;
    else if (target === 'price') solvedValue = price;
    else if (target === 'years') solvedValue = years;
    else if (target === 'rate') solvedValue = rate;

    const targetEl = document.getElementById(target);
    targetEl.value = (target === 'years' || target === 'rate') ? solvedValue.toFixed(2) : solvedValue.toFixed(1);
    
    // 逆算された対象項目を発光させるCSSアニメーションのトリガー
    targetEl.classList.remove('calc-highlight');
    void targetEl.offsetWidth;
    targetEl.classList.add('calc-highlight');

    // 詳細スケジュール（返済推移表）の構築および総利息の算出処理[cite: 3]
    let currentBalance = P;
    let scheduleHTML = '';
    let totalInterest = 0;
    let actualMonths = 0;

    while (currentBalance > 0.001 && actualMonths < 1200) {
        actualMonths++;
        let isBonus = (bonusTimes > 0 && actualMonths % interval === 0);
        let currentBonus = isBonus ? bonus : 0;

        let interestThisMonth = currentBalance * r;
        totalInterest += interestThisMonth;

        let paymentThisMonth = monthly + currentBonus;
        let principalThisMonth = paymentThisMonth - interestThisMonth;

        // 最終月における残高マイナス化を防ぐ端数調整
        if (currentBalance + interestThisMonth < paymentThisMonth) {
            paymentThisMonth = currentBalance + interestThisMonth;
            principalThisMonth = currentBalance;
        }

        currentBalance -= principalThisMonth;
        if (currentBalance < 0) currentBalance = 0;

        const yearLabel = Math.floor((actualMonths - 1) / 12);
        const monthLabel = ((actualMonths - 1) % 12) + 1;
        const rowClass = isBonus ? ' class="bonus-row"' : '';

        scheduleHTML += `<tr${rowClass}>
            <td>${yearLabel}年${monthLabel}ヶ月</td>
            <td>${paymentThisMonth.toFixed(1)}</td>
            <td>${interestThisMonth.toFixed(1)}</td>
            <td>${currentBalance.toFixed(1)}</td>
        </tr>`;
    }

    // 表示データのマッピング
    const targetNames = {
        'price': '車両価格',
        'monthly': '月々の支払額',
        'years': '支払期間',
        'rate': '適応金利',
        'bonus-amount': 'ボーナス支払額'
    };
    const targetUnits = {
        'price': '万円',
        'monthly': '万円',
        'years': '年',
        'rate': '％',
        'bonus-amount': '万円'
    };

    document.getElementById('res-title-target').innerText = `【逆算完了】 ${targetNames[target]}`;
    document.getElementById('res-target-val').innerText = targetEl.value;
    document.getElementById('res-target-unit').innerText = targetUnits[target];
    document.getElementById('res-interest').innerText = totalInterest.toFixed(1);
    document.getElementById('schedule-body').innerHTML = scheduleHTML;

    // UIコンポーネントの表示切り替えと自動スクロール
    document.getElementById('schedule-section').classList.add('hidden');
    document.getElementById('toggle-btn').innerText = '詳細推移を表示';
    document.getElementById('result-section').classList.remove('hidden');
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}

// 推移表のトグル展開機能
function toggleSchedule() {
    const sec = document.getElementById('schedule-section');
    const btn = document.getElementById('toggle-btn');
    
    if (sec.classList.contains('hidden')) {
        sec.classList.remove('hidden');
        btn.innerText = '詳細を閉じる';
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        sec.classList.add('hidden');
        btn.innerText = '詳細推移を表示';
    }
}
