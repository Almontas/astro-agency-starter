export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { urls } = req.body || {};

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty 'urls' array" });
  }

  // Your IndexNow key: generate any 8-64 char hex string, save it as
  // public/<key>.txt containing the key itself, and set it here or via env.
  const key = process.env.INDEXNOW_KEY;
  const host = process.env.SITE_HOST || "example.com";
  if (!key) {
    return res.status(500).json({ error: "INDEXNOW_KEY is not configured" });
  }
  const keyLocation = `https://${host}/${key}.txt`;

  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls,
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        status: response.status,
        submitted: urls.length,
      });
    }

    const text = await response.text();
    return res.status(response.status).json({
      success: false,
      status: response.status,
      message: text,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
