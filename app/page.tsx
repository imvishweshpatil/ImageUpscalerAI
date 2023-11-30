"use client";
import React, { useState, useRef } from 'react';
import Upscaler from 'upscaler';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import "./globals.css";

const Home: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
    const [isUpScaling, setIsUpScaling] = useState(false);
    const [patchSize, setPatchSize] = useState(16);
    const [padding, setPadding] = useState(2);
    const [spaceBetweenPatches, setSpaceBetweenPatches] = useState(2);
    const [row, setRow] = useState(0);
    const [col, setCol] = useState(0);

    const imgRef = useRef<HTMLImageElement>(null);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpScale = async () => {
        if (image) {
            setIsUpScaling(true);

            const upscaler = new Upscaler();
            const { columns } = getRowsAndColumns(imgRef.current, patchSize);

            const tbody = document.createElement('tbody');
            let currentRow = document.createElement('tr');
            tbody.appendChild(currentRow);

            const upscaledImgSrc = await upscaler.upscale(image, {
                patchSize,
                padding,
                progress: (patch, slice) => {
                    const cell = document.createElement('td');
                    const sliceImg = new Image();
                    sliceImg.src = slice;
                    sliceImg.alt ="Patch ${patch.row}-${patch.col}";
                    sliceImg.title = "Patch ${patch.row}-${patch.col}";
                    cell.appendChild(sliceImg);

                    setCol((prevCol) => prevCol + 1);

                    if (col >= columns) {
                        console.log('new row!');
                        setRow((prevRow) => prevRow + 1);
                        setCol(0);
                        currentRow = document.createElement('tr');
                        tbody.appendChild(currentRow);
                    } else {
                        currentRow.appendChild(cell);
                    }
                },
            });

            setIsUpScaling(false);
            setUpscaledImage(upscaledImgSrc);
        }
    };

    const handleDownload = () => {
        const downloadLink = document.createElement('a');
        downloadLink.href = upscaledImage || image || '';
        downloadLink.download = 'upscaled_image.png';
        downloadLink.click();
    };

    return (
        <main>
            <div className="Main">
                <h1
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '80px 0px',
                        color: '#3498DB',
                        fontSize: '40px',
                        fontWeight: 'bold',
                    }}
                >
                    Image Upscaler
                </h1>
                <div className="image" style={{ textAlign: 'center' }}>
                    <input type="file" onChange={onChange} accept="image/*" />
                </div>
                {image && (
                    <div
                        style={{
                            backgroundImage: 'url("app/background.jpg")',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <img className='upscale-image'
                            ref={imgRef}
                            src={image}
                            alt="Original Image"
                            style={{ maxWidth: '100%', margin:"25px" }}
                        />
                        <div>
                            <div>
                                <label>Patch Size</label>
                                <Slider
                                    aria-label="Custom marks"
                                    min={0}
                                    max={128}
                                    step={1}
                                    value={patchSize}
                                    onChange={(e, value) => setPatchSize(value as number)}
                                    valueLabelDisplay="auto"
                                />
                            </div>
                            <div>
                                <label>Padding</label>
                                <Slider
                                    min={0}
                                    max={20}
                                    step={1}
                                    value={padding}
                                    onChange={(e, value) => setPadding(value as number)}
                                    valueLabelDisplay="auto"
                                />
                            </div>
                            <div>
                                <label>Space Between Patches</label>
                                <Slider
                                    min={0}
                                    max={40}
                                    step={0.1}
                                    value={spaceBetweenPatches}
                                    onChange={(e, value) => setSpaceBetweenPatches(value as number)}
                                    valueLabelDisplay="auto"
                                />
                            </div>
                        </div>

                        {isUpScaling ? (
                            <CircularProgress style={{ display: "flex", alignItems:"center", justifyContent:"center", width:"100px" }} />
                        ) : (
                            <div><button
                                onClick={handleUpScale}
                                style={{
                                    backgroundColor: 'black',
                                    borderRadius: '10px',
                                    color: 'white',
                                    width: '140px',
                                    margin: '52px 30px',
                                    height: '25px',
                                }}
                            >
                                Upscale Image
                            </button></div>
                        )}
                    </div>
                )}

                {upscaledImage && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            src={upscaledImage}
                            alt="Upscaled Image"
                            style={{ maxWidth: '100%', margin:"50px" }}
                        />
                        <div><button
                            onClick={handleDownload}
                            style={{
                                backgroundColor: 'black',
                                borderRadius: '10px',
                                color: 'white',
                                width: '215px',
                                margin: '52px 30px',
                                height: '52px',
                            }}
                        >
                            Download Image
                        </button></div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Home;

function getRowsAndColumns(image: HTMLImageElement | null, patchSize: number) {
    return { rows: 0, columns: 0 };
}