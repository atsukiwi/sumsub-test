'use client'
import { SNSWebSdkReact } from '@sumsub/websdk-react'
import { useCallback } from 'react'

export default function KycVerification() {
    const getAccessToken = useCallback(async () => {
        const response = await fetch(`/api/sumsub/access-token?userId=${userId}`)
        const data = await response.json()
        return data.token
    }, [])

    return (
        <div className="w-full h-screen">
            <SNSWebSdkReact
                accessToken={getAccessToken}
                onMessage={(type, payload) => console.log('onMessage', type, payload)}
                onError={(error) => console.error('onError', error)}
                language="en"
                uiConfig={{
                    documents: ['hk_id']
                }}
            />
        </div>
    )
}
