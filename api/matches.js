export default async function handler(req, res) {
  const { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ error: "Missing dateFrom or dateTo" });
  }

  const response = await fetch(
    `https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    {
      headers: {
        "X-Auth-Token": "8f98efd8340543d693a925ecd26673b4",
      },
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
