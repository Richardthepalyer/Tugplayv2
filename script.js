// --- Player Data ---
let balance = Number(localStorage.getItem("balance")) || 1200
let streak = Number(localStorage.getItem("streak")) || 0
let lastDaily = Number(localStorage.getItem("lastDaily")) || 0

const balanceEl = document.getElementById("balance")
const dailyPopup = document.getElementById("dailyPopup")
const dailyInfo = document.getElementById("dailyInfo")
const claimDailyBtn = document.getElementById("claimDailyBtn")
const closeDailyBtn = document.getElementById("closeDailyBtn")

function updateBalance(){
  balanceEl.innerText = "Balance: $" + balance.toFixed(2)
  localStorage.setItem("balance",balance)
}

updateBalance()

// --- Game Navigation ---
function showGame(id){
  document.querySelectorAll(".game").forEach(g=>g.classList.add("hidden"))
  document.getElementById(id).classList.remove("hidden")
}

// --- Coin Flip ---
function flipCoin(choice){
  let bet = Number(document.getElementById("coinBet").value)
  if(bet < 1 || bet > balance){ alert("Invalid Bet"); return }

  let result = Math.random() < 0.5 ? "heads":"tails"
  const coin = document.getElementById("coinDisplay")
  coin.innerText = "..."
  
  setTimeout(()=>{
    if(result==="heads"){ coin.innerText="H"; coin.style.color="blue" }
    else{ coin.innerText="T"; coin.style.color="black" }

    if(choice===result){
      balance += bet
      document.getElementById("coinResult").innerText="You won $" + (bet*2)
    } else {
      balance -= bet
      document.getElementById("coinResult").innerText="You lost $" + bet
    }
    updateBalance()
  },1000)
}

// --- Slots ---
const symbols=["🍒","⭐","💎","🍀","7️⃣"]
function spinSlots(){
  let bet = Number(document.getElementById("slotBet").value)
  if(bet <1 || bet > balance){ alert("Invalid Bet"); return }

  let r1 = symbols[Math.floor(Math.random()*symbols.length)]
  let r2 = symbols[Math.floor(Math.random()*symbols.length)]
  let r3 = symbols[Math.floor(Math.random()*symbols.length)]

  document.getElementById("r1").innerText=r1
  document.getElementById("r2").innerText=r2
  document.getElementById("r3").innerText=r3

  let result="Lose"
  if(r1===r2 && r2===r3){ balance += bet*3; result="3 Match! 3x Win!" }
  else if(r1===r2 || r2===r3 || r1===r3){ balance += bet*2; result="2 Match! 2x Win!" }
  else{ balance -= bet }

  document.getElementById("slotResult").innerText=result
  updateBalance()
}

// --- Mines ---
let mines=[], safeClicks=0, mineBet=0, gameActive=false

function startMines(){
  mineBet = Number(document.getElementById("mineBet").value)
  if(mineBet <1 || mineBet > balance){ alert("Invalid Bet"); return }

  mines=[]; safeClicks=0; gameActive=true
  while(mines.length<3){ let m=Math.floor(Math.random()*25); if(!mines.includes(m)) mines.push(m) }

  const grid=document.getElementById("mineGrid")
  grid.innerHTML=""
  for(let i=0;i<25;i++){
    let tile=document.createElement("div")
    tile.className="tile"
    tile.onclick=()=>clickTile(tile,i)
    grid.appendChild(tile)
  }
}

function clickTile(tile,index){
  if(!gameActive) return

  if(mines.includes(index)){
    tile.classList.add("mine")
    balance -= mineBet
    gameActive=false
    document.getElementById("mineResult").innerText="BOOM! You lost."
    updateBalance()
    return
  }

  tile.classList.add("safe")
  safeClicks++
  let multi = Math.pow(1.08,safeClicks)
  document.getElementById("mineResult").innerText="Multiplier: x"+multi.toFixed(2)
}

function cashOut(){
  if(!gameActive) return
  let multi=Math.pow(1.08,safeClicks)
  let win=mineBet*multi
  balance += win
  document.getElementById("mineResult").innerText="Cashed out $" + win.toFixed(2)
  gameActive=false
  updateBalance()
}

// --- Daily Reward ---
function updateDailyInfo(){
  const now = Date.now()
  let diff = 86400000 - (now - lastDaily)
  if(diff <0) diff=0
  let hours = Math.floor(diff/3600000)
  let mins = Math.floor((diff%3600000)/60000)
  let secs = Math.floor((diff%60000)/1000)
  dailyInfo.innerText = `Streak: ${streak}\nNext reward in: ${hours}h ${mins}m ${secs}s\nReward: $${1200 + streak*600}`
}

document.getElementById("dailyBtn").onclick = ()=>{
  updateDailyInfo()
  dailyPopup.classList.remove("hidden")
}

claimDailyBtn.onclick = ()=>{
  const now = Date.now()
  if(now - lastDaily < 86400000){ alert("Come back later!"); return }
  streak++
  let reward = 1200 + streak*600
  balance += reward
  lastDaily = now
  localStorage.setItem("streak",streak)
  localStorage.setItem("lastDaily",lastDaily)
  updateBalance()
  updateDailyInfo()
  alert("Daily Reward: $" + reward)
}

closeDailyBtn.onclick = ()=>{
  dailyPopup.classList.add("hidden")
}

setInterval(()=>{ if(!dailyPopup.classList.contains("hidden")) updateDailyInfo() },1000)

// --- Admin ---
document.getElementById("adminBtn").onclick=openAdmin
document.getElementById("logo").ondblclick=openAdmin

function openAdmin(){
  let pin = prompt("Enter Admin PIN")
  if(pin==="0721"){ document.getElementById("adminPanel").classList.remove("hidden") }
  else{ alert("Access Denied") }
}

function closeAdmin(){ document.getElementById("adminPanel").classList.add("hidden") }

function addMoney(){ let amt=Number(document.getElementById("adminAmount").value); balance+=amt; updateBalance() }
function setMoney(){ let amt=Number(document.getElementById("adminAmount").value); balance=amt; updateBalance() }
function removeMoney(){ let amt=Number(document.getElementById("adminAmount").value); balance-=amt; updateBalance() }
