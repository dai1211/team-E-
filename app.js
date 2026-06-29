const groups = [
  {
    id: "after-school",
    name: "放課後メンバー",
    slot: "17:30 - 19:00",
    fill: 68,
    members: [
      { name: "みお", status: "空き", detail: "図書館で勉強している", nearby: true },
      { name: "ゆう", status: "部活後", detail: "18時ごろ合流できる", nearby: false },
      { name: "はる", status: "移動中", detail: "駅前に向かっている", nearby: true },
      { name: "りく", status: "塾まで", detail: "19時以降なら参加できる", nearby: false },
    ],
    schedule: [
      { name: "カフェで勉強会", time: "17:30 - 18:30", badge: "空きあり" },
      { name: "コンビニ集合", time: "18:30 - 18:45", badge: "近くにいる" },
      { name: "駅前で待ち合わせ", time: "18:45 - 19:00", badge: "調整中" },
    ],
    chat: [
      { author: "みお", time: "16:40", body: "今日は18時ならいけそう。" },
      { author: "ゆう", time: "16:42", body: "部活終わったら連絡するね。" },
      { author: "はる", time: "16:45", body: "駅に着いたら位置共有する。" },
    ],
    locations: [
      { name: "みお", place: "図書館", distance: "120m" },
      { name: "はる", place: "駅前ロータリー", distance: "350m" },
      { name: "ゆう", place: "体育館", distance: "1.2km" },
    ],
  },
  {
    id: "weekend",
    name: "週末の集まり",
    slot: "14:00 - 16:30",
    fill: 82,
    members: [
      { name: "なつ", status: "空き", detail: "家で予定調整中", nearby: true },
      { name: "そら", status: "買い物", detail: "15時前には戻れる", nearby: true },
      { name: "りん", status: "家族と外出", detail: "夕方に合流可能", nearby: false },
    ],
    schedule: [
      { name: "映画館集合", time: "14:00 - 16:00", badge: "人気" },
      { name: "ランチ", time: "12:30 - 13:30", badge: "相談中" },
      { name: "公園で休憩", time: "16:00 - 16:30", badge: "確定" },
    ],
    chat: [
      { author: "なつ", time: "09:10", body: "映画は午後がいいかも。" },
      { author: "そら", time: "09:25", body: "ランチ先も決めておこう。" },
    ],
    locations: [
      { name: "なつ", place: "自宅", distance: "0m" },
      { name: "そら", place: "ショッピングモール", distance: "800m" },
      { name: "りん", place: "駅ビル", distance: "2.1km" },
    ],
  },
];

const state = {
  activeGroupId: groups[0].id,
  locationSharing: true,
  loggedIn: false,
};

