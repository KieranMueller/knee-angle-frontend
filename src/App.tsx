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
    const [leg, setLeg] = useState<'left' | 'right'>('left')

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files![0]
        if (uploadedFile) {
            setStatus('Uploading...')
            setFile(uploadedFile)
            const formData = new FormData()
            formData.append('file', uploadedFile)
            try {
                const response = await fetch(
                    `http://localhost:8000/analyze/${leg}`,
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

    const test = () => {
        console.log(leg)
        testGet()
    }

    return (
        <div>
            <div>
                <h2>Tips</h2>
                <ul>
                    <h3>Camera Positioning</h3>
                    <li>Frame: Include entire bike and body</li>
                    <li>Height: mid-thigh height </li>
                    <li>Horizontal angle: camera perpendicular to bike</li>
                    <li>Vertical angle: camera/lense level with floor</li>
                    <li>Distance: 6-10ft</li>
                    <h3>Video</h3>
                    <li>
                        Only include footage pedaling as normal (cut out video
                        of getting on, and off the bike before uploading)
                    </li>
                    <li>
                        No need to pedal slow, pedal as you would normally ride
                    </li>
                    <li>Higher fps = better results</li>
                    <li>5-15s total duration</li>
                    <h3>Other</h3>
                    <li>Wear your usual cycling shoes and pants/bibs</li>
                    <li>Bright lighting</li>
                    <li>
                        Select correct leg (upload footage of left and right to
                        check for inbalances)
                    </li>
                    <h3>Optional</h3>
                    <li>Light, solid color background</li>
                    <li>Solid color shorts/pants</li>
                </ul>
                <h2>Results</h2>
                <ul>
                    <li>
                        Optimal: 140-150° max knee angle, at bottom (6 o'clock)
                        of pedal stroke
                    </li>
                </ul>
            </div>
            <div>
                <h3>Select Leg</h3>
                <label htmlFor='left'>Left</label>
                <input
                    type='radio'
                    id='left'
                    name='leg'
                    checked={leg === 'left'}
                    onChange={() => setLeg('left')}
                />
                <label htmlFor='right'>Right</label>
                <input
                    type='radio'
                    id='right'
                    name='leg'
                    checked={leg === 'right'}
                    onChange={() => setLeg('right')}
                />
            </div>
            <button onClick={test}>test</button>
            <input
                className='upload-input'
                type='file'
                onChange={handleFileUpload}
            />
            {file ? (
                <div className='border'>
                    <h1>Status: {status}</h1>
                    <p>File Name: {file.name}</p>
                    <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>File Type: {file.type}</p>
                </div>
            ) : (
                <></>
            )}
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
