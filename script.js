// 存储数据
let participants = [];
let prizes = [];
let winners = [];
let currentPrize = null;
let isSpinning = false;

// 获取DOM元素
const participantInput = document.getElementById('participantInput');
const prizeInput = document.getElementById('prizeInput');
const participantsList = document.getElementById('participantsList');
const prizesList = document.getElementById('prizesList');
const winnersList = document.getElementById('winnersList');
const wheel = document.getElementById('wheel');
const currentPrizeSpan = document.getElementById('currentPrize');
const startLotteryBtn = document.getElementById('startLottery');

// 颜色数组
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#1ABC9C', '#F1C40F'
];

// 添加参与者
document.getElementById('addParticipants').addEventListener('click', () => {
    const newParticipants = participantInput.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name && !participants.includes(name));
    
    participants.push(...newParticipants);
    participantInput.value = '';
    updateParticipantsList();
    updateWheel();
});

// 添加奖品
document.getElementById('addPrize').addEventListener('click', () => {
    const prizeName = prizeInput.value.trim();
    if (prizeName && !prizes.includes(prizeName)) {
        prizes.push(prizeName);
        prizeInput.value = '';
        updatePrizesList();
    }
});

// 更新参与者列表
function updateParticipantsList() {
    participantsList.innerHTML = participants.map(name => `
        <li class="list-group-item">
            ${name}
            <button class="btn btn-danger btn-sm" onclick="removeParticipant('${name}')">删除</button>
        </li>
    `).join('');
}

// 更新奖品列表
function updatePrizesList() {
    prizesList.innerHTML = prizes.map(prize => `
        <li class="list-group-item">
            ${prize}
            <div>
                <button class="btn btn-primary btn-sm me-2" onclick="selectPrize('${prize}')">选择</button>
                <button class="btn btn-danger btn-sm" onclick="removePrize('${prize}')">删除</button>
            </div>
        </li>
    `).join('');
}

// 更新中奖记录
function updateWinnersList() {
    winnersList.innerHTML = winners.map(({prize, winner, time}) => `
        <li class="list-group-item">
            <div>
                <strong>${prize}</strong>: ${winner}
                <br>
                <small class="text-muted">${time}</small>
            </div>
        </li>
    `).join('');
}

// 移除参与者
function removeParticipant(name) {
    participants = participants.filter(p => p !== name);
    updateParticipantsList();
    updateWheel();
}

// 移除奖品
function removePrize(prize) {
    prizes = prizes.filter(p => p !== prize);
    if (currentPrize === prize) {
        currentPrize = null;
        currentPrizeSpan.textContent = '请选择奖品';
    }
    updatePrizesList();
}

// 选择奖品
function selectPrize(prize) {
    currentPrize = prize;
    currentPrizeSpan.textContent = prize;
}

// 更新转盘
function updateWheel() {
    wheel.innerHTML = '';
    const totalParticipants = participants.length;
    if (totalParticipants === 0) return;

    const anglePerSlice = 360 / totalParticipants;
    participants.forEach((name, index) => {
        const slice = document.createElement('div');
        slice.className = 'wheel-item';
        slice.style.transform = `rotate(${index * anglePerSlice}deg)`;
        slice.style.backgroundColor = colors[index % colors.length];
        slice.textContent = name;
        wheel.appendChild(slice);
    });
}

// 开始抽奖
startLotteryBtn.addEventListener('click', () => {
    if (isSpinning || !currentPrize || participants.length === 0) return;
    
    isSpinning = true;
    startLotteryBtn.disabled = true;
    
    // 随机选择获奖者
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];
    
    // 计算旋转角度
    const baseRotation = 1440; // 基础旋转4圈
    const targetRotation = baseRotation + (360 - (winnerIndex * (360 / participants.length)));
    
    // 设置旋转动画
    wheel.style.setProperty('--rotation-angle', `${targetRotation}deg`);
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    
    // 动画结束后处理结果
    setTimeout(() => {
        // 记录中奖信息
        winners.unshift({
            prize: currentPrize,
            winner: winner,
            time: new Date().toLocaleString()
        });
        
        // 更新显示
        updateWinnersList();
        
        // 移除中奖者
        participants = participants.filter(p => p !== winner);
        updateParticipantsList();
        
        // 重置状态
        isSpinning = false;
        startLotteryBtn.disabled = false;
        
        // 延迟更新转盘显示
        setTimeout(updateWheel, 100);
        
        // 显示中奖提示
        alert(`恭喜 ${winner} 获得 ${currentPrize}！`);
    }, 4000);
}); 