import { useEffect, useRef, useState } from "react";
import "./VideoThumbnail.css";

const VideoThumbnail = ({ videoUrl, time }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        const video = videoRef.current;

        const handleSeeked = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL("image/png");
            setThumbnail(imageUrl);
        };

        const handleLoadedData = () => {
            if (time) video.currentTime = time;
            else video.currentTime = 0;
        };

        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, [videoUrl]);

    return (
        <>
            <video
                ref={videoRef}
                src={videoUrl}
                style={{ display: "none" }}
                crossOrigin='anonymous'
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {thumbnail && (
                <img
                    src={thumbnail}
                    alt='thumbnail'
                    className='video-thumbnail'
                />
            )}
        </>
    );
};

export default VideoThumbnail;
