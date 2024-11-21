import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type ResponseData = {
  token: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ token: '', error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ token: '', error: 'userId is required' });
  }

  const appToken = process.env.SUMSUB_APP_TOKEN;
  const secretKey = process.env.SUMSUB_SECRET_KEY;
  const baseUrl = process.env.SUMSUB_BASE_URL;

  if (!appToken || !secretKey || !baseUrl) {
    return res.status(500).json({ token: '', error: 'Missing environment variables' });
  }

  const ts = Math.floor(Date.now() / 1000).toString();
  const requestPath = '/resources/accessTokens';
  const queryParams = `?userId=${encodeURIComponent(userId)}&levelName=Level-hoge&ttlInSecs=600`;

  // Create signature
  const signString = ts + 'POST' + requestPath + queryParams;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');

  try {
    const response = await fetch(`${baseUrl}${requestPath}${queryParams}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-App-Token': appToken,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': ts,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ token: data.token });
  } catch (error) {
    res.status(500).json({ token: '', error: 'Failed to get access token' });
  }
}
