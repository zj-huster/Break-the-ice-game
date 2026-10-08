const topics = [
  { title: "名字的故事", short: "名字故事", icon: "✎", color: "#f06f55", lead: "每个名字都是一张小小的名片。说说它从哪里来，又承载了什么。", prompts: ["谁为你取了这个名字？", "它有没有特别的含义或故事？", "朋友通常怎么称呼你？"] },
  { title: "我的家乡", short: "我的家乡", icon: "⌂", color: "#f5c451", lead: "带大家去你的家乡云旅行，用一种味道、一处风景或一句方言介绍它。", prompts: ["你的家乡在哪里？", "最想带大家去哪个地方？", "一定要尝的家乡味道是什么？"] },
  { title: "最近的小确幸", short: "小确幸", icon: "☀", color: "#86c7d1", lead: "生活中的好心情，常常藏在不起眼的小事里。分享一件最近让你开心的事。", prompts: ["它发生在什么时候？", "哪个瞬间让你觉得很美好？", "你有把这份开心告诉谁吗？"] },
  { title: "我的隐藏技能", short: "隐藏技能", icon: "✦", color: "#84b887", lead: "是时候亮出一项不为人知的本领了，实用、冷门或有趣都可以。", prompts: ["你擅长但很少提起什么？", "这项技能是怎么学会的？", "现场可以小小展示一下吗？"] },
  { title: "最爱的食物", short: "最爱食物", icon: "♨", color: "#f5a45d", lead: "一道念念不忘的食物，往往也连着一段记忆。今天你的菜单上是什么？", prompts: ["它是什么味道？", "在哪里能吃到最好吃的？", "它让你想起了谁或哪段时光？"] },
  { title: "兴趣爱好", short: "兴趣爱好", icon: "♪", color: "#b39bd1", lead: "工作学习之外，什么事情最容易让你忘记时间？", prompts: ["最近最投入的爱好是什么？", "你为什么开始喜欢它？", "给新手一个入门建议吧。"] },
  { title: "旅行愿望", short: "旅行愿望", icon: "↗", color: "#65b7a1", lead: "如果明天就能出发，你最想把目的地设在哪里？", prompts: ["你最想去哪里？", "到达后第一件事想做什么？", "会邀请谁和你同行？"] },
  { title: "童年梦想", short: "童年梦想", icon: "☁", color: "#82a9d7", lead: "回到小时候，你曾经认真地想成为谁？现在的你还留着那颗种子吗？", prompts: ["小时候想成为什么？", "这个梦想因为什么出现？", "它和现在的你还有联系吗？"] },
  { title: "工作与学习", short: "工作学习", icon: "▣", color: "#e98aa6", lead: "用不带职位和专业术语的方式，说说你最近在投入什么、探索什么。", prompts: ["你现在主要在做什么？", "最近解决了什么小难题？", "哪部分最让你有成就感？"] },
  { title: "三个关键词", short: "三个关键词", icon: "#", color: "#e19a55", lead: "如果只能用三个词描述自己，你会选择哪三个？", prompts: ["你的三个关键词是什么？", "哪一个最容易被朋友认同？", "哪一个需要相处后才会发现？"] },
  { title: "作品推荐", short: "作品推荐", icon: "▶", color: "#d58472", lead: "推荐一部你喜欢的书、电影、音乐或游戏，让大家借它多认识你一点。", prompts: ["你想推荐什么作品？", "它最打动你的地方是什么？", "最适合在什么心情下体验？"] },
  { title: "我的超能力", short: "我的超能力", icon: "⚡", color: "#9a9ccc", lead: "可以选择一种超能力，你会选什么？答案里也许藏着你最在意的事情。", prompts: ["你想拥有哪种超能力？", "会先用它做什么？", "它会给生活带来什么变化？"] }
];

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const wheelWrap = document.getElementById("wheelWrap");
const wheelLabelLayer = document.getElementById("wheelLabelLayer");
const spinButton = document.getElementById("spinButton");
const wheelView = document.getElementById("wheelView");
const topicView = document.getElementById("topicView");
const rosterView = document.getElementById("rosterView");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const historyCount = document.getElementById("historyCount");
const rosterDialog = document.getElementById("rosterDialog");
const rosterInput = document.getElementById("rosterInput");
const TAU = Math.PI * 2;
const segment = TAU / topics.length;
let rotation = 0;
let spinState = "idle";
let animationFrame = null;
let lastFrameTime = 0;
let spinSpeed = 0;
let selectedIndex = null;
let drawHistory = JSON.parse(sessionStorage.getItem("intro-wheel-history") || "[]");
let timerId = null;
let timeLeft = 60;
let rosterOrder = loadRoster();
let currentPersonIndex = Number(sessionStorage.getItem("intro-current-person") || 0);
let shuffleTimer = null;

