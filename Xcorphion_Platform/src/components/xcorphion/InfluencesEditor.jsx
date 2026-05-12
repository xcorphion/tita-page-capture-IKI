import { useState, useCallback } from 'react';

const F = {
  space: "'Space Grotesk', sans-serif",
  inter: "'Inter', sans-serif",
  mono: "'Courier New', monospace",
};

const AUTHOR_META = [
  {
    id: 'damasio', num: '01', name: 'António Damásio',
    defaultImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmKjUeZK1oSaeYl4aWsIboh8igdmN77G06Ag&s',
    works: [
      { title: "Descartes' Error", year: "1994" },
      { title: "The Feeling of What Happens", year: "1999" },
      { title: "Looking for Spinoza", year: "2003" },
      { title: "Self Comes to Mind", year: "2010" },
      { title: "The Strange Order of Things", year: "2018" },
      { title: "Feeling & Knowing", year: "2021" },
      { title: "The Somatic Marker Hypothesis", year: "1996" },
    ],
    defaultWorks: [
      { href: 'https://www.penguinrandomhouse.com/books/340745/descartes-error-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://www.penguinrandomhouse.com/books/340737/the-feeling-of-what-happens-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://www.penguinrandomhouse.com/books/340735/looking-for-spinoza-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://www.penguinrandomhouse.com/books/93565/self-comes-to-mind-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://www.penguinrandomhouse.com/books/573255/the-strange-order-of-things-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://www.penguinrandomhouse.com/books/646060/feeling-knowing-by-antonio-damasio/', hrefLabel: 'Adquirir' },
      { href: 'https://royalsocietypublishing.org/doi/10.1098/rstb.1996.0118', hrefLabel: 'Artigo' },
    ],
  },
  {
    id: 'russell', num: '02', name: 'James A. Russell',
    defaultImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVh4odkNSzpbmEDG5bFxt4345QyauYFXi3joLKO8CK2w&s',
    works: [
      { title: "A Circumplex Model of Affect", year: "1980" },
      { title: "Core Affect and the Psychological Construction of Emotion", year: "2003" },
      { title: "Is There Universal Recognition of Emotion from Facial Expression?", year: "1994" },
      { title: "The Psychological Construction of Emotion", year: "2014" },
    ],
    defaultWorks: [
      { href: 'https://psycnet.apa.org/record/1980-23793-001', hrefLabel: 'Artigo · APA' },
      { href: 'https://psycnet.apa.org/record/2003-05387-002', hrefLabel: 'Artigo · APA' },
      { href: 'https://psycnet.apa.org/record/1994-42988-001', hrefLabel: 'Artigo · APA' },
      { href: 'https://www.guilford.com/books/The-Psychological-Construction-of-Emotion/Barrett-Russell/9781462516971', hrefLabel: 'Adquirir' },
    ],
  },
  {
    id: 'picard', num: '03', name: 'Rosalind W. Picard',
    defaultImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbnbSsqijicNi2fin-7RGxqui454u5wX1m9WTj6cixM6zF7mvSFcAyXkV_-RQx-IlBg6ekD1KnZH9i34UKzR0KODhMbc9CrmqR0L1mqyZZDg&s=10',
    works: [
      { title: "Affective Computing", year: "1997" },
      { title: "Recognizing Stress from Keystroke and Mouse Patterns", year: "2007" },
      { title: "Toward an Affective User Interface", year: "2000" },
      { title: "Affective Wearables", year: "1997" },
    ],
    defaultWorks: [
      { href: 'https://mitpress.mit.edu/9780262661157/affective-computing/', hrefLabel: 'Adquirir · MIT Press' },
      { href: 'https://affect.media.mit.edu/pdfs/07.picard-healey.pdf', hrefLabel: 'Artigo (PDF)' },
      { href: 'https://link.springer.com/article/10.1007/BF01261679', hrefLabel: 'Artigo' },
      { href: 'https://affect.media.mit.edu/pdfs/97.picard-et-al-affective-wearables.pdf', hrefLabel: 'Artigo (PDF)' },
    ],
  },
  {
    id: 'vaswani', num: '04', name: 'Vaswani et al.',
    defaultImg: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i2Q1XWfCwbj0/v1/-1x-1.webp',
    works: [
      { title: "Attention Is All You Need", year: "2017" },
      { title: "Image Transformer", year: "2018" },
      { title: "Universal Transformers", year: "2018" },
    ],
    defaultWorks: [
      { href: 'https://arxiv.org/abs/1706.03762', hrefLabel: 'arXiv (gratuito)' },
      { href: 'https://arxiv.org/abs/1802.05751', hrefLabel: 'arXiv' },
      { href: 'https://arxiv.org/abs/1807.03819', hrefLabel: 'arXiv' },
    ],
  },
  {
    id: 'hinton', num: '05', name: 'Geoffrey E. Hinton',
    defaultImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVfg34WBGo-g870qasPXvp9NBtsUARYha4iF_hT_J3vw&s',
    works: [
      { title: "Learning Representations by Back-propagating Errors", year: "1986" },
      { title: "ImageNet Classification / AlexNet", year: "2012" },
      { title: "Dropout", year: "2014" },
      { title: "The Forward-Forward Algorithm", year: "2022" },
      { title: "Nobel Prize in Physics 2024", year: "2024" },
    ],
    defaultWorks: [
      { href: 'https://www.nature.com/articles/323533a0', hrefLabel: 'Nature' },
      { href: 'https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html', hrefLabel: 'NeurIPS' },
      { href: 'https://jmlr.org/papers/v15/srivastava14a.html', hrefLabel: 'JMLR (gratuito)' },
      { href: 'https://arxiv.org/abs/2212.13345', hrefLabel: 'arXiv (gratuito)' },
      { href: 'https://www.nobelprize.org/prizes/physics/2024/hinton/facts/', hrefLabel: 'Página oficial' },
    ],
  },
];

