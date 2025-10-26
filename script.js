const gameList = document.querySelector(".card");
const score = document.querySelector(".score");

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

    matchMinute = `${diffInMinutes}`;
  }

  // ///////////////////////////////////

  const homeGoals = data.score.fullTime.home;
  const awayGoals = data.score.fullTime.away;

  const goalAway = awayGoals ?  awayGoals : "0";
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
      matchMinute = 45
      break;
    case "TIMED":
      textStatus = "Not Started"
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
const getMatch = function () {
  clearGames();
  fetch("/api/matches.js")
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      console.log(data);
      
      data.matches.forEach((games) => {
        console.log(games)
        renderUi(games);
      });
    });
};
getMatch();
setInterval(getMatch, 60000);
