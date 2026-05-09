import { useRouter } from 'next/router';

const HeadlineOrchestrator = () => {
    const { locale } = useRouter();

    return (
        <iframe
            src={`/headline-full.html?lang=${locale || 'pt'}`}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
                background: 'transparent',
                backgroundColor: 'transparent',
                border: 'none',
            }}
            className="border-none"
            allowtransparency="true"
        />
    );
};

export default HeadlineOrchestrator;
