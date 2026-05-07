import Head from 'next/head';
import { connectToDatabase } from '@xcorphion/shared';

export default function Convite({ participant, error, appUrl }) {
    const globalStyle = (
        <style jsx global>{`
            body, html {
                display: block !important;
                height: auto !important;
                min-height: 100vh;
                margin: 0;
                padding: 0;
                background-color: black;
                color: white;
            }
            .responsive-wrapper {
                display: flex;
                min-height: 100vh;
                padding: 20px;
            }
            .responsive-content {
                margin: auto;
                width: 80%;
                max-width: 1400px;
                text-align: left;
            }
            .responsive-box {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid #222;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                margin: 0 auto;
            }
            @media (max-width: 768px) {
                .responsive-content {
                    width: 95%;
                }
                .responsive-box {
                    padding: 20px;
                }
            }
        `}</style>
    );

    if (error) {
        return (
            <>
                {globalStyle}
                <div className="responsive-wrapper">
                    <div className="responsive-content responsive-box">
                        <h2>Código não encontrado.</h2>
                    </div>
                </div>
            </>
        );
    }

    if (participant.status === 'INATIVO') {
        return (
            <>
                {globalStyle}
                <div className="responsive-wrapper">
                    <div className="responsive-content responsive-box">
                        <h2>Esta participação foi encerrada.</h2>
                    </div>
                </div>
            </>
        );
    }

    const { participant_name, referrer_name, participant_code } = participant;
    const session_link = `/IKI/${participant_code}`; // Link dinâmico para a unidade de pesquisa IKI

    let sessionNumber = 1;
    let isWaiting = false;
    let title = "";
    let body = null;

    if (participant.session_1_status === 'LIBERADA') {
        sessionNumber = 1;
        title = "Você foi convidado(a) para participar de uma pesquisa";
        body = (
            <>
                <p>{participant_name}, {referrer_name} te indicou para participar de uma pesquisa acadêmica sobre como as pessoas escrevem quando tomam decisões importantes.</p>
                <p>Não é um teste. Não existe resposta certa ou errada.</p>
                <p>Você vai escrever livremente sobre uma decisão real que viveu — e enquanto escreve, o ritmo das suas teclas vai ser registrado de forma anônima. Nada mais.</p>
                <p>Sua identidade não é coletada. Seu código de acesso é o único vínculo com sua participação.</p>
                <p>Esta é a Sessão 1 de 3. Cada sessão dura cerca de 20 minutos e pode ser feita em dias diferentes.</p>
            </>
        );
    } else if (participant.session_1_status === 'CONCLUIDA' && participant.session_2_status === 'AGUARDANDO') {
        sessionNumber = 2;
        isWaiting = true;
    } else if (participant.session_2_status === 'LIBERADA') {
        sessionNumber = 2;
        title = "Sessão 2 — Você está de volta";
        body = (
            <>
                <p>{participant_name}, obrigado por completar a primeira sessão.</p>
                <p>{referrer_name} acreditou que você teria algo valioso a contribuir para esta pesquisa — e você confirmou isso.</p>
                <p>Esta é a Sessão 2 de 3. O formato é idêntico ao da primeira: escreva livremente, sem pressão, em um ambiente silencioso.</p>
                <p>Seu código de acesso permanece o mesmo.</p>
            </>
        );
    } else if (participant.session_2_status === 'CONCLUIDA' && participant.session_3_status === 'AGUARDANDO') {
        sessionNumber = 3;
        isWaiting = true;
    } else if (participant.session_3_status === 'LIBERADA') {
        sessionNumber = 3;
        title = "Sessão 3 — A etapa final";
        body = (
            <>
                <p>{participant_name}, você chegou à última sessão.</p>
                <p>Esta pesquisa só existe porque pessoas como você, indicadas por {referrer_name}, aceitaram dedicar tempo real a algo que ainda está sendo construído.</p>
                <p>Depois desta sessão, sua participação estará completa. Os dados coletados — sempre anônimos — vão alimentar um modelo que tenta entender como o corpo responde enquanto a mente decide.</p>
                <p>Obrigado por fazer parte disso.</p>
            </>
        );
    } else if (participant.session_3_status === 'CONCLUIDA') {
        return (
            <>
                {globalStyle}
                <div className="responsive-wrapper">
                    <div className="responsive-content responsive-box">
                        <h2>Esta participação foi encerrada.</h2>
                    </div>
                </div>
            </>
        );
    }

    if (isWaiting) {
        return (
            <>
                {globalStyle}
                <div className="responsive-wrapper">
                    <div className="responsive-content responsive-box">
                        <h2 style={{ marginBottom: 20 }}>Sua próxima sessão será liberada em breve.</h2>
                        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Você não precisa fazer nada — o link permanece o mesmo.</p>
                        <div style={{ marginTop: 40 }}>
                            <p style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seu Código</p>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '0.1em', background: '#111', padding: '10px 30px', borderRadius: 8, display: 'inline-block', border: '1px solid #333' }}>
                                {participant_code}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Convite - Pesquisa Acadêmica</title>
            </Head>
            {globalStyle}
            <div className="responsive-wrapper">
                <div className="responsive-content">
                    <h1 style={{ fontSize: '2rem', marginBottom: 20, borderBottom: '1px solid #333', paddingBottom: 10 }}>{title}</h1>
                    <div style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#ccc', marginBottom: 40 }}>
                        {body}
                    </div>

                    <div className="responsive-box">
                        <p style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 15 }}>Seu Código de Acesso</p>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '0.15em', color: '#eee', marginBottom: 25 }}>
                            {participant_code}
                        </div>
                        <a href={session_link} style={{ display: 'inline-block', background: '#eee', color: '#000', padding: '12px 30px', borderRadius: 8, fontSize: '1.05rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                            Iniciar Sessão {sessionNumber}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const { codigo } = context.params;
    
    try {
        const db = await connectToDatabase();
        const participant = await db.collection('participants').findOne({ participant_code: codigo });

        if (!participant) {
            return { props: { error: true } };
        }

        const appUrl = process.env.APP_URL || 'http://localhost:3000';

        const serializedParticipant = {
            participant_id: participant.participant_id || '',
            participant_code: participant.participant_code || participant.participant_id || '',
            participant_name: participant.participant_name || 'Participante',
            referrer_name: participant.referrer_name || 'Alguém',
            status: participant.status || 'ATIVO',
            session_1_status: participant.session_1_status || 'LIBERADA',
            session_2_status: participant.session_2_status || 'AGUARDANDO',
            session_3_status: participant.session_3_status || 'AGUARDANDO',
        };

        return {
            props: {
                participant: serializedParticipant,
                appUrl
            }
        };
    } catch (e) {
        console.error(e);
        return { props: { error: true } };
    }
}