currentPersonIndex = Math.max(0, Math.min(currentPersonIndex, Math.max(0, rosterOrder.length - 1)));

function loadRoster() {
  try {
    const saved = JSON.parse(localStorage.getItem("intro-roster") || "null");
    const previousSessionOrder = JSON.parse(sessionStorage.getItem("intro-roster-order") || "null");
    const savedRoster = Array.isArray(saved) ? parseRoster(saved.join("\n")) : [];
    const sessionRoster = Array.isArray(previousSessionOrder) ? parseRoster(previousSessionOrder.join("\n")) : [];
    const sessionMatchesSaved = savedRoster.length === sessionRoster.length
      && savedRoster.every(name => sessionRoster.includes(name));
    if (sessionMatchesSaved && sessionRoster.length) return sessionRoster;
    if (savedRoster.length) return savedRoster;
    if (sessionRoster.length) return sessionRoster;
  } catch (error) {
    console.warn("无法读取已保存的名单", error);
  }
  return [];
}

function parseRoster(value) {
  const names = String(value).split(/[\n,，、;；]+/).map(name => name.trim()).filter(Boolean);
  return [...new Set(names)].slice(0, 100);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 18;
  ctx.clearRect(0, 0, size, size);

  topics.forEach((topic, index) => {
    const start = -Math.PI / 2 - segment / 2 + index * segment;
    const end = start + segment;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = topic.color;
    ctx.fill();
    ctx.strokeStyle = "#fff8ec";
    ctx.lineWidth = 7;
    ctx.stroke();

  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.strokeStyle = "#20312d";
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, 82, 0, TAU);
  ctx.fillStyle = "#fff8ec";
  ctx.fill();
}

function createWheelLabels() {
  wheelLabelLayer.innerHTML = topics.map((topic, index) => {
    const angle = index * segment - Math.PI / 2;
    const left = 50 + Math.cos(angle) * 35;
    const top = 50 + Math.sin(angle) * 35;
    return `<div class="wheel-label" style="left:${left}%;top:${top}%"><span>${String(index + 1).padStart(2, "0")}</span><strong>${topic.short}</strong></div>`;
  }).join("");
}

function renderRotation(value) {
  rotation = value;
  wheelWrap.style.transform = `rotate(${rotation}deg)`;
  wheelWrap.style.setProperty("--wheel-counter", `${-rotation}deg`);
}

function updateSpinButton(state) {
  const title = spinButton.querySelector("strong");
  const caption = spinButton.querySelector("small");
  const hint = document.getElementById("spinHint");
  if (state === "spinning") {
    title.textContent = "停止";
    caption.textContent = "STOP";
    spinButton.setAttribute("aria-label", "停止话题转盘");
    spinButton.classList.add("is-stop");
    hint.innerHTML = "再次点击停止 · <kbd>Space</kbd>";
  } else if (state === "stopping") {
    title.textContent = "慢下来";
    caption.textContent = "WAIT";
    spinButton.setAttribute("aria-label", "转盘正在减速");
    spinButton.classList.remove("is-stop");
    hint.textContent = "正在选择话题…";
  } else {
    title.textContent = "开始";
    caption.textContent = "SPIN";
    spinButton.setAttribute("aria-label", "开始转动话题转盘");
    spinButton.classList.remove("is-stop");
    hint.innerHTML = "点击一次开始，再点击一次停止 · <kbd>Space</kbd>";
  }
}

function animateContinuous(now) {
  if (spinState !== "spinning") return;
  const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  spinSpeed = Math.min(230, spinSpeed + delta * 190);
  renderRotation(rotation + spinSpeed * delta);
  animationFrame = window.requestAnimationFrame(animateContinuous);
}

function startSpin() {
  if (!rosterOrder.length) {
    openRosterEditor();
    return;
  }
  stopTimer();
  spinState = "spinning";
  document.querySelector(".current-person-badge").classList.add("is-live");
  spinSpeed = 70;
  lastFrameTime = performance.now();
  updateSpinButton("spinning");
  animationFrame = window.requestAnimationFrame(animateContinuous);
}

function saveRoster() {
  sessionStorage.setItem("intro-roster-order", JSON.stringify(rosterOrder));
  sessionStorage.setItem("intro-current-person", String(currentPersonIndex));
}

function renderRoster() {
  const hasRoster = rosterOrder.length > 0;
  document.getElementById("rosterTotal").textContent = `PARTICIPANTS · ${rosterOrder.length}`;
  document.getElementById("shuffleButton").disabled = !hasRoster;
  document.getElementById("startPersonButton").disabled = !hasRoster;
  document.getElementById("skipPersonButton").disabled = !hasRoster || currentPersonIndex >= rosterOrder.length - 1;
  document.getElementById("previousPersonButton").disabled = !hasRoster || currentPersonIndex === 0;
  document.getElementById("previousTopicButton").disabled = !hasRoster || currentPersonIndex === 0;
  document.getElementById("nextButton").disabled = !hasRoster || currentPersonIndex >= rosterOrder.length - 1;
  spinButton.setAttribute("aria-disabled", String(!hasRoster));
  if (!hasRoster) {
    document.querySelectorAll(".currentPersonName").forEach(element => { element.textContent = "等待录入"; });
    document.querySelectorAll(".currentPersonPosition").forEach(element => { element.textContent = "0 人"; });
    document.getElementById("rosterCurrentName").textContent = "等待录入名单";
    document.getElementById("rosterAvatar").textContent = "?";
    document.getElementById("rosterCurrentCount").textContent = "还没有参与人员";
    document.getElementById("rosterList").innerHTML = '<li class="roster-empty"><b>READY?</b><span>添加名单后即可开始</span><small>支持最多 100 人</small></li>';
    return;
  }
  const currentName = rosterOrder[currentPersonIndex];
  document.querySelectorAll(".currentPersonName").forEach(element => { element.textContent = currentName; });
  document.querySelectorAll(".currentPersonPosition").forEach(element => {
    element.textContent = `${String(currentPersonIndex + 1).padStart(2, "0")} / ${rosterOrder.length}`;
  });
  document.getElementById("rosterCurrentName").textContent = currentName;
  document.getElementById("rosterAvatar").textContent = currentName.slice(0, 1);
  document.getElementById("rosterCurrentCount").textContent = `第 ${currentPersonIndex + 1} 位 · 共 ${rosterOrder.length} 位`;
  document.getElementById("rosterList").innerHTML = rosterOrder.map((name, index) => {
    const state = index < currentPersonIndex ? "done" : index === currentPersonIndex ? "current" : "upcoming";
    const label = state === "done" ? "已介绍" : state === "current" ? "当前" : "等待";
    return `<li class="${state}" style="--delay:${index * 42}ms"><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(name)}</span><small>${label}</small></li>`;
  }).join("");
  saveRoster();
}

function updateRosterInputStatus() {
  const names = parseRoster(rosterInput.value);
  const rawCount = String(rosterInput.value).split(/[\n,，、;；]+/).map(name => name.trim()).filter(Boolean).length;
  const duplicateCount = rawCount - names.length;
  document.getElementById("rosterInputStatus").textContent = names.length
    ? `共 ${names.length} 人${duplicateCount ? ` · 已忽略 ${duplicateCount} 个重复项` : ""}`
    : "尚未输入人员";
}

function openRosterEditor() {
  rosterInput.value = rosterOrder.join("\n");
  document.getElementById("rosterError").textContent = "";
  document.getElementById("cancelRosterButton").hidden = rosterOrder.length === 0;
  updateRosterInputStatus();
  rosterDialog.showModal();
  window.setTimeout(() => rosterInput.focus(), 0);
}

function saveRosterInput(event) {
  event.preventDefault();
  const names = parseRoster(rosterInput.value);
  if (!names.length) {
    document.getElementById("rosterError").textContent = "请至少输入一位参与人员。";
    rosterInput.focus();
    return;
  }
  rosterOrder = names;
  currentPersonIndex = 0;
  localStorage.setItem("intro-roster", JSON.stringify(names));
  renderRoster();
  rosterDialog.close();
  showToast(`名单已保存，共 ${names.length} 人`);
}

function showRoster() {
  stopTimer();
  wheelView.classList.add("hidden");
  topicView.classList.remove("active");
  rosterView.classList.add("active");
  renderRoster();
  window.history.replaceState(null, "", "#classmates");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideRoster() {
  rosterView.classList.remove("active");
  topicView.classList.remove("active");
  wheelView.classList.remove("hidden");
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  spinButton.focus({ preventScroll: true });
}

function movePerson(direction) {
  if (!rosterOrder.length) {
    openRosterEditor();
    return false;
  }
  const nextIndex = Math.max(0, Math.min(currentPersonIndex + direction, rosterOrder.length - 1));
  if (nextIndex === currentPersonIndex) {
    showToast(direction > 0 ? "已经是最后一位参与者啦 ✦" : "已经是第一位参与者啦");
    return false;
  }
  currentPersonIndex = nextIndex;
  renderRoster();
  showToast(direction > 0 ? `下一位：${rosterOrder[currentPersonIndex]}` : `返回：${rosterOrder[currentPersonIndex]}`);
  return true;
}

function shuffleRoster() {
  if (shuffleTimer || !rosterOrder.length) return;
  const button = document.getElementById("shuffleButton");
  const board = document.getElementById("rosterBoard");
  button.disabled = true;
  board.classList.add("is-shuffling");
  button.querySelector("strong").textContent = "正在生成顺序…";
  let ticks = 0;
  shuffleTimer = window.setInterval(() => {
    rosterOrder = [...rosterOrder].sort(() => Math.random() - 0.5);
    currentPersonIndex = 0;
    renderRoster();
    ticks += 1;
    if (ticks < 12) return;
    window.clearInterval(shuffleTimer);
    shuffleTimer = null;
    // Fisher–Yates produces the final, unbiased order after the visual shuffle.
    for (let i = rosterOrder.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [rosterOrder[i], rosterOrder[j]] = [rosterOrder[j], rosterOrder[i]];
    }
    renderRoster();
    board.classList.remove("is-shuffling");
    board.classList.add("shuffle-done");
    window.setTimeout(() => board.classList.remove("shuffle-done"), 800);
    button.disabled = false;
    button.querySelector("strong").textContent = "重新随机排序";
    showToast(`顺序已生成，${rosterOrder[0]} 第一位登场！`);
  }, 90);
}

function stopSpin() {
  if (spinState !== "spinning") return;
  spinState = "stopping";
  window.cancelAnimationFrame(animationFrame);
  spinButton.disabled = true;
  updateSpinButton("stopping");

  const startRotation = rotation;
  const startSpeed = spinSpeed;
  const desiredStopSeconds = 2.4;
  const naturalStopDistance = startSpeed * desiredStopSeconds / 2;
  let targetRotation = Math.round((startRotation + naturalStopDistance) / 30) * 30;
  if (targetRotation <= startRotation) targetRotation += 30;
  const stopDistance = targetRotation - startRotation;
  const durationSeconds = 2 * stopDistance / startSpeed;
  const deceleration = startSpeed / durationSeconds;
  const targetStep = ((Math.round(targetRotation / 30) % topics.length) + topics.length) % topics.length;
  selectedIndex = (topics.length - targetStep) % topics.length;
  const startTime = performance.now();

  function decelerate(now) {
    const elapsedSeconds = Math.min((now - startTime) / 1000, durationSeconds);
    const nextRotation = startRotation
      + startSpeed * elapsedSeconds
      - 0.5 * deceleration * elapsedSeconds * elapsedSeconds;
    renderRotation(nextRotation);
    if (elapsedSeconds < durationSeconds) {
      animationFrame = window.requestAnimationFrame(decelerate);
      return;
    }
    renderRotation(targetRotation);
    spinState = "idle";
    document.querySelector(".current-person-badge").classList.remove("is-live");
    spinButton.disabled = false;
    updateSpinButton("idle");
    addHistory(selectedIndex);
    window.setTimeout(() => showTopic(selectedIndex), 450);
  }
  animationFrame = window.requestAnimationFrame(decelerate);
}

function toggleSpin() {
  if (spinState === "idle") startSpin();
  else if (spinState === "spinning") stopSpin();
}

function showTopic(index, updateHash = true) {
  const topic = topics[index];
  selectedIndex = index;
  document.getElementById("topicNumber").textContent = String(index + 1).padStart(2, "0");
  document.getElementById("topicProgress").textContent = `${String(index + 1).padStart(2, "0")} / 12`;
  document.getElementById("topicIcon").textContent = topic.icon;
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("topicLead").textContent = topic.lead;
  document.getElementById("topicCard").style.setProperty("--topic", topic.color);
  document.getElementById("promptList").innerHTML = topic.prompts.map((prompt, i) => `<div class="prompt"><b>0${i + 1}</b><span>${prompt}</span></div>`).join("");
  resetTimer();
  wheelView.classList.add("hidden");
  rosterView.classList.remove("active");
  topicView.classList.add("active");
  if (updateHash) window.history.replaceState(null, "", `#topic-${index + 1}`);
  document.getElementById("topicTitle").focus?.({ preventScroll: true });
}

function showWheel() {
  stopTimer();
  topicView.classList.remove("active");
  rosterView.classList.remove("active");
  wheelView.classList.remove("hidden");
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  window.scrollTo({ top: 0, behavior: "smooth" });
  spinButton.focus({ preventScroll: true });
}

function addHistory(index) {
  drawHistory.unshift({ index, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) });
  drawHistory = drawHistory.slice(0, 12);
  sessionStorage.setItem("intro-wheel-history", JSON.stringify(drawHistory));
  renderHistory();
}

function renderHistory() {
  historyCount.textContent = drawHistory.length;
  emptyHistory.style.display = drawHistory.length ? "none" : "block";
  historyList.innerHTML = drawHistory.map((item, position) => {
    const topic = topics[item.index];
    return `<li><span style="background:${topic.color}55">${topic.icon}</span><strong>${topic.title}</strong><small>${position === 0 ? "刚刚" : item.time}</small></li>`;
  }).join("");
}

function toggleHistory(open) {
  historyPanel.classList.toggle("open", open);
  document.getElementById("panelScrim").classList.toggle("open", open);
  historyPanel.setAttribute("aria-hidden", String(!open));
  document.getElementById("historyButton").setAttribute("aria-expanded", String(open));
  if (open) document.getElementById("closeHistory").focus();
}

function resetTimer() {
  stopTimer();
  timeLeft = 60;
  document.getElementById("timerText").textContent = "60";
  document.getElementById("timerRing").style.strokeDashoffset = "0";
  document.getElementById("timer").classList.remove("visible");
  document.getElementById("timerButton").textContent = "开始 60 秒分享";
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
}

function toggleTimer() {
  const button = document.getElementById("timerButton");
  const timer = document.getElementById("timer");
  timer.classList.add("visible");
  if (timerId) {
    stopTimer();
    button.textContent = "继续计时";
    return;
  }
  if (timeLeft <= 0) resetTimer();
  button.textContent = "暂停计时";
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    document.getElementById("timerText").textContent = timeLeft;
    document.getElementById("timerRing").style.strokeDashoffset = String(138.23 * (1 - timeLeft / 60));
    if (timeLeft <= 0) {
      stopTimer();
      button.textContent = "再来 60 秒";
      showToast("时间到！谢谢你的分享 ✦");
    }
  }, 1000);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