function buildInitialState(initialConfig) {
  const authors = {};
  for (const a of AUTHOR_META) {
    const saved = initialConfig?.authors?.[a.id];
    authors[a.id] = {
      img: saved?.img ?? a.defaultImg,
      works: a.works.map((_, i) => ({
        href: saved?.works?.[i]?.href ?? a.defaultWorks[i].href,
        hrefLabel: saved?.works?.[i]?.hrefLabel ?? a.defaultWorks[i].hrefLabel,
      })),
    };
  }
  return { authors };
}

const inp = {
  fontFamily: F.inter, fontSize: 13, color: 'white',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6, padding: '7px 11px', outline: 'none',
  transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
};

function ImagePreview({ url }) {
  const [broken, setBroken] = useState(false);
  return (
    <div style={{
      width: 72, height: 72, flexShrink: 0,
      borderRadius: 8, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {url && !broken ? (
        <img
          src={url}
          alt=""
          onError={() => setBroken(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )}
    </div>
  );
}

export default function InfluencesEditor({ password, initialConfig }) {
  const [state, setState] = useState(() => buildInitialState(initialConfig));
  const [open, setOpen] = useState('damasio');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | ok | error

  const setImg = useCallback((authorId, url) => {
    setState(s => ({
      ...s,
      authors: {
        ...s.authors,
        [authorId]: { ...s.authors[authorId], img: url },
      },
    }));
  }, []);

  const setWork = useCallback((authorId, workIdx, field, val) => {
    setState(s => {
      const works = s.authors[authorId].works.map((w, i) =>
        i === workIdx ? { ...w, [field]: val } : w
      );
      return {
        ...s,
        authors: { ...s.authors, [authorId]: { ...s.authors[authorId], works } },
      };
    });
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/influences-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(state),
      });
      setSaveStatus(res.ok ? 'ok' : 'error');
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div style={{ padding: '32px 40px', paddingBottom: 120 }}>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: F.space, fontWeight: 700, fontSize: 18, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
          Editor · Influências Chave
        </h2>
        <p style={{ fontFamily: F.inter, fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6, fontWeight: 300 }}>
          Edite as imagens e links de aquisição da página pública /influences. As alterações são aplicadas imediatamente após salvar.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 900 }}>
        {AUTHOR_META.map(author => {
          const isOpen = open === author.id;
          const authorState = state.authors[author.id];

          return (
            <div
              key={author.id}
              style={{
                border: `1px solid ${isOpen ? 'rgba(139,0,0,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10,
                background: isOpen ? 'rgba(139,0,0,0.03)' : 'rgba(255,255,255,0.01)',
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setOpen(isOpen ? null : author.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '14px 18px', textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: F.inter, fontSize: 9, fontWeight: 700,
                  color: '#8B0000', letterSpacing: '0.1em',
                  background: 'rgba(139,0,0,0.12)',
                  border: '1px solid rgba(139,0,0,0.25)',
                  borderRadius: 4, padding: '3px 7px',
                  textTransform: 'uppercase', flexShrink: 0,
                }}>
                  {author.num}
                </span>
                <span style={{ fontFamily: F.space, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)', flex: 1 }}>
                  {author.name}
                </span>
                <span style={{
                  fontFamily: F.inter, fontSize: 11, color: 'rgba(255,255,255,0.2)',
                  marginRight: 4,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}>
                  ▾
                </span>
              </button>

              {/* Accordion content */}
              {isOpen && (
                <div style={{ padding: '0 18px 20px' }}>

                  {/* Image row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
                    paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <ImagePreview url={authorState.img} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                        URL da Imagem
                      </p>
                      <input
                        type="url"
                        value={authorState.img}
                        onChange={e => setImg(author.id, e.target.value)}
                        placeholder="https://..."
                        style={{ ...inp }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  </div>

                  {/* Works */}
                  <p style={{ fontFamily: F.inter, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Obras — Links de Aquisição
                  </p>

                  {/* Column headers */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ flex: '0 0 38%', fontFamily: F.inter, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obra</span>
                    <span style={{ flex: '0 0 46%', fontFamily: F.inter, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>URL</span>
                    <span style={{ flex: '0 0 16%', fontFamily: F.inter, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Label</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {author.works.map((work, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: '0 0 38%', display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{
                            fontFamily: F.inter, fontSize: 9, fontWeight: 600,
                            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}>
                            {work.year}
                          </span>
                          <span style={{
                            fontFamily: F.inter, fontSize: 12,
                            color: 'rgba(255,255,255,0.38)',
                            lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }} title={work.title}>
                            {work.title}
                          </span>
                        </div>
                        <input
                          type="url"
                          value={authorState.works[i].href}
                          onChange={e => setWork(author.id, i, 'href', e.target.value)}
                          placeholder="https://..."
                          style={{ ...inp, flex: '0 0 46%', fontSize: 12 }}
                          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                        <input
                          type="text"
                          value={authorState.works[i].hrefLabel}
                          onChange={e => setWork(author.id, i, 'hrefLabel', e.target.value)}
                          placeholder="Adquirir"
                          style={{ ...inp, flex: '0 0 16%', fontSize: 12 }}
                          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky save bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14,
      }}>
        {saveStatus === 'ok' && (
          <span style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(120,200,120,0.9)', fontWeight: 500 }}>
            Salvo ✓
          </span>
        )}
        {saveStatus === 'error' && (
          <span style={{ fontFamily: F.inter, fontSize: 13, color: 'rgba(200,80,80,0.9)', fontWeight: 500 }}>
            Erro ao salvar
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          style={{
            fontFamily: F.inter, fontWeight: 500, fontSize: 13,
            color: 'white',
            background: saveStatus === 'saving' ? 'rgba(139,0,0,0.5)' : '#8B0000',
            border: 'none', borderRadius: 8, padding: '10px 24px',
            cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (saveStatus !== 'saving') e.currentTarget.style.background = '#9e0000'; }}
          onMouseLeave={e => { if (saveStatus !== 'saving') e.currentTarget.style.background = '#8B0000'; }}
        >
          {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
