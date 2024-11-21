import { useState } from 'react';
import snsWebSdk from '@sumsub/websdk';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: `user-${Date.now()}`, // Generate unique user ID
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.token;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get access token');
      return '';
    }
  };

  const launchWebSdk = async () => {
    setIsLoading(true);
    setError('');

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const snsWebSdkInstance = snsWebSdk
        .init(
          accessToken,
          () => getAccessToken()
        )
        .withConf({
          lang: 'en',
          theme: 'light',
        })
        .withOptions({
          addViewportTag: false,
          adaptIframeHeight: true
        })
        .on('idCheck.onStepCompleted', (payload) => {
          console.log('Step completed:', payload);
        })
        .on('idCheck.onError', (error) => {
          console.error('Error:', error);
          setError('Verification error occurred');
        })
        .build();

      snsWebSdkInstance.launch('#sumsub-websdk-container');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to launch WebSDK');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HKID Verification Demo</h1>

      <button
        onClick={launchWebSdk}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Loading...' : 'Start Verification'}
      </button>

      {error && (
        <p className="text-red-500 mt-4">{error}</p>
      )}

      <div id="sumsub-websdk-container" className="mt-4" />
    </div>
  );
}
