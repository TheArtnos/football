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
  // /////////////////////////////
  // ${data.score.fullTime.home} - ${data.score.fullTime.away}
  const homeGoals = data.score.fullTime.home;
  const awayGoals = data.score.fullTime.away;

  const scoreText =
    homeGoals === null || awayGoals === null
      ? date
      : `${data.score.fullTime.home} - ${data.score.fullTime.away}`;

  /////////////////////////////////
  const html = `
        <div class="match">
          <div class="teams">
            <div class="team">
              <img
                src="${data.homeTeam.crest}"
                alt="Logo"
              />
              <div class="team-name">${data.homeTeam.shortName}</div>
            </div>
            <div class="score">${scoreText}</div>
            <div class="team">
              <img
                src="${data.awayTeam.crest}"
                alt="logo"
              />
              <div class="team-name">${data.awayTeam.shortName}</div>
            </div>
          </div>
          <div class="meta">
            <div>⏰ ${date}</div>
            <div>Status: ${data.status}</div>
            <div>League: ${data.competition.name}</div>
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
  fetch("/api/matches")
    .then((res) => res.json())
    .then((data) => {
      data.matches.forEach((games) => {
        renderUi(games);
      });
    });
};
getMatch();
setInterval(getMatch, 60000);
