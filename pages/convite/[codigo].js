import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';

export default function Convite({ participant, error, appUrl }) {
    if (error) {
        return (
            <div className="center-container">
                <div style={{ maxWidth: 600, padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                    <h2>Código não encontrado.</h2>
                </div>
            </div>
        );
    }

    if (participant.status === 'INATIVO') {
        return (
            <div className="center-container">
                <div style={{ maxWidth: 600, padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                    <h2>Esta participação foi encerrada.</h2>
                </div>
            </div>
        );
    }

    const { participant_name, referrer_name, participant_code } = participant;
    const session_link = `${appUrl}/`; // Redireciona para raiz

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
            <div className="center-container">
                <div style={{ maxWidth: 600, padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                    <h2>Esta participação foi encerrada.</h2>
                </div>
            </div>
        );
    }

    if (isWaiting) {
        return (
            <div className="center-container">
                <div style={{ maxWidth: 600, padding: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
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
        );
    }

    return (
        <>
            <Head>
                <title>Convite - Pesquisa Acadêmica</title>
            </Head>
            <div className="center-container" style={{ padding: '20px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: 20, borderBottom: '1px solid #333', paddingBottom: 10 }}>{title}</h1>
                    <div style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#ccc', marginBottom: 40 }}>
                        {body}
                    </div>

                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: 12, border: '1px solid #333' }}>
                        <p style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Seu Código de Acesso</p>
                        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', letterSpacing: '0.1em', color: '#fff', marginBottom: 30 }}>
                            {participant_code}
                        </div>
                        <a href={session_link} style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '15px 40px', borderRadius: 30, fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
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
        const participant = await db.collection('participants').findOne({ participant_id: codigo });

        if (!participant) {
            return { props: { error: true } };
        }

        const appUrl = process.env.APP_URL || 'http://localhost:3000';

        // Serialize the document explicitly to avoid MongoDB ObjectId serialization issues in Next.js
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