spinButton.addEventListener("click", toggleSpin);
document.getElementById("backButton").addEventListener("click", showWheel);
document.getElementById("nextButton").addEventListener("click", () => {
  movePerson(1);
  showWheel();
});
document.getElementById("previousTopicButton").addEventListener("click", () => {
  movePerson(-1);
  showWheel();
});
document.getElementById("rosterButton").addEventListener("click", showRoster);
document.getElementById("rosterBackButton").addEventListener("click", hideRoster);
document.getElementById("shuffleButton").addEventListener("click", shuffleRoster);
document.getElementById("editRosterButton").addEventListener("click", openRosterEditor);
document.getElementById("rosterForm").addEventListener("submit", saveRosterInput);
document.getElementById("cancelRosterButton").addEventListener("click", () => rosterDialog.close());
document.getElementById("clearRosterInput").addEventListener("click", () => {
  rosterInput.value = "";
  updateRosterInputStatus();
  rosterInput.focus();
});
rosterInput.addEventListener("input", () => {
  document.getElementById("rosterError").textContent = "";
  updateRosterInputStatus();
});
rosterDialog.addEventListener("cancel", event => {
  if (!rosterOrder.length) event.preventDefault();
});
document.getElementById("previousPersonButton").addEventListener("click", () => movePerson(-1));
document.getElementById("skipPersonButton").addEventListener("click", () => movePerson(1));
document.getElementById("startPersonButton").addEventListener("click", hideRoster);
document.getElementById("timerButton").addEventListener("click", toggleTimer);
document.getElementById("historyButton").addEventListener("click", () => toggleHistory(true));
document.getElementById("closeHistory").addEventListener("click", () => toggleHistory(false));
document.getElementById("panelScrim").addEventListener("click", () => toggleHistory(false));
document.getElementById("clearHistory").addEventListener("click", () => {
  drawHistory = [];
  sessionStorage.removeItem("intro-wheel-history");
  renderHistory();
  showToast("抽取记录已清空");
});
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !wheelView.classList.contains("hidden") && !historyPanel.classList.contains("open")) {
    event.preventDefault();
    toggleSpin();
  }
  if (event.key === "Escape") toggleHistory(false);
});

drawWheel();
createWheelLabels();
renderRotation(0);
renderHistory();
renderRoster();
const initialTopic = window.location.hash.match(/^#topic-(\d+)$/);
if (!rosterOrder.length) {
  openRosterEditor();
} else if (initialTopic) {
  const index = Number(initialTopic[1]) - 1;
  if (index >= 0 && index < topics.length) showTopic(index, false);
} else if (window.location.hash === "#classmates") {
  showRoster();
}