const groupTabs = document.querySelector("#groupTabs");
const scheduleList = document.querySelector("#scheduleList");
const calendarStrip = document.querySelector("#calendarStrip");
const friendList = document.querySelector("#friendList");
const chatThread = document.querySelector("#chatThread");
const locationList = document.querySelector("#locationList");
const memberCount = document.querySelector("#memberCount");
const summarySlot = document.querySelector("#summarySlot");
const calendarSlot = document.querySelector("#calendarSlot");
const summaryGroup = document.querySelector("#summaryGroup");
const summaryNearby = document.querySelector("#summaryNearby");
const activeGroupPill = document.querySelector("#activeGroupPill");
const availabilityFill = document.querySelector("#availabilityFill");
const locationToggle = document.querySelector("#locationToggle");
const locationStatus = document.querySelector("#locationStatus");
const scheduleForm = document.querySelector("#scheduleForm");
const scheduleNameInput = document.querySelector("#scheduleName");
const scheduleTimeInput = document.querySelector("#scheduleTime");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const loginScreen = document.querySelector("#loginScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const callButton = document.querySelector("#callButton");
const quickCallButton = document.querySelector("#quickCallButton");
const shareScheduleButton = document.querySelector("#shareScheduleButton");
const createGroupButton = document.querySelector("#createGroupButton");
const openChatAction = document.querySelector("#openChatAction");

const scheduleTemplate = document.querySelector("#scheduleItemTemplate");
const calendarDayTemplate = document.querySelector("#calendarDayTemplate");
const friendTemplate = document.querySelector("#friendItemTemplate");
const chatTemplate = document.querySelector("#chatMessageTemplate");
const locationTemplate = document.querySelector("#locationItemTemplate");

const calendarDays = [
  { label: "月", date: "29", count: "2件の予定" },
  { label: "火", date: "30", count: "1件の予定" },
  { label: "水", date: "1", count: "3件の予定" },
];

function getActiveGroup() {
  return groups.find((group) => group.id === state.activeGroupId) ?? groups[0];
}

function renderGroupTabs() {
  groupTabs.innerHTML = "";

  groups.forEach((group) => {
    const button = document.createElement("button");
    button.className = `group-tab ${group.id === state.activeGroupId ? "active" : ""}`;
    button.type = "button";
    button.textContent = group.name;
    button.addEventListener("click", () => {
      state.activeGroupId = group.id;
      render();
    });
    groupTabs.append(button);
  });
}

function renderSchedule() {
  const group = getActiveGroup();
  scheduleList.innerHTML = "";

  group.schedule.forEach((item) => {
    const node = scheduleTemplate.content.cloneNode(true);
    node.querySelector(".schedule-title").textContent = item.name;
    node.querySelector(".schedule-time").textContent = item.time;
    node.querySelector(".status-badge").textContent = item.badge;
    node.querySelector(".schedule-meta").textContent = `${group.name}で共有中`;
    scheduleList.append(node);
  });

  summarySlot.textContent = group.slot;
  calendarSlot.textContent = group.slot;
  activeGroupPill.textContent = group.name;
  availabilityFill.style.width = `${group.fill}%`;
}

function renderCalendarStrip() {
  const group = getActiveGroup();
  calendarStrip.innerHTML = "";

  calendarDays.forEach((day, index) => {
    const node = calendarDayTemplate.content.cloneNode(true);
    node.querySelector(".calendar-day-label").textContent = `${group.name} / ${day.label}`;
    node.querySelector(".calendar-day-date").textContent = day.date;
    node.querySelector(".calendar-day-count").textContent = day.count;
    if (index === 1) {
      node.querySelector(".calendar-day").style.background = "linear-gradient(180deg, rgba(59, 130, 246, 0.16), rgba(15, 23, 42, 0.5))";
    }
    calendarStrip.append(node);
  });
}

function renderFriends() {
  const group = getActiveGroup();
  friendList.innerHTML = "";
  memberCount.textContent = `${group.members.length}人`;

  group.members.forEach((friend) => {
    const node = friendTemplate.content.cloneNode(true);
    node.querySelector(".friend-avatar").textContent = friend.name.slice(0, 1);
    node.querySelector(".friend-name").textContent = friend.name;
    node.querySelector(".friend-meta").textContent = `${friend.status} / ${friend.detail}`;

    const toggle = node.querySelector(".friend-toggle");
    toggle.textContent = friend.nearby ? "通話可" : "未接続";
    toggle.classList.toggle("primary-button", friend.nearby);
    toggle.classList.toggle("mini-button", !friend.nearby);
    friendList.append(node);
  });
}

function renderChat() {
  const group = getActiveGroup();
  chatThread.innerHTML = "";

  group.chat.forEach((message) => {
    const node = chatTemplate.content.cloneNode(true);
    node.querySelector(".message-author").textContent = message.author;
    node.querySelector(".message-time").textContent = message.time;
    node.querySelector(".message-body").textContent = message.body;
    chatThread.append(node);
  });
}

function renderLocations() {
  const group = getActiveGroup();
  locationList.innerHTML = "";

  if (!state.locationSharing) {
    locationStatus.textContent = "非公開";
    locationList.innerHTML = '<p class="muted">位置情報共有をオンにすると、近くにいる友達が見えます。</p>';
    return;
  }

  locationStatus.textContent = "共有中";

  group.locations.forEach((location) => {
    const node = locationTemplate.content.cloneNode(true);
    node.querySelector(".location-name").textContent = location.name;
    node.querySelector(".location-place").textContent = location.place;
    node.querySelector(".location-distance").textContent = location.distance;
    locationList.append(node);
  });

  const nearbyCount = group.locations.filter((location) => location.distance !== "2.1km").length;
  summaryNearby.textContent = `${nearbyCount}人`;
}

function render() {
  const group = getActiveGroup();
  summaryGroup.textContent = group.name;
  locationToggle.checked = state.locationSharing;
  renderCalendarStrip();
  renderGroupTabs();
  renderSchedule();
  renderFriends();
  renderChat();
  renderLocations();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    return;
  }

  state.loggedIn = true;
  loginScreen.style.display = "none";
  appShell.classList.remove("is-hidden");
  addChatMessage("システム", `ようこそ、${email} さん。ログインしました。`);
});

function addChatMessage(author, body) {
  const group = getActiveGroup();
  const now = new Date();
  const time = now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  group.chat.push({ author, time, body });
  renderChat();
  chatThread.scrollTop = chatThread.scrollHeight;
}

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const group = getActiveGroup();
  const name = scheduleNameInput.value.trim();
  const time = scheduleTimeInput.value.trim();

  if (!name || !time) {
    return;
  }

  group.schedule.unshift({ name, time, badge: "追加済み" });
  scheduleNameInput.value = "";
  scheduleTimeInput.value = "";
  renderSchedule();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  addChatMessage("あなた", message);
  chatInput.value = "";
});

locationToggle.addEventListener("change", () => {
  state.locationSharing = locationToggle.checked;
  renderLocations();
});

callButton.addEventListener("click", () => {
  addChatMessage("システム", "通話を開始しました。予定の最終確認をしてください。");
});

quickCallButton.addEventListener("click", () => {
  addChatMessage("システム", "ワンタップ通話を起動しました。" );
});

shareScheduleButton.addEventListener("click", () => {
  const group = getActiveGroup();
  addChatMessage("システム", `${group.name} に最新の予定を共有しました。`);
});

createGroupButton.addEventListener("click", () => {
  const name = window.prompt("新しいグループ名を入力してください", "新しいグループ");
  if (!name) {
    return;
  }

  const newGroup = {
    id: `group-${Date.now()}`,
    name,
    slot: "17:00 - 18:30",
    fill: 54,
    members: [
      { name: "あなた", status: "作成直後", detail: "予定を追加してください", nearby: true },
    ],
    schedule: [
      { name: "予定を追加して共有", time: "未設定", badge: "新規" },
    ],
    chat: [
      { author: "システム", time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }), body: "グループを作成しました。" },
    ],
    locations: [
      { name: "あなた", place: "現在地を共有してください", distance: "0m" },
    ],
  };

  groups.unshift(newGroup);
  state.activeGroupId = newGroup.id;
  render();
});

openChatAction.addEventListener("click", () => {
  chatInput.focus();
});

render();
