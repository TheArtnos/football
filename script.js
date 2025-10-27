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
  const now = new Date();

  // /////////////////////////////
  let matchMinute = "";
  if (data.status === "IN_PLAY") {
    const diffInMs = now - localDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);

    matchMinute = `${diffInMinutes}'`;
  }

  // ///////////////////////////////////

  const homeGoals = data.score.fullTime.home;
  const awayGoals = data.score.fullTime.away;

  const goalAway = awayGoals ? awayGoals : "0";
  const goalHome = homeGoals ? homeGoals : "0";
  const scoreText =
    homeGoals === null || awayGoals === null
      ? date
      : `${data.score.fullTime.home} - ${data.score.fullTime.away}`;

  const statusGame = data.status;

  let textStatus;
  switch (statusGame) {
    case "IN_PLAY":
      textStatus = "Live";
      break;
    case "PAUSED":
      textStatus = "HT"; // Half Time
      break;
    case "TIMED":
      textStatus = "Not Started";
      break;
    case "FINISHED":
      textStatus = "FT"; // Full Time
      break;
    default:
      textStatus = "Unknown";
  }

  /////////////////////////////////
  const html = `
       <div class="match">
    <div class="match-status" 
         style="background-color: #ef4444; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);">
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
            <span>${textStatus} <span class="min">${matchMinute}</span></span>
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
    const leagueHeader = `
       <h2 style="color: #fff"> ${league}</h2>

    `;
    console.log(leagueHeader);

    // gameList.insertAdjacentHTML("beforeend", leagueHeader);

    grouped[league].forEach((match) => {
      renderUi(match);
    });
  }
};

let currentDate = new Date();
const today = new Date();
const getMatchByDate = function () {
  // get date
  const dateFromStr = currentDate.toISOString().split("T")[0];
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateToStr = tomorrow.toISOString().split("T")[0];
  //  display date
  dateText.textContent = dateFromStr;
  // get data from api

  fetch(`/api/matches.js?dateFrom=${dateFromStr}&dateTo=${dateToStr}`)
    .then((res) => res.json())
   .then((data) => {
      console.log(data.matches);

      clearGames();
      renderGroupedMatches(data.matches);
    });
};
getMatchByDate();
nextDay.disabled = true;

prevDay.addEventListener("click", function () {
  currentDate.setDate(currentDate.getDate() - 1);
  clearGames();
  getMatchByDate();
  nextDay.disabled = false;
});

nextDay.addEventListener("click", function () {
  const tempDate = new Date(currentDate);
  tempDate.setDate(tempDate.getDate() + 1);

  if (tempDate <= today) {
    currentDate = tempDate;
    getMatchByDate();
    clearGames();
  }
  if (currentDate.toDateString() === today.toDateString())
    nextDay.disabled = true;
});
