import React, { useRef } from "react";
import "./VideoLesson.css";
import VideoThumbnail from "../VideoThumbnail/VideoThumbnail";

const VideoLesson = ({ lesson, setIsDoneVideo }) => {
    const videoRef = useRef(null);

    const handleSeek = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
        }
    };

    return (
        <div className='video-player-container'>
            <video
                ref={videoRef}
                controls
                className='video'
                src={lesson.video.url}
                onTimeUpdate={(e) => {
                    const currentTime = e.target.currentTime;
                    const duration = e.target.duration;
                    if (currentTime / duration > 0.9) {
                        setIsDoneVideo(true);
                    }
                }}
            >
                Trình duyệt không hỗ trợ video.
            </video>

            <div className='chapters-list'>
                <div className='title'>Mục lục</div>
                <div className='list'>
                    {lesson.video.chapters.map((chapter, index) => (
                        <button
                            key={index}
                            onClick={() => handleSeek(chapter.time)}
                            className='chapter-btn'
                        >
                            <VideoThumbnail
                                videoUrl={lesson.video.url}
                                time={chapter.time}
                            />
                            <div className='chapter-time'>
                                ⏱ {formatTime(chapter.time)} - {chapter.title}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Hàm định dạng giây → mm:ss
const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const sec = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${min}:${sec}`;
};

export default VideoLesson;
