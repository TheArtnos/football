const gameList = document.querySelector(".card");
const score = document.querySelector(".score");
const prevDay = document.querySelector(".prev-day");
const nextDay = document.querySelector(".next-day");
const dateText = document.querySelector(".date-text");

// get data form json
let fa = {};

fetch("./fa.json")
  .then((res) => res.json())
  .then((data) => {
    fa = data;
    getMatchByDate();
  });

const t = (section, key) => fa[section][key] ?? key;

const renderUi = function (data) {
  const utcData = data.utcDate;
  const localDate = new Date(utcData);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Intl.DateTimeFormat("en-us", options).format(localDate);

  const homeGoals = data.score.fullTime.home;
  const awayGoals = data.score.fullTime.away;

  const goalAway = awayGoals ?? "0";
  const goalHome = homeGoals ?? "0";

  const scoreText =
    homeGoals === null || awayGoals === null
      ? date
      : `${data.score.fullTime.home} - ${data.score.fullTime.away}`;

  const statusGame = data.status;

  let textStatus;
  let bgColor;
  switch (statusGame) {
    case "IN_PLAY":
      textStatus = "Live";
      bgColor = "#22c55e";
      break;
    case "PAUSED":
      textStatus = "HT"; // Half Time
      bgColor = "#facc15";
      break;
    case "TIMED":
      bgColor = "#ef4444";
      textStatus = "Not Started";
      break;
    case "FINISHED":
      textStatus = "FullTime";
      bgColor = "#6b7280";
      break;
    default:
      textStatus = "Unknown";
      bgColor = "#9ca3af";
  }

  /////////////////////////////////
  return `
       <div class="match">
    <div class="match-status" 
         style="background-color: ${bgColor}">
        ${t("statuses", data.status)}
    </div>
    
    <div class="teams">
        <div class="team">
            <img 
                src="${data.homeTeam.crest}"
                alt="Logo"
            />
            <div class="team-name">${t(
              "teams",
              data.homeTeam.name
            )}  (<span style="color: #ef4444">${goalHome}</span>)</div>
        </div>
        
        <div class="score-container">
            <div class="score">${scoreText}</div>
        </div>
        
        <div class="team">
            <img
                src="${data.awayTeam.crest}"
                alt="logo"
            />
            <div class="team-name">${t(
              "teams",
              data.awayTeam.name
            )}  (<span style="color: #ef4444">${goalAway}</span>)</div>
        </div>
    </div>
    
    <div class="meta">
        <div>
            <span style="color: #6366f1;">🏆</span>
            <span>${t("competitions", data.competition.name)}</span>
        </div>
        <div>
            <span style="color: #6366f1;">⏰</span>
            <span>${t("statuses", data.status)}</span>
        </div>
    </div>
</div>
            `;
};
const clearGames = () => {
  gameList.innerHTML = "";
};

const renderGroupedMatches = function (matchs) {
  const grouped = {};
  let html = "";

  matchs.forEach((match) => {
    const leagueName = match.competition.name;
    const logo = match.competition.emblem;
    if (!grouped[leagueName]) {
      grouped[leagueName] = {
        logo: logo,
        matches: [],
      };
    }
    grouped[leagueName].matches.push(match);
  });
  for (const league in grouped) {
    const leagueLogo = grouped[league].logo;
    html += `
       <div class="league-header">
           <img src="${leagueLogo}" alt="${league} Logo" class="league-logo" />
           <h2 style="color: #fff">${t("competitions", league)}</h2>
       </div>
    `;

    grouped[league].matches.forEach((match) => {
      html += renderUi(match);
    });
  }
  gameList.innerHTML = html;
};

let currentDate = new Date();
const getMatchByDate = function () {
  // get date
  const dateFromStr = currentDate.toISOString().split("T")[0];
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateToStr = tomorrow.toISOString().split("T")[0];
  //  display date
  dateText.textContent = currentDate.toLocaleDateString("fa-IR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const statusOrder = {
    IN_PLAY: 1,
    PAUSED: 2,
    TIMED: 3,
    FINISHED: 4,
    POSTPONED: 5,
    CANCELLED: 6,
  };

  // get data from api
  fetch(`/api/matches.js?dateFrom=${dateFromStr}&dateTo=${dateToStr}`)
    .then((res) => {
      if (!res.ok) throw new Error(`مشکل در اتصال به سرور (${res.status})`);
      return res.json();
    })
    .then((data) => {
      console.log(data);

      if (!data.matches) throw new Error("No matches found");
      clearGames();
      data.matches.sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 999;
        const orderB = statusOrder[b.status] ?? 999;

        return orderA - orderB;
      });
      if (data.resultSet.count === 0)
        throw new Error("مسابقه ای برای امروز یافت نشد !");
      renderGroupedMatches(data.matches);
    })
    .catch((err) => {
      gameList.innerHTML = `<p class="error"> ${err.message}</p>`;
    });
};

prevDay.addEventListener("click", function () {
  currentDate.setDate(currentDate.getDate() - 1);
  clearGames();
  getMatchByDate();
});

nextDay.addEventListener("click", function () {
  const tempDate = new Date(currentDate);
  tempDate.setDate(tempDate.getDate() + 1);
  currentDate = tempDate;
  clearGames();
  getMatchByDate();
});

window.addEventListener("online", function () {
  document.body.classList.remove("offline");
  document.body.classList.add("online");
  console.log("onilne");

  if (document.body.classList.contains("online")) {
    setTimeout(() => document.body.classList.remove("online"), 3000);
  }
});
window.addEventListener("offline", function () {
  document.body.classList.remove("online");
  document.body.classList.add("offline");
  console.log("offline");
});
