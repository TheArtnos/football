const gameList = document.querySelector(".games-list");
const renderUi = function (data) {
  const utcData = data.utcDate;
  const localDate = new Date(utcData);
  const options = {
    month: "numeric", // Oct
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Intl.DateTimeFormat("en-us", options).format(localDate);
  const html = `
  <div class="game">
    <div class="teams">
      <div class="team">
        <img src="${data.homeTeam.crest}" alt="${data.homeTeam.name} logo" />
        <div class="name">${data.homeTeam.name}</div>
      </div>
      <div class="vs">vs</div>
      <div class="team">
        <img src="${data.awayTeam.crest}" alt="${data.awayTeam.name} logo" />
        <div class="name">${data.awayTeam.shortName}</div>
      </div>
    </div>
    <div class="meta">
      <div class="time">${date}</div>
      <div class="status">${data.status}</div>
      <div class="league">League: ${data.area.name}</div>
    </div>
  </div>
            `;
  gameList.insertAdjacentHTML("beforeend", html);
};

const getMatch = function () {
  fetch("/api/matches")
    .then((res) => res.json())
    .then((data) => {
      data.matches.forEach((games) => {
        renderUi(games);
      });
    });
};
getMatch();
