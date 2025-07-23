/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, type ChangeEvent } from 'react'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import sampleKneeAngleImg from './assets/sample_knee_angle.jfif'
import sampleVideoAnalysis from './assets/L6_point_five_six_feet_portrait_analysis.mp4'

type Status = null | 'Uploading...' | 'Success' | 'Error' | 'Awaiting Upload'
type Advice = {
    'css-class': string
    content: string
}
type BackendResponse = {
    max_knee_angle: number
    average_largest_knee_angles: number
    frames_analyzed: number
    image_base64: string
    advice: Advice
}

function App() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<Status>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [response, setResponse] = useState<BackendResponse>({
        max_knee_angle: 145.2,
        average_largest_knee_angles: 144.8,
        frames_analyzed: 499,
        image_base64: sampleKneeAngleImg,
        advice: {
            'css-class': 'green',
            content: 'Within Range',
        },
    })
    const [leg, setLeg] = useState<'left' | 'right' | null>(null)
    const [orientation, setOrientation] = useState<
        'portrait' | 'landscape' | null
    >(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(sampleVideoAnalysis)

    const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files![0]
        if (uploadedFile) {
            setFile(uploadedFile)
            setStatus('Awaiting Upload')
        }
    }

    const handleFileUpload = async () => {
        if (file) {
            setStatus('Uploading...')
            const formData = new FormData()
            formData.append('file', file)
            try {
                const response = await fetch(
                    `http://localhost:8000/analyze?leg=${leg}&orientation=${orientation}`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                )
                const result = await response.json()
                if (result) {
                    result.image_base64 = `data:image/jpeg;base64,${result.image_base64}`
                    const advice: Advice = {
                        'css-class':
                            result.average_largest_knee_angles <= 150 &&
                            result.average_largest_knee_angles >= 140
                                ? 'green'
                                : (result.average_largest_knee_angles < 140 &&
                                      result.average_largest_knee_angles >=
                                          135) ||
                                  (result.average_largest_knee_angles > 150 &&
                                      result.average_largest_knee_angles <= 155)
                                ? 'orange'
                                : 'red',
                        content:
                            result.average_largest_knee_angles <= 150 &&
                            result.average_largest_knee_angles >= 140
                                ? 'Within range'
                                : result.average_largest_knee_angles < 140
                                ? 'Raise saddle'
                                : result.average_largest_knee_angles > 150
                                ? 'Lower saddle'
                                : '',
                    }
                    setResponse({ ...result, advice })
                    setStatus('Success')
                    getDebugVideo(result.video_filename)
                }
            } catch (e) {
                console.log('Upload failed...', e)
                setStatus('Error')
            }
        }
    }

    const getDebugVideo = async (filePath: string) => {
        await fetch(`http://localhost:8000/debug-video/${filePath}`)
            .then(response => response.blob())
            .then(videoBlob => {
                const videoUrl = URL.createObjectURL(videoBlob)
                setVideoUrl(videoUrl)
            })
            .catch(e => {
                console.log('error fetching debug video', e)
            })
    }

    return (
        <>
            <Header />
            <div className='container'>
                <div className='top-content'>
                    <div className='tips-div'>
                        <h2>Instructions</h2>
                        <ul>
                            <h4>Camera Positioning</h4>
                            <li>Frame: include entire bike and body</li>
                            <li>Height: mid-thigh height </li>
                            <li>
                                Left/Right: line up camera with bottom bracket
                            </li>
                            <li>
                                Horizontal angle: camera perpendicular to bike
                            </li>
                            <li>
                                Distance: 6-10ft (any closer will yield poor
                                results)
                            </li>
                            <h4>Video</h4>
                            <li>Avoid 0.5/wide angle lens</li>
                            <li>
                                <strong>
                                    Only include footage pedaling as normal (cut
                                    out video of mounting/dismounting before
                                    uploading){' '}
                                </strong>
                                <a
                                    target='_blank'
                                    href='https://www.google.com/search?q=trim+video+online+free&rlz=1C1CHBF_enUS1027US1027&oq=trim+video+online+free&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDINCAcQABiGAxiABBiKBTINCAgQABiGAxiABBiKBTIKCAkQABiABBiiBNIBCDI5OTlqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8'>
                                    Video Trimmer
                                </a>
                            </li>
                            <li>Pedal as you would normally ride</li>
                            <li>Higher fps = better results</li>
                            <li>5-15s total duration (10+ pedal rotations)</li>
                            <h4>Other</h4>
                            <li>
                                Ensure bike is level (measure from the ground
                                both front, and rear axles)
                            </li>
                            <li>
                                Warmup for 15m prior (can result in up to 5° of
                                error otherwise!)
                            </li>
                            <li>Wear your usual cycling shoes, pants/bibs</li>
                            <li>Bright lighting</li>
                            <li>
                                Measure left and right knee Angles (check for
                                imbalance)
                            </li>
                            <h3>Results</h3>
                            <li>
                                Optimal: 140-150° max knee angle, at bottom (6
                                o'clock) of pedal stroke
                            </li>
                        </ul>
                    </div>
                    <div className='upload-div'>
                        <div>
                            <h3>Select Leg</h3>
                            <label htmlFor='left'>Left</label>
                            <input
                                type='radio'
                                id='left'
                                name='leg'
                                onChange={() => setLeg('left')}
                            />
                            <label htmlFor='right'>Right</label>
                            <input
                                type='radio'
                                id='right'
                                name='leg'
                                onChange={() => setLeg('right')}
                            />
                        </div>
                        <div>
                            <h3>Select Video Orientation</h3>
                            <label htmlFor='portrait'>Portrait</label>
                            <input
                                type='radio'
                                id='portrait'
                                value='portrait'
                                name='orientation'
                                onChange={() => setOrientation('portrait')}
                            />
                            <label htmlFor='landscape'>Landscape</label>
                            <input
                                type='radio'
                                id='landscape'
                                value='landscape'
                                name='orientation'
                                onChange={() => setOrientation('landscape')}
                            />
                        </div>
                        <div className='upload-elements'>
                            {status !== 'Uploading...' && (
                                <input
                                    className='upload-input'
                                    type='file'
                                    onChange={handleFileSelect}
                                />
                            )}
                            <button
                                className='upload-btn'
                                disabled={
                                    !orientation ||
                                    !file ||
                                    !leg ||
                                    status === 'Uploading...'
                                }
                                onClick={handleFileUpload}>
                                Upload
                            </button>
                        </div>
                        {file ? (
                            <div className='file-info-div'>
                                {status !== 'Uploading...' ? (
                                    <h3>Status: {status}</h3>
                                ) : (
                                    <div className='spinner'></div>
                                )}
                                <p>File Name: {file.name}</p>
                                <p>
                                    File Size: {(file.size / 1024).toFixed(2)}{' '}
                                    KB
                                </p>
                                <p>File Type: {file.type}</p>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                {response && (
                    <div className='results'>
                        <div className='result-data'>
                            <h3>
                                Max Knee Angle:
                                <span className={response.advice['css-class']}>
                                    {' '}
                                    {response.max_knee_angle.toFixed(1)}°
                                </span>
                            </h3>
                            <h3>
                                Average Knee Angle:{' '}
                                <span className={response.advice['css-class']}>
                                    {response.average_largest_knee_angles.toFixed(
                                        1
                                    )}
                                    °
                                </span>
                            </h3>
                            <h3 className={response.advice['css-class']}>
                                {response.advice.content}
                            </h3>
                            <p>
                                (Calculated by averaging 5 greatest knee angles)
                            </p>
                            <p>Frames Analyzed: {response.frames_analyzed}</p>
                            {videoUrl && (
                                <div>
                                    <button className='download-video-btn'>
                                        <a
                                            href={videoUrl}
                                            download={
                                                file?.name.substring(
                                                    0,
                                                    file?.name.lastIndexOf('.')
                                                ) + '_analysis.mp4'
                                            }>
                                            Download Video Analysis
                                        </a>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className='result-media'>
                            <img
                                src={response.image_base64}
                                className='result-img'
                                alt='Max Angle Frame'
                                style={{
                                    maxWidth: '100%',
                                    marginBottom: '1rem',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default App
