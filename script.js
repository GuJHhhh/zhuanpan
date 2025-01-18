// 全局变量

let participants = [];

let prizes = [];

let winners = [];

let isSpinning = false;

let canvas, ctx;

let selectedPrizeIndex = -1; // 添加选中奖项的索引

// 音频相关变量
let spinningSound = new Audio('sounds/spinning.mp3');
let winSound = new Audio('sounds/win.mp3');
let bgMusic = new Audio('sounds/bgm.mp3');

// 设置音频循环播放
spinningSound.loop = true;
bgMusic.loop = true;
bgMusic.volume = 0.25; // 背景音乐音量设为25%

// 页面加载完成后初始化

window.onload = function() {

    canvas = document.getElementById('wheelCanvas');

    ctx = canvas.getContext('2d');

    

    // 设置canvas尺寸

    canvas.width = 500;

    canvas.height = 500;

    

    // 初始化转盘

    drawWheel();

    // 初始化当前奖项显示

    updateCurrentPrize();

    

    // 设置背景音乐循环时只播放前18秒

    bgMusic.addEventListener('timeupdate', function() {

        if (this.currentTime >= 18) {

            this.currentTime = 0;

        }

    });

    

    // 播放背景音乐

    bgMusic.play().catch(error => {

        console.log('自动播放被阻止，需要用户交互才能播放音乐');

    });

    

    // 添加点击事件监听器来启动背景音乐

    document.addEventListener('click', function() {

        if (bgMusic.paused) {

            bgMusic.play();

        }

    }, { once: true });

};



// 添加参与者

function addParticipant() {

    const input = document.getElementById('participantInput');

    const name = input.value.trim();

    

    if (name && !participants.includes(name)) {

        participants.push(name);

        // 随机打乱参与者顺序

        shuffleArray(participants);

        updateParticipantsList();

        drawWheel();

        input.value = '';

    }

}



// 添加奖项

function addPrize() {

    const nameInput = document.getElementById('prizeInput');

    const countInput = document.getElementById('prizeCount');

    const name = nameInput.value.trim();

    const count = parseInt(countInput.value);

    

    if (name && count > 0) {

        prizes.push({ name, count });

        nameInput.value = '';

        countInput.value = '1';

        updateCurrentPrize();

        updatePrizesList();

    }

}



// 更新参与者列表显示

function updateParticipantsList() {

    const list = document.getElementById('participantsList');

    list.innerHTML = '';

    

    participants.forEach(name => {

        const div = document.createElement('div');

        div.textContent = name;

        list.appendChild(div);

    });

}



// 更新中奖记录

function updateWinnersList() {

    const list = document.getElementById('winnersList');

    list.innerHTML = '';

    

    winners.forEach(winner => {

        const div = document.createElement('div');

        

        const timeSpan = document.createElement('span');

        timeSpan.textContent = winner.time;

        timeSpan.className = 'winner-time';

        

        const nameSpan = document.createElement('span');

        nameSpan.textContent = winner.name;

        nameSpan.className = 'winner-name';

        

        const prizeSpan = document.createElement('span');

        prizeSpan.textContent = winner.prize;

        prizeSpan.className = 'winner-prize';

        

        div.appendChild(timeSpan);

        div.appendChild(nameSpan);

        div.appendChild(prizeSpan);

        list.appendChild(div);

    });

}



// 切换参与者列表显示/隐藏

function toggleList() {

    const list = document.getElementById('participantsList');

    list.classList.toggle('collapsed');

}



// 清空参与者列表

function clearParticipants() {

    if (confirm('确定要清空所有参与者吗？')) {

        participants = [];

        updateParticipantsList();

        drawWheel();

    }

}



// 绘制转盘

function drawWheel(customParticipants) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    

    const currentParticipants = customParticipants || participants;

    

    if (currentParticipants.length === 0) {

        drawEmptyWheel();

        return;

    }

    

    const centerX = canvas.width / 2;

    const centerY = canvas.height / 2;

    const radius = Math.min(centerX, centerY) - 10;

    

    const sliceAngle = (2 * Math.PI) / currentParticipants.length;

    

    currentParticipants.forEach((name, index) => {

        // 计算扇形的起始和结束角度

        const startAngle = index * sliceAngle;

        const endAngle = startAngle + sliceAngle;

        

        // 绘制扇形

        ctx.beginPath();

        ctx.moveTo(centerX, centerY);

        ctx.arc(centerX, centerY, radius, startAngle, endAngle);

        ctx.closePath();

        

        // 设置随机颜色

        ctx.fillStyle = getRandomColor(index);

        ctx.fill();

        ctx.strokeStyle = '#fff';

        ctx.stroke();

        

        // 绘制文字

        ctx.save();

        ctx.translate(centerX, centerY);

        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = 'right';

        ctx.fillStyle = '#fff';

        ctx.font = '14px Microsoft YaHei';

        ctx.fillText(name, radius - 20, 5);

        ctx.restore();

    });

}



