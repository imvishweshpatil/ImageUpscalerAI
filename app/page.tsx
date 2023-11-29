"use client";
import React, { useState, useRef } from 'react';
import Upscaler from 'upscaler';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const CircularProgressWithLabel = (
    props: CircularProgressProps & { value: number }
) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
            sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography variant="caption" component="div" color="text.secondary">
                {`${Math.round(props.value)}%`}
            </Typography>
        </Box>
    </Box>
);

const Home: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [patchSize, setPatchSize] = useState(16);
    const [padding, setPadding] = useState(2);
    const [spaceBetweenPatches, setSpaceBetweenPatches] = useState(2);
    const [row, setRow] = useState(0);
    const [col, setCol] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isUpScaling, setIsUpScaling] = useState(false);

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
                /*spaceBetweenPatches,*/
                progress: (patch, slice) => {
                    const cell = document.createElement('td');
                    const sliceImg = new Image();
                    sliceImg.src = slice;
                    sliceImg.alt = "Patch ${patch.row}-${patch.col}";
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

                    // Update progress state
                    setProgress((prevProgress) =>
                        prevProgress >= 100 ? 0 : prevProgress + 10
                    );
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
            <div className="header">
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            ref={imgRef}
                            src={image}
                            alt="Original Image"
                            style={{ maxWidth: '100%' }}
                        />
                        <div>
                            <div>
                                <label>Patch Size</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={patchSize}
                                    max="128"
                                    step="1"
                                    onChange={(e) => setPatchSize(parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Padding</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={padding}
                                    max="20"
                                    step="1"
                                    onChange={(e) => setPadding(parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>Space Between Patches</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={spaceBetweenPatches}
                                    max="40"
                                    step=".1"
                                    onChange={(e) =>
                                        setSpaceBetweenPatches(parseInt(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                        {isUpScaling ? (
                            <CircularProgressWithLabel value={progress} />
                        ) : (
                            <button
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
                            </button>
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
                            style={{ maxWidth: '100%' }}
                        />
                        <button
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
                        </button>
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