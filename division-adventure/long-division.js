/* A self-contained visual lesson. Call window.renderLongGame(containerElement). */
(function () {
  'use strict';
  const STYLE_ID = 'division-long-game-styles';
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style'); style.id = STYLE_ID;
    style.textContent = `
      .ld-game{--ld-ink:#244d49;--ld-green:#1d806c;--ld-orange:#e9934e;--ld-light:#fffaf0;color:var(--ld-ink);font-family:inherit;max-width:100%;}
      .ld-game *{box-sizing:border-box}.ld-game button{font:inherit;cursor:pointer;touch-action:manipulation}.ld-game button:focus-visible{outline:4px solid #e99951;outline-offset:3px}
      .ld-board{display:grid;grid-template-columns:minmax(185px,.8fr) minmax(220px,1.2fr);gap:12px;align-items:stretch}.ld-paper,.ld-place{border-radius:22px;padding:18px;background:#fffef6;border:1px solid #dfe9d5;box-shadow:0 5px 0 #dce9d4}
      .ld-label{font-size:12px;font-weight:900;letter-spacing:.08em;color:#628278}.ld-place h3{margin:5px 0 8px;font-size:19px}.ld-place p{margin:8px 0;line-height:1.65}
      .ld-tiles{display:flex;align-items:stretch;gap:8px;flex-wrap:wrap;margin:12px 0}.ld-tile{border-radius:14px;padding:10px 12px;min-width:72px;text-align:center;background:#e0f2dd;border:2px solid #aed5b1;font-size:14px;font-weight:800;animation:ld-pop .3s ease}.ld-tile strong{display:block;font-size:24px}.ld-tile.orange{background:#fff0d6;border-color:#efca87}.ld-tile.pink{background:#ffe8e1;border-color:#eebdb1}.ld-note{background:#e9f4eb;border-radius:14px;padding:10px 13px;font-size:14px;line-height:1.6}
      .ld-grid{display:grid;grid-template-columns:2.3em repeat(3,1.05em);grid-auto-rows:1.4em;font:800 clamp(25px,3.4vw,38px)/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;justify-content:center;text-align:center;white-space:nowrap}.ld-grid span{min-width:0}.ld-grid .ld-divisor{border-right:3px solid #456d61;text-align:left}.ld-grid .ld-head{border-top:3px solid #456d61}.ld-grid .ld-underline{border-bottom:2px solid #8cb1a1}.ld-grid .ld-focus{color:#d77530;background:#fff0d7;border-radius:7px}.ld-grid .ld-new{color:#157e65;animation:ld-pop .3s ease}.ld-grid .ld-fade{color:#a0b3a6}.ld-grid .ld-dash{text-align:right;padding-right:.2em}
      .ld-question{font-weight:900;font-size:19px;margin:22px 0 8px}.ld-prompt{line-height:1.65;margin:4px 0 10px}.ld-options{display:flex;gap:7px;flex-wrap:wrap}.ld-num{min-width:48px;min-height:50px;border-radius:14px;border:2px solid #cfe1d0;background:#fffdf6;color:#285e53;font-weight:900;font-size:20px}.ld-num:hover{background:#e4f4e5;border-color:#67b18f}.ld-help,.ld-reset{min-height:44px;border:0;border-radius:12px;padding:8px 14px;font-weight:800;background:#e4efdf;color:#315e50}.ld-reset{background:#fff5df;color:#8a5a26}.ld-feedback{min-height:54px;padding:12px 14px;margin-top:12px;border-radius:14px;background:#fff3d9;line-height:1.65;color:#75512b;font-weight:700}.ld-feedback.success{background:#def3e3;color:#267657}.ld-actions{display:flex;gap:9px;margin-top:12px;flex-wrap:wrap}.ld-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@keyframes ld-pop{from{transform:scale(.9);opacity:.3}to{transform:scale(1);opacity:1}}@media(max-width:520px){.ld-board{grid-template-columns:1fr}.ld-paper,.ld-place{padding:14px}.ld-grid{font-size:28px}.ld-num{min-width:45px}}@media(prefers-reduced-motion:reduce){.ld-game *{animation:none!important}}
    `;
    document.head.appendChild(style);
  }
  function renderLongGame(root, onComplete) {
    if (!root || !root.appendChild) throw new TypeError('renderLongGame requires a container element');
    installStyle(); let stage = 0, feedback = '', hint = false;
    function paint() {
      const done = stage === 2;
      const choice = stage === 0 ? 34 : 164;
      const correct = stage === 0 ? 1 : 9;
      const scene = stage === 0 ? `
        <div class="ld-label">先觀察十位</div><h3>344 是多少？</h3>
        <p>可以想成 <b>34 個十</b>，和 <b>4 個一</b>。先把 34 個十分成每份 18 個十。</p>
        <div class="ld-tiles"><div class="ld-tile"><strong>34</strong>個十</div><div class="ld-tile orange"><strong>18</strong>個十／份</div></div>
        <div class="ld-note">每次拿出 18 個十，最多能拿出幾次？商寫在十位，代表幾個十組。</div>` : stage === 1 ? `
        <div class="ld-label">把剩下的十換成一</div><h3>現在輪到個位</h3>
        <p>拿出 <b>18 個十</b>後，剩下 16 個十；換成 160 個一，再加上原本 4 個一。</p>
        <div class="ld-tiles"><div class="ld-tile"><strong>16 個十</strong>＝ 160 個一</div><div class="ld-tile orange"><strong>＋ 4</strong>個一</div><div class="ld-tile pink"><strong>164</strong>個一</div></div>
        <div class="ld-note">164 個一，每份要 18 個一，最多能分幾份？</div>` : `
        <div class="ld-label">完成！一起驗算</div><h3>我們分完了！</h3>
        <div class="ld-tiles"><div class="ld-tile"><strong>19</strong>份</div><div class="ld-tile orange"><strong>2</strong>個剩下</div></div>
        <p><b>18 × 19 ＋ 2 ＝ 344</b></p><div class="ld-note">餘數 2 比除數 18 小，不能再分成完整的一份。試著說說：商裡的 1 為什麼寫在十位？</div>`;
      const grid = `<div class="ld-grid" role="img" aria-label="${stage === 0 ? '344 除以 18，選十位的商' : stage === 1 ? '商的十位是 1，餘下 16 個十再帶下 4 得到 164' : '344 除以 18 等於 19 餘 2'}">
        <span></span><span></span><span class="${stage===0?'ld-focus':'ld-new'}">${stage>=1?'1':'？'}</span><span class="${stage===1?'ld-focus':'ld-new'}">${done?'9':stage===1?'？':''}</span>
        <span class="ld-divisor">18</span><span class="ld-head ${stage===0?'ld-focus':''}">3</span><span class="ld-head ${stage===0?'ld-focus':''}">4</span><span class="ld-head ${stage===1?'ld-focus':''}">4</span>
        ${stage>=1 ? `<span class="ld-dash">−</span><span class="ld-underline">1</span><span class="ld-underline">8</span><span></span><span></span><span>1</span><span>6</span><span class="ld-new">4</span>` : `<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>`}
        ${done ? `<span class="ld-dash">−</span><span class="ld-underline">1</span><span class="ld-underline">6</span><span class="ld-underline">2</span><span></span><span></span><span></span><span class="ld-new">2</span>` : ''}
      </div>`;
      root.innerHTML = `<section class="ld-game" aria-label="除法直式互動遊戲">
        <div class="ld-board"><div class="ld-paper"><div class="ld-label">除法紀錄</div>${grid}</div><div class="ld-place">${scene}</div></div>
        ${!done ? `<div class="ld-question">${stage === 0 ? '第 1 步：34 個十裡，最多有幾份 18 個十？' : '第 2 步：164 裡最多有幾個 18？'}</div><p class="ld-prompt">點一個數字試試看；猜錯也沒關係。</p><div class="ld-options" role="group" aria-label="選擇商的數字">${Array.from({length:10},(_,i)=>`<button class="ld-num" type="button" data-choice="${i}" aria-label="試 ${i}">${i}</button>`).join('')}</div>` : `<div class="ld-question">✨ 完成任務：344 ÷ 18 ＝ 19 餘 2</div>`}
        <div tabindex="-1" class="ld-feedback ${done?'success':''}" role="status" aria-live="polite">${feedback || (done ? '你讓每一步都有了理由！' : '可以先猜一個數字，再用乘法檢查。')}</div>
        <div class="ld-actions">${!done?'<button type="button" class="ld-help" data-action="hint">💡 給我提示</button>':''}<button type="button" class="ld-reset" data-action="reset">↺ 重新探索</button></div></section>`;
      root.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
        const picked = Number(button.dataset.choice), product = picked * 18;
        if (picked === correct) {
          if (stage === 0) { stage = 1; feedback = '答對了！18 × 1＝18；34－18＝16。這個 1 寫在十位，表示 10 組。'; }
          else { stage = 2; feedback = '答對了！18 × 9＝162，164－162＝2。'; if (typeof onComplete === 'function') onComplete(); }
          hint = false;
        } else if (product > choice) feedback = `試 ${picked}：18 × ${picked}＝${product}，超過 ${choice} 了。試小一點。`;
        else feedback = `試 ${picked}：18 × ${picked}＝${product}，還剩 ${choice-product}；剩下的至少還有 18，還能再分一份。`;
        paint();
        const announcement = root.querySelector('.ld-feedback'); if (announcement) announcement.focus();
      }));
      const hintButton = root.querySelector('[data-action="hint"]');
      if (hintButton) hintButton.addEventListener('click', () => { hint = true; feedback = stage === 0 ? '比較 18 × 1 與 18 × 2：哪一個沒有超過 34？' : '先試 18 × 10＝180，再想想 18 × 9 會是多少。'; paint(); });
      root.querySelector('[data-action="reset"]').addEventListener('click', () => {stage=0;feedback='';hint=false;paint();});
    }
    paint();
    return { reset() { stage=0; feedback=''; hint=false; paint(); } };
  }
  window.renderLongGame = renderLongGame;
})();
