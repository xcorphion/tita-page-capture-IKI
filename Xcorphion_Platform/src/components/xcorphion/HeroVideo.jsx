import { useRef, useEffect } from 'react';

const HeroVideo = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        videoRef.current?.play().catch(() => {});
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            src="/She_slowly_begins_to_turn_202605042158.mp4"
        />
    );
};

export default HeroVideo;
