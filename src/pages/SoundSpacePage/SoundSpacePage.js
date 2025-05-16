import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Howl } from "howler";
import axios from "axios";
import constants from "../../utils/constants";
import "./SoundSpacePage.css";

const SoundSpacePage = () => {
    const API = constants.API;
    const nav = useNavigate();
    const [sounds, setSounds] = useState();
    const [playing, setPlaying] = useState({});
    const [volumes, setVolumes] = useState({});
    const [videoUrl, setVideoUrl] = useState("");
    const [videoId, setVideoId] = useState(null);
    const videoRef = useRef();
    // Fetch sound
    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`${API}/sound`);

            let data = res.data;
            setSounds(data);
            setVolumes(
                data.reduce((acc, sound) => ({ ...acc, [sound.name]: 1 }), {})
            );
        };
        fetchData();
    }, [API]);

    const toggleSound = (sound) => {
        if (playing[sound.name]) {
            playing[sound.name].stop();
            setPlaying((prev) => ({ ...prev, [sound.name]: null }));
        } else {
            const howl = new Howl({
                src: [sound.src],
                loop: true,
                volume: volumes[sound.name],
            });
            howl.play();
            setPlaying((prev) => ({ ...prev, [sound.name]: howl }));
        }
    };

    const changeVolume = (sound, value) => {
        setVolumes((prev) => ({ ...prev, [sound.name]: value }));
        if (playing[sound.name]) {
            playing[sound.name].volume(value);
        }
    };

    const extractVideoId = (url) => {
        const regex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleInputChange = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
    };

    const handleSearchYoutube = () => {
        const id = extractVideoId(videoUrl);
        setVideoId(id);
    };

    return (
        <div className='container'>
            <div className='sound-page'>
                <div className='card'>
                    <div className='video-item'>
                        <div className='youtube-search'>
                            <input
                                type='text'
                                value={videoUrl}
                                onChange={handleInputChange}
                                placeholder='Nhập link youtube vào đấy'
                            />
                            <button onClick={() => handleSearchYoutube()}>
                                Xác nhận
                            </button>
                        </div>

                        <div
                            ref={videoRef}
                            style={{
                                marginTop: "10px",
                                maxHeight: videoId
                                    ? videoRef.current.scrollHeight
                                    : "0px",
                                overflow: "hidden",
                                transition: "all 0.5s ease-in-out",
                            }}
                        >
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title='YouTube video player'
                                frameBorder='0'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowFullScreen
                                className='video'
                            ></iframe>
                        </div>
                    </div>
                </div>
                <div className='card'>
                    {" "}
                    <div className='sound-list'>
                        {sounds &&
                            sounds.map((sound, index) => (
                                <div className='sound-item' key={index}>
                                    <img
                                        className='sound-icon'
                                        src={sound.icon}
                                        onClick={() => toggleSound(sound)}
                                        alt={sound.name}
                                    />
                                    <input
                                        className={`sound-volume ${
                                            playing[sound.name] ? "active" : ""
                                        }`}
                                        type='range'
                                        min='0'
                                        max='1'
                                        step='0.01'
                                        value={volumes[sound.name] || 1}
                                        onChange={(e) =>
                                            changeVolume(
                                                sound,
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundSpacePage;
