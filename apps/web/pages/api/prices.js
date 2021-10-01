import fetch from "node-fetch";

const api = async (_req, res) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/collections/${process.env.NEXT_PUBLIC_LOOT_CONTRACT}/listing-infos`
  );
  const json = await response.json();

  res.status(200).json(json);
};

export default api;