// 绘制空转盘

function drawEmptyWheel() {

    const centerX = canvas.width / 2;

    const centerY = canvas.height / 2;

    const radius = Math.min(centerX, centerY) - 10;

    

    ctx.beginPath();

    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

    ctx.fillStyle = '#ddd';

    ctx.fill();

    ctx.strokeStyle = '#fff';

    ctx.stroke();

    

    ctx.fillStyle = '#666';

    ctx.font = '20px Microsoft YaHei';

    ctx.textAlign = 'center';

    ctx.fillText('请添加参与者', centerX, centerY);

}



// 获取随机颜色

function getRandomColor(index) {

    const colors = [

        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',

        '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',

        '#E67E22', '#1ABC9C', '#F1C40F', '#2ECC71'

    ];

    return colors[index % colors.length];

}



// 开始抽奖

function startSpin() {

    if (isSpinning) return;

    

    if (participants.length === 0) {

        alert('请先添加参与者！');

        return;

    }

    

    if (prizes.length === 0) {

        alert('请先添加奖项！');

        return;

    }

    

    isSpinning = true;

    const spinButton = document.getElementById('spinButton');

    spinButton.disabled = true;

    

    // 播放转动音效

    spinningSound.currentTime = Math.max(0, spinningSound.duration - 10);

    spinningSound.volume = 0.7; // 转盘声音设为70%

    spinningSound.play();

    

    // 在开始旋转时保存当前参与者顺序

    const currentParticipants = [...participants];

    

    // 随机旋转圈数和角度

    const initialAngle = Math.random() * 360;

    const totalSpins = 10 + Math.random() * 5;

    const targetAngle = Math.random() * 360;

    const duration = 10000; // 10秒的转动时间

    const startTime = performance.now();

    

    function animate(currentTime) {

        const elapsed = currentTime - startTime;

        const progress = Math.min(elapsed / duration, 1);

        

        // 使用缓动函数使旋转逐渐减速

        const easeOut = 1 - Math.pow(1 - progress, 5);

        const currentRotation = initialAngle + (totalSpins * 360 + targetAngle) * easeOut;

        

        // 旋转画布并重绘

        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);

        ctx.rotate((currentRotation * Math.PI) / 180);

        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        drawWheel(currentParticipants);

        ctx.restore();

        

        if (progress < 1) {

            requestAnimationFrame(animate);

        } else {

            // 动画结束，处理中奖

            handleWinner(currentRotation);

            isSpinning = false;

            spinButton.disabled = false;

        }

    }

    

    requestAnimationFrame(animate);

}



// 处理中奖者

function handleWinner(angle) {

    // 停止转动音效

    spinningSound.pause();

    

    // 播放中奖音效两遍

    winSound.currentTime = 0;

    winSound.volume = 1.0; // 中奖声音设为100%

    

    // 第一遍播放

    winSound.play();

    

    // 监听第一遍播放结束，然后播放第二遍

    winSound.addEventListener('ended', function playAgain() {

        winSound.currentTime = 0;

        winSound.play();

        // 移除监听器，这样只会播放两遍

        winSound.removeEventListener('ended', playAgain);

    }, { once: true });

    

    const sliceAngle = 360 / participants.length;

    const adjustedAngle = (360 - (angle % 360)) % 360;

    const winnerIndex = Math.floor(adjustedAngle / sliceAngle);

    const winner = participants[winnerIndex];

    

    let currentPrize;

    if (selectedPrizeIndex >= 0 && selectedPrizeIndex < prizes.length) {

        currentPrize = prizes[selectedPrizeIndex];

    } else {

        currentPrize = prizes[0];

    }

    

    currentPrize.count--;

    if (currentPrize.count <= 0) {

        if (selectedPrizeIndex >= 0) {

            prizes.splice(selectedPrizeIndex, 1);

            selectedPrizeIndex = -1;

        } else {

            prizes.shift();

        }

    }

    

    // 添加到中奖记录

    winners.push({

        name: winner,

        prize: currentPrize.name,

        time: new Date().toLocaleString('zh-CN', {

            hour: '2-digit',

            minute: '2-digit',

            second: '2-digit',

            hour12: false

        })

    });

    

    // 从参与者列表中移除

    participants.splice(winnerIndex, 1);

    

    // 更新显示

    updateWinnersList();

    updateParticipantsList();

    updatePrizesList();

    updateCurrentPrize();

    drawWheel();

    

    // 显示中奖提示

    showWinnerModal(winner, currentPrize.name);

}



// 批量添加参与者

function addBatchParticipants() {

    const textarea = document.getElementById('batchParticipantInput');

    const names = textarea.value.trim().split('\n');

    

    names.forEach(name => {

        name = name.trim();

        if (name && !participants.includes(name)) {

            participants.push(name);

        }

    });

    

    // 随机打乱参与者顺序

    shuffleArray(participants);

    updateParticipantsList();

    drawWheel();

    textarea.value = '';

}



// Fisher-Yates 洗牌算法

