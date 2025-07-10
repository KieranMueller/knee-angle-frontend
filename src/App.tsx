/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, type ChangeEvent } from 'react'
import './App.css'

type Status = null | 'Uploading...' | 'Success' | 'Error'
type BackendResponse = {
    max_knee_angle: number
    frames_analyzed: number
    image_base64: string
    video_base64: string
}

function App() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<Status>(null)
    const [testContent, setTestContent] = useState()
    const [response, setResponse] = useState<BackendResponse>()

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files![0]
        if (uploadedFile) {
            setStatus('Uploading...')
            setFile(uploadedFile)
            const formData = new FormData()
            formData.append('file', uploadedFile)
            try {
                const response = await fetch(
                    'http://localhost:8000/analyze/right',
                    {
                        method: 'POST',
                        body: formData,
                    }
                )
                const result = await response.json()
                if (result) {
                    console.log(result)
                    result.image_base64 = `data:image/jpeg;base64,${result.image_base64}`
                    result.video_base64 = `data:video/mp4;base64,${result.video_base64}`
                    setResponse(result)
                    setStatus('Success')
                }
            } catch (e) {
                console.log('Upload failed...', e)
                setStatus('Error')
            }
        }
    }

    const testGet = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/test')
            const result = await response.json()
            if (result) {
                setTestContent(result.message)
            }
        } catch (e) {
            console.log('error fetching test get', e)
        }
    }

    return (
        <div>
            <h1>Right knee</h1>
            <input
                className='upload-input'
                type='file'
                onChange={handleFileUpload}
            />
            {file ? (
                <div>
                    <h1>Status: {status}</h1>
                    <p>File Name: {file.name}</p>
                    <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>File Type: {file.type}</p>
                </div>
            ) : (
                <></>
            )}
            <button onClick={testGet}>Test GET</button>
            <p>{testContent}</p>
            {response && (
                <div>
                    <h3>
                        Max Knee Angle: {response.max_knee_angle.toFixed(1)}°
                    </h3>
                    <p>Frames Analyzed: {response.frames_analyzed}</p>

                    <img
                        src={response.image_base64}
                        alt='Max Angle Frame'
                        style={{ maxWidth: '100%', marginBottom: '1rem' }}
                    />

                    <video
                        controls
                        key={response.video_base64}
                        src={response.video_base64}
                        style={{ maxWidth: '100%' }}
                    />
                </div>
            )}
        </div>
    )
}

export default App
