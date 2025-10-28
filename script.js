const gameList = document.querySelector(".card");
const score = document.querySelector(".score");
const prevDay = document.querySelector(".prev-day");
const nextDay = document.querySelector(".next-day");
const dateText = document.querySelector(".date-text");

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
  const html = `
       <div class="match">
    <div class="match-status" 
         style="background-color: ${bgColor}">
        ${textStatus}
    </div>
    
    <div class="teams">
        <div class="team">
            <img 
                src="${data.homeTeam.crest}"
                alt="Logo"
            />
            <div class="team-name">${data.homeTeam.shortName}  (<span style="color: #ef4444">${goalHome}</span>)</div>
        </div>
        
        <div class="score-container">
            <div class="score">${scoreText}</div>
        </div>
        
        <div class="team">
            <img
                src="${data.awayTeam.crest}"
                alt="logo"
            />
            <div class="team-name">${data.awayTeam.shortName}  (<span style="color: #ef4444">${goalAway}</span>)</div>
        </div>
    </div>
    
    <div class="meta">
        <div>
            <span style="color: #6366f1;">🏆</span>
            <span>${data.competition.name}</span>
        </div>
        <div>
            <span style="color: #6366f1;">⏰</span>
            <span>${textStatus} <span class="min"></span></span>
        </div>
    </div>
</div>
            `;
  gameList.insertAdjacentHTML("beforeend", html);
};
const clearGames = () => {
  gameList.innerHTML = "";
};

const renderGroupedMatches = function (matchs) {
  const grouped = {};

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
    const leagueHeader = `
       <div class="league-header">
           <img src="${leagueLogo}" alt="${league} Logo" class="league-logo" />
           <h2 style="color: #fff">${league}</h2>
       </div>
    `;

    gameList.insertAdjacentHTML("beforeend", leagueHeader);

    grouped[league].matches.forEach((match) => {
      renderUi(match);
    });
  }
};

let currentDate = new Date();
const getMatchByDate = function () {
  // get date
  const dateFromStr = currentDate.toISOString().split("T")[0];
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateToStr = tomorrow.toISOString().split("T")[0];
  //  display date
  dateText.textContent = currentDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  // get data from api
  fetch(`/api/matches.js?dateFrom=${dateFromStr}&dateTo=${dateToStr}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Error in coonection (${res.status})`);
      return res.json();
    })
    .then((data) => {
      if (!data.matches) throw new Error("No matches found");
      clearGames();
      renderGroupedMatches(data.matches);
    })
    .catch((err) => {
      gameList.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
    });
};
getMatchByDate();

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