function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }

}



// 更新当前奖项显示

function updateCurrentPrize() {

    const currentPrizeDiv = document.getElementById('currentPrize');

    const spinButton = document.getElementById('spinButton');

    

    if (prizes.length === 0) {

        currentPrizeDiv.textContent = '暂无奖项';

        spinButton.disabled = true;

        return;

    }

    

    const currentPrize = selectedPrizeIndex >= 0 ? prizes[selectedPrizeIndex] : prizes[0];

    currentPrizeDiv.textContent = `${currentPrize.name}（剩余${currentPrize.count}个）`;

    spinButton.disabled = false;

}



// 更新奖项列表显示

function updatePrizesList() {

    const list = document.getElementById('prizesList');

    list.innerHTML = '';

    

    prizes.forEach((prize, index) => {

        const div = document.createElement('div');

        div.className = 'prize-item';

        

        const leftContent = document.createElement('div');

        leftContent.className = 'prize-item-left';

        

        const radio = document.createElement('input');

        radio.type = 'radio';

        radio.name = 'selectedPrize';

        radio.value = index;

        radio.checked = index === selectedPrizeIndex;

        radio.onchange = () => {

            selectedPrizeIndex = index;

            updateCurrentPrize();

        };

        

        const prizeInfo = document.createElement('span');

        prizeInfo.textContent = `${prize.name}（${prize.count}个）`;

        

        leftContent.appendChild(radio);

        leftContent.appendChild(prizeInfo);

        

        const deleteBtn = document.createElement('button');

        deleteBtn.textContent = '删除';

        deleteBtn.className = 'delete-btn';

        deleteBtn.onclick = () => deletePrize(index);

        

        div.appendChild(leftContent);

        div.appendChild(deleteBtn);

        list.appendChild(div);

    });

}



// 删除奖项

function deletePrize(index) {

    if (confirm('确定要删除这个奖项吗？')) {

        prizes.splice(index, 1);

        if (selectedPrizeIndex === index) {

            selectedPrizeIndex = -1;

        } else if (selectedPrizeIndex > index) {

            selectedPrizeIndex--;

        }

        updatePrizesList();

        updateCurrentPrize();

    }

}



// 清空奖项列表

function clearPrizes() {

    if (confirm('确定要清空所有奖项吗？')) {

        prizes = [];

        selectedPrizeIndex = -1;

        updatePrizesList();

        updateCurrentPrize();

    }

}



// 显示中奖弹窗

function showWinnerModal(winner, prizeName) {

    // 创建弹窗元素

    const overlay = document.createElement('div');

    overlay.className = 'modal-overlay';

    

    const modal = document.createElement('div');

    modal.className = 'modal';

    

    // 添加装饰元素

    const decorations = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    decorations.forEach(position => {

        const decoration = document.createElement('div');

        decoration.className = `modal-decoration ${position}`;

        modal.appendChild(decoration);

    });

    

    // 添加内容

    const header = document.createElement('div');

    header.className = 'modal-header';

    header.textContent = '🎉 恭喜中奖 🎉';

    

    const content = document.createElement('div');

    content.className = 'modal-content';

    content.innerHTML = `恭喜 <strong>${winner}</strong><br>获得 <strong>${prizeName}</strong>`;

    

    const button = document.createElement('button');

    button.className = 'modal-button';

    button.textContent = '确定';

    button.onclick = () => {

        overlay.remove();

        // 移除所有五彩纸屑

        document.querySelectorAll('.confetti').forEach(el => el.remove());

    };

    

    // 组装弹窗

    modal.appendChild(header);

    modal.appendChild(content);

    modal.appendChild(button);

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    

    // 添加五彩纸屑效果

    createConfetti();

}



// 创建五彩纸屑效果

function createConfetti() {

    const colors = ['#ff4d4f', '#cf1322', '#ffd8d6', '#ffa39e', '#fff1f0'];

    for (let i = 0; i < 50; i++) {

        const confetti = document.createElement('div');

        confetti.className = 'confetti';

        confetti.style.cssText = `

            position: fixed;

            left: ${Math.random() * 100}vw;

            top: -20px;

            width: 10px;

            height: 10px;

            background: ${colors[Math.floor(Math.random() * colors.length)]};

            transform: rotate(${Math.random() * 360}deg);

            animation: confetti 1s ${Math.random() * 2}s ease-out forwards;

            z-index: 1001;

        `;

        document.body.appendChild(confetti);

    }

}



// 导出中奖记录

function exportWinners() {

    if (winners.length === 0) {

        alert('暂无中奖记录！');

        return;

    }



    // 创建CSV内容

    let csvContent = '时间,获奖者,奖项\n';

    winners.forEach(winner => {

        csvContent += `${winner.time},${winner.name},${winner.prize}\n`;

    });



    // 创建Blob对象

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);



    // 创建下载链接

    const link = document.createElement('a');

    link.href = url;

    link.download = '中奖记录.csv';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

} 
