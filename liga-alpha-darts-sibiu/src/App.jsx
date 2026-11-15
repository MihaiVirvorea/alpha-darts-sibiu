import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Crosshair,
  ExternalLink,
  Flame,
  MapPin,
  Medal,
  Menu,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import editionOne from '../results_editia_1.json'
import editionTwo from '../results_editia_2.json'
import editionThree from '../results_editia_3.json'
import editionFour from '../results_editia_4.json'

const editions = [
  {
    ...editionOne,
    title: 'Cupa Alpha Darts',
    editionLabel: 'Ediția 01',
    venue: 'Kub Social Club, Sibiu',
    cover: '/images/edition1/edition-1-podium.jpeg',
    action: '/images/edition1/edition-1-action.jpeg',
  },
  {
    ...editionTwo,
    title: 'Cupa Alpha Darts',
    editionLabel: 'Ediția 02',
    venue: 'Silvana Caffe-Pub, Sibiu',
    cover: '/images/edition2/edition-2-podium.jpeg',
    action: '/images/edition2/edition-2-action.jpeg',
  },
  {
    ...editionThree,
    title: 'Cupa Alpha Darts',
    editionLabel: 'Ediția 03',
    venue: 'Sibiu',
    cover: '/images/edition3/WhatsApp%20Image%202026-10-10%20at%2001.00.59.jpeg',
    action: '/images/edition3/WhatsApp%20Image%202026-10-10%20at%2000.05.43.jpeg',
  },
  {
    ...editionFour,
    title: 'Cupa Alpha Darts',
    editionLabel: 'Ediția 04',
    venue: 'Silvana Caffe-Pub, Sibiu',
    cover: '/images/edition4/Alpha%20Darts%20Sibiu%20Award%20Ceremony.png',
    action: '/images/edition4/Alpha%20Darts%20Sibiu%20Award%20Ceremony.png',
  },
]

const placePoints = (place) => {
  if (place == null) return 10
  if (place === 1) return 100
  if (place === 2) return 80
  if (place === 3) return 70
  if (place === 4) return 60
  if (place <= 8) return 45
  if (place <= 16) return 30
  if (place <= 32) return 20
  return 10
}

const scorePlayer = (player) => {
  const placement = placePoints(player.rank_final)
  const oneEighties = player.score_180s * 10
  const finish = player.high_finish >= 100 ? player.high_finish / 10 : 0
  const average = player.three_darts_average / 10

  return {
    ...player,
    placement,
    oneEighties,
    finish,
    average,
    points: placement + oneEighties + finish + average,
  }
}

const rankValue = (place) => place ?? Number.POSITIVE_INFINITY
const placeBadge = (place) => (place == null ? 'x' : Math.min(place, 4))

const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat('ro-RO', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)

const formatDate = (date) =>
  new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  )

const formatShortDate = (date) => {
  const value = new Date(`${date}T12:00:00`)
  const day = new Intl.DateTimeFormat('ro-RO', { day: '2-digit' }).format(value)
  const month = new Intl.DateTimeFormat('ro-RO', { month: 'short' }).format(value).replace('.', '').toLocaleUpperCase('ro-RO')
  return `${day} ${month} · ${value.getFullYear()}`
}

const normalizeName = (name = '') => name.trim().toLocaleLowerCase('ro-RO')
const isBracketPlayer = (player) => Boolean(player?.id && player?.name)
const getBracketMatches = (edition) => [
  ...(edition.brackets.winners ?? edition.brackets.winners_bracket ?? []),
  ...(edition.brackets.losers ?? edition.brackets.losers_bracket ?? []),
]
const playerFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get('jucator')

function PlayerProfile({ playerName, leaderboard, onBack }) {
  const playerKey = normalizeName(playerName)
  const standing = leaderboard.find((player) => normalizeName(player.name) === playerKey)
  const playerRank = leaderboard.findIndex((player) => normalizeName(player.name) === playerKey) + 1
  const editionResults = editions
    .map((edition) => {
      const result = edition.results.find((player) => normalizeName(player.name) === playerKey)
      return result ? { edition, ...scorePlayer(result) } : null
    })
    .filter(Boolean)

  const matches = editions.flatMap((edition) =>
    getBracketMatches(edition)
      .filter((match) => isBracketPlayer(match.player1) && isBracketPlayer(match.player2))
      .filter((match) => normalizeName(match.player1.name) === playerKey || normalizeName(match.player2.name) === playerKey)
      .map((match) => {
        const own = normalizeName(match.player1.name) === playerKey ? match.player1 : match.player2
        const opponent = own === match.player1 ? match.player2 : match.player1
        return { edition, ...match, own, opponent, won: own.is_winner === true }
      }),
  )

  const headToHead = [...matches.reduce((opponents, match) => {
    const key = normalizeName(match.opponent.name)
    const current = opponents.get(key) ?? { name: match.opponent.name, matches: 0, wins: 0, losses: 0, legsFor: 0, legsAgainst: 0 }
    current.matches += 1
    current.wins += match.won ? 1 : 0
    current.losses += match.won ? 0 : 1
    current.legsFor += match.own.score ?? 0
    current.legsAgainst += match.opponent.score ?? 0
    opponents.set(key, current)
    return opponents
  }, new Map()).values()].sort((a, b) => b.matches - a.matches || b.wins - a.wins)

  const wins = matches.filter((match) => match.won).length
  const losses = matches.length - wins
  const winRate = matches.length ? (wins / matches.length) * 100 : null
  const highFinish = Math.max(0, ...editionResults.map((result) => result.high_finish))
  const matchAverages = matches.map((match) => match.own.avg).filter((average) => average != null)
  const bestMatchAverage = matchAverages.length ? Math.max(...matchAverages) : null

  return (
    <div className="site-shell profile-page">
      <div className="noise" aria-hidden="true" />
      <header className="topbar container">
        <a className="brand" href="#acasa" onClick={onBack} aria-label="Alpha Darts Sibiu — Acasă">
          <img src="/images/alpha-logo.png" alt="Alpha Darts Sibiu" />
          <span className="brand-divider" />
          <span className="brand-copy">LIGA<br /><strong>2026</strong></span>
        </a>
        <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={17} /> Înapoi la clasament</button>
      </header>
      <main className="player-profile container">
        <section className="profile-hero">
          <div className="profile-hero-mark">{playerName.split(' ').map((name) => name[0]).join('')}</div>
          <div className="profile-heading">
            <p className="eyebrow">FIȘA JUCĂTORULUI · SEZON 2026</p>
            <h1>{playerName.split(' ')[0]}<br /><em>{playerName.split(' ').slice(1).join(' ')}</em></h1>
          </div>
          <div className="profile-ranking"><span>LOC ÎN CLASAMENT</span><strong>#{String(playerRank).padStart(2, '0')}</strong><small>{formatNumber(standing?.points ?? 0)} puncte</small></div>
        </section>

        <section className="profile-stat-grid">
          <article><span>MECIURI JUCATE</span><strong>{matches.length}</strong><small>bye-urile nu se includ</small></article>
          <article><span>BILANȚ MECIURI</span><strong className="win-loss"><i>{wins}W</i> – {losses}L</strong><small>în bracketurile edițiilor</small></article>
          <article><span>CEA MAI BUNĂ MEDIE</span><strong>{bestMatchAverage == null ? '—' : formatNumber(bestMatchAverage)}</strong><small>dintr-un meci jucat</small></article>
          <article><span>PARTICIPĂRI</span><strong>{editionResults.length}<small>/{editions.length}</small></strong><small>ediții Alpha Darts</small></article>
          <article><span>HIGH FINISH</span><strong>{highFinish || '—'}</strong><small>cel mai mare checkout</small></article>
          <article><span>WIN RATE</span><strong>{winRate == null ? '—' : `${formatNumber(winRate)}%`}</strong><small>meciuri din bracket · fără bye-uri</small></article>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading"><div><p className="eyebrow">REZULTATE PE EDIȚII</p><h2>Parcursul din <em>2026.</em></h2></div></div>
          <div className="edition-results-grid">
            {editionResults.map((result) => (
              <article className="profile-edition-card" key={result.edition.edition}>
                <div
                  className={`profile-place profile-place-${placeBadge(result.rank_final)}`}
                  aria-label={`Locul ${result.rank_final} în clasamentul ediției ${result.edition.edition}`}
                >
                  <span>LOCUL</span><strong>{result.rank_final ?? '—'}</strong>
                </div>
                <div><span>{result.edition.editionLabel} · {formatDate(result.edition.date)}</span><h3>{result.edition.title}</h3><p>{result.edition.venue}</p></div>
                <div className="profile-edition-score"><strong>{formatNumber(result.points)}</strong><span>puncte</span></div>
                <div className="profile-edition-details"><span>AVG. <b>{formatNumber(result.three_darts_average)}</b></span><span>180 <b>{result.score_180s}</b></span><span>HIGH FINISH <b>{result.high_finish || '—'}</b></span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-section profile-dual-grid">
          <div className="h2h-card">
            <div className="profile-section-heading"><div><p className="eyebrow">HEAD TO HEAD</p><h2>Față în <em>față.</em></h2></div><Swords size={25} /></div>
            <div className="h2h-table">
              <div className="h2h-head"><span>ADVERSAR</span><span>W–L</span><span>LEGS</span></div>
              {headToHead.map((opponent) => <div className="h2h-row" key={opponent.name}><span>{opponent.name}</span><strong><i>{opponent.wins}W</i> – {opponent.losses}L</strong><span>{opponent.legsFor}–{opponent.legsAgainst}</span></div>)}
              {!headToHead.length && <p className="empty-copy">Nu există meciuri înregistrate încă.</p>}
            </div>
          </div>
          <div className="match-history-card">
            <div className="profile-section-heading"><div><p className="eyebrow">ISTORIC MECIURI</p><h2>Fiecare <em>săgeată.</em></h2></div></div>
            <div className="match-list">
              {matches.sort((a, b) => b.edition.edition - a.edition.edition || b.round_index - a.round_index).map((match) => (
                <div className="match-row" key={`${match.edition.edition}-${match.match_id}`}>
                  <span className={match.won ? 'match-form win' : 'match-form loss'}>{match.won ? 'W' : 'L'}</span>
                  <div><strong>vs. {match.opponent.name}</strong><span>{match.edition.editionLabel} · {match.round_name}</span><small className="match-averages"><b>{playerName}</b> {match.own.avg == null ? '—' : formatNumber(match.own.avg)} <i>vs</i> <b>{match.opponent.name}</b> {match.opponent.avg == null ? '—' : formatNumber(match.opponent.avg)}</small></div>
                  <b>{match.own.score ?? '—'}–{match.opponent.score ?? '—'}</b>
                </div>
              ))}
              {!matches.length && <p className="empty-copy">Nu există meciuri înregistrate încă.</p>}
            </div>
            <p className="bye-note">* Bye-urile sunt afișate în bracket, dar nu intră în bilanț sau head-to-head.</p>
          </div>
        </section>
      </main>
      <footer className="footer container"><img src="/images/alpha-logo.png" alt="Alpha Darts Sibiu" /><p>ALPHA DARTS SIBIU · LIGA 2026</p><button type="button" onClick={onBack}>Înapoi la clasament <ArrowLeft size={15} /></button></footer>
    </div>
  )
}

function App() {
  const [activeEdition, setActiveEdition] = useState(() => editions.at(-1).edition)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(playerFromHash)
  useEffect(() => {
    const syncProfileFromHash = () => setSelectedPlayer(playerFromHash())
    window.addEventListener('hashchange', syncProfileFromHash)
    return () => window.removeEventListener('hashchange', syncProfileFromHash)
  }, [])
  const currentEdition = editions.find((edition) => edition.edition === activeEdition) ?? editions.at(-1)
  const latestEdition = editions.at(-1)
  const latestWinner = latestEdition.results.find((player) => player.rank_final === 1)
  const currentResults = useMemo(
    () => currentEdition.results.map(scorePlayer).sort((a, b) => rankValue(a.rank_final) - rankValue(b.rank_final) || b.points - a.points),
    [currentEdition],
  )
  const leaderboard = useMemo(() => {
    const players = new Map()
    editions.forEach((edition) => {
      edition.results.map(scorePlayer).forEach((player) => {
        const key = player.name.trim().toLocaleLowerCase('ro-RO')
        const current = players.get(key) ?? {
          name: player.name,
          points: 0,
          tournaments: 0,
          oneEighties: 0,
          averageSum: 0,
        }
        current.points += player.points
        current.tournaments += 1
        current.oneEighties += player.score_180s
        current.averageSum += player.three_darts_average
        players.set(key, current)
      })
    })
    return [...players.values()]
      .map((player) => ({ ...player, average: player.averageSum / player.tournaments }))
      .sort((a, b) => b.points - a.points || b.average - a.average)
  }, [])

  const podium = [1, 2, 3].map((place) => currentResults.find((player) => player.rank_final === place))
  const uniquePlayers = leaderboard.length
  const total180s = editions.flatMap((edition) => edition.results).reduce((sum, player) => sum + player.score_180s, 0)
  const openPlayer = (name) => {
    window.location.hash = `jucator=${encodeURIComponent(name)}`
    setSelectedPlayer(name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const closePlayer = () => {
    window.location.hash = 'clasament'
    setSelectedPlayer(null)
  }

  if (selectedPlayer) return <PlayerProfile playerName={selectedPlayer} leaderboard={leaderboard} onBack={closePlayer} />

  return (
    <div className="site-shell">
      <div className="noise" aria-hidden="true" />
      <header className="topbar container">
        <a className="brand" href="#acasa" aria-label="Alpha Darts Sibiu — Acasă">
          <img src="/images/alpha-logo.png" alt="Alpha Darts Sibiu" />
          <span className="brand-divider" />
          <span className="brand-copy">LIGA<br /><strong>2026</strong></span>
        </a>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#clasament" onClick={() => setMenuOpen(false)}>Clasament</a>
          <a href="#editii" onClick={() => setMenuOpen(false)}>Ediții</a>
          <a href="#regulament" onClick={() => setMenuOpen(false)}>Regulament</a>
          <a className="nav-cta" href="#editii" onClick={() => setMenuOpen(false)}>Vezi rezultatele <ChevronRight size={16} /></a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Deschide meniul">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main>
        <section id="acasa" className="hero container">
          <div className="hero-copy reveal">
            <div className="eyebrow"><span className="live-dot" /> SEZON ACTIV · 2026</div>
            <p className="hero-kicker">CUPA</p>
            <h1>ALPHA<br /><em>DARTS</em></h1>
            <p className="hero-description">Fiecare săgeată contează. Urmărește parcursul jucătorilor, statisticile și lupta pentru primul loc în liga Alpha Darts Sibiu.</p>
            <div className="hero-actions">
              <a href="#clasament" className="button button-primary">Clasament general <ArrowDownRight size={18} /></a>
              <a href="#editii" className="button button-ghost">Rezultate ediții</a>
            </div>
            <div className="hero-metrics">
              <div><strong>{String(editions.length).padStart(2, '0')}</strong><span>ediții jucate</span></div>
              <div><strong>{uniquePlayers}</strong><span>jucători în clasament</span></div>
              <div><strong>{total180s}</strong><span>aruncări de 180</span></div>
            </div>
          </div>
          <div className="hero-visual reveal-delay">
            <div className="hero-image-wrap">
              <img src={latestEdition.action} alt={`Acțiune de la ${latestEdition.editionLabel} Alpha Darts`} />
            </div>
            <div className="edition-stamp">
              <span>ULTIMA EDIȚIE</span>
              <strong>{String(latestEdition.edition).padStart(2, '0')}</strong>
              <small>{formatShortDate(latestEdition.date)}</small>
            </div>
            <div className="hero-caption"><Trophy size={17} /> {latestWinner?.name} câștigă Ediția {latestEdition.edition}</div>
            <div className="dart-orbit" aria-hidden="true"><Target size={26} /></div>
          </div>
        </section>

        <section id="clasament" className="leaderboard-section container section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CLASAMENT GENERAL</p>
              <h2>Race to <em>the top.</em></h2>
            </div>
            <div className="season-chip"><CalendarDays size={15} /> Sezon 2026</div>
          </div>

          <div className="leaderboard-layout">
            <article className="leader-feature">
              <div className="feature-topline"><span>LEADER ACTUAL</span><Sparkles size={18} /></div>
              <div className="feature-rank">01</div>
              <div className="feature-player">
                <div className="player-mark">{leaderboard[0]?.name.split(' ').map((name) => name[0]).join('')}</div>
                <div><button className="player-link feature-player-link" type="button" onClick={() => openPlayer(leaderboard[0]?.name)}><h3>{leaderboard[0]?.name}</h3></button><p>{leaderboard[0]?.tournaments} participări · {leaderboard[0]?.oneEighties} × 180 · AVG. {formatNumber(leaderboard[0]?.average ?? 0)}</p></div>
              </div>
              <div className="feature-points"><strong>{formatNumber(leaderboard[0]?.points ?? 0)}</strong><span>puncte</span></div>
              <div className="feature-line"><span style={{ width: '100%' }} /></div>
              <p className="feature-note"><Flame size={16} /> Poziția se actualizează după fiecare ediție.</p>
            </article>

            <div className="leaderboard-table-wrap">
              <div className="table-labels"><span>LOC</span><span>JUCĂTOR</span><span>PUNCTE</span><span>ED.</span><span>AVG. 3 DARTS</span></div>
              {leaderboard.slice(1, showAllPlayers ? undefined : 9).map((player, index) => (
                <div className="leader-row" key={player.name}>
                  <span className="rank">{String(index + 2).padStart(2, '0')}</span>
                  <button className="row-player player-link" type="button" onClick={() => openPlayer(player.name)}><i>{player.name.split(' ').map((name) => name[0]).join('')}</i>{player.name}</button>
                  <strong>{formatNumber(player.points)}</strong>
                  <span>{player.tournaments}/{editions.length}</span>
                  <span>{formatNumber(player.average)}</span>
                </div>
              ))}
              <button className="all-players" type="button" onClick={() => setShowAllPlayers((value) => !value)}>
                {showAllPlayers ? 'Restrânge clasamentul' : 'Vezi toți jucătorii'}
                {showAllPlayers ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </button>
            </div>
          </div>
        </section>

        <section id="editii" className="edition-section section">
          <div className="container">
            <div className="section-heading edition-heading">
              <div>
                <p className="eyebrow">ARHIVA SEZONULUI</p>
                <h2>Rezultatele <em>edițiilor.</em></h2>
              </div>
              <div className="edition-switch" role="tablist" aria-label="Alege ediția">
                {editions.map((edition) => (
                  <button key={edition.edition} className={activeEdition === edition.edition ? 'active' : ''} onClick={() => setActiveEdition(edition.edition)} role="tab" aria-selected={activeEdition === edition.edition}>
                    <span>{edition.editionLabel}</span><strong>{edition.date.slice(5).replace('-', '.')}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="edition-showcase" key={currentEdition.edition}>
              <article className="edition-story">
                <img src={currentEdition.cover} alt={`Podium ${currentEdition.editionLabel}`} />
                <div className="story-shade" />
                <div className="story-content">
                  <span>{currentEdition.editionLabel} · {formatDate(currentEdition.date)}</span>
                  <h3>{currentEdition.title}</h3>
                  <p><Crosshair size={15} /> {currentEdition.venue}</p>
                </div>
              </article>
              <div className="podium">
                <div className="podium-heading"><Trophy size={18} /> PODIUMUL EDIȚIEI</div>
                <div className="podium-cards">
                  {[podium[1], podium[0], podium[2]].map((player) => {
                    const position = player.rank_final
                    return <div className={`podium-card place-${position}`} key={player.name}>
                      <div className="medal">{position === 1 ? <Trophy size={20} /> : <Medal size={20} />}</div>
                      <span>LOCUL {position}</span>
                      <button className="player-link podium-player-link" type="button" onClick={() => openPlayer(player.name)}><h4>{player.name}</h4></button>
                      <strong>{formatNumber(player.points)} <small>pct</small></strong>
                      <p>AVG. {formatNumber(player.three_darts_average)}</p>
                    </div>
                  })}
                </div>
                <div className="edition-mini-stats">
                  <div><UsersRound size={17} /><span><b>{currentResults.length}</b> participanți</span></div>
                  <div><Zap size={17} /><span><b>{currentResults.reduce((sum, player) => sum + player.score_180s, 0)}</b> aruncări de 180</span></div>
                  <div><Target size={17} /><span><b>{formatNumber(Math.max(...currentResults.map((player) => player.three_darts_average)))}</b> cea mai bună medie</span></div>
                </div>
              </div>
            </div>

            <div className="results-card">
              <div className="results-title">
                <div><span>CLASAMENT FINAL</span><h3>{currentEdition.title} <em>{currentEdition.editionLabel}</em></h3></div>
                <div className="results-title-actions">
                  <p>Actualizat după încheierea turneului</p>
                  {currentEdition['full-results-url'] && (
                    <a href={currentEdition['full-results-url']} target="_blank" rel="noreferrer">
                      Vezi rezultatele complete pe N01 <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              <div className="results-table">
                <div className="results-head"><span>LOC</span><span>JUCĂTOR</span><span>PUNCTE</span><span>AVG.</span><span>180</span><span>HIGH FINISH</span></div>
                {currentResults.map((player) => (
                  <div className="result-row" key={player.name}>
                    <span className={`place-badge place-badge-${placeBadge(player.rank_final)}`}>{player.rank_final ?? '—'}</span>
                    <button className="result-name player-link" type="button" onClick={() => openPlayer(player.name)}>{player.name}</button>
                    <strong>{formatNumber(player.points)}</strong>
                    <span>{formatNumber(player.three_darts_average)}</span>
                    <span className={player.score_180s ? 'stat-hot' : ''}>{player.score_180s || '—'}</span>
                    <span className={player.high_finish > 100 ? 'stat-hot' : ''}>{player.high_finish || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="gallery-section container section">
          <div className="gallery-copy">
            <p className="eyebrow">DIN SPATELE TABLEI</p>
            <h2>Focus.<br /><em>Fire.</em><br />Fellowship.</h2>
            <p>Alpha Darts are casă nouă: o zonă de joc amenajată pentru seri de darts, meciuri și comunitate.</p>
            <div className="venue-credit">
              <div className="venue-credit-icon"><MapPin size={19} /></div>
              <div><span>LOCAȚIA NOASTRĂ</span><strong>Silvana Caffe-Pub</strong><small>Complex Cedonia, Sibiu</small></div>
            </div>
          </div>
          <div className="venue-content">
            <div className="gallery-grid">
              <img className="gallery-large" src="/images/silvana-darts-lanes.jpeg" alt="Zona de darts de la Silvana Caffe-Pub" />
              <img src="/images/silvana-darts-play.jpeg" alt="Jucători Alpha Darts la Silvana Caffe-Pub" />
              <img src="/images/silvana-darts-wide.jpeg" alt="Atmosfera de joc la Silvana Caffe-Pub" />
            </div>
            <div className="venue-partner-card">
              <div className="partner-card-copy"><span>PARTENERI LOCAȚIE</span><h3>Aceeași casă.<br /><em>Două specializări.</em></h3><p>Mulțumim echipei care a pus la dispoziție infrastructura și echipamentele de darts pentru comunitatea Alpha Darts Sibiu.</p></div>
              <div className="partner-links">
                <a href="https://www.facebook.com/profile.php?id=100057303765565" target="_blank" rel="noreferrer">Silvana Caffe-Pub <ExternalLink size={15} /></a>
                <a href="https://www.facebook.com/profile.php?id=61567108509858" target="_blank" rel="noreferrer">Private Society Events <ExternalLink size={15} /></a>
              </div>
            </div>
          </div>
        </section>

        <section id="regulament" className="rules-section">
          <div className="container rules-layout">
            <div><p className="eyebrow">REGULAMENT CLASAMENT</p><h2>Fiecare <em>punct</em><br />se câștigă.</h2></div>
            <div className="rules-content">
              <p>Punctajul anual include poziția finală din fiecare ediție și bonusurile obținute la masă. Participanții primesc puncte; absențele nu punctează.</p>
              <div className="rule-pills"><span><Trophy size={15} /> poziție finală</span><span><Flame size={15} /> +10 / 180</span><span><Target size={15} /> finish 100+</span><span><Zap size={15} /> avg. 3 darts / 10</span></div>
              <div className="point-scale"><span>1 <b>100</b></span><span>2 <b>80</b></span><span>3 <b>70</b></span><span>4 <b>60</b></span><span>5–8 <b>45</b></span><span>9–16 <b>30</b></span><span>17–32 <b>20</b></span><span>33+ <b>10</b></span></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer container">
        <img src="/images/alpha-logo.png" alt="Alpha Darts Sibiu" />
        <p>ALPHA DARTS SIBIU · LIGA 2026</p>
        <a href="#acasa">Înapoi sus <ArrowUpRight size={15} /></a>
      </footer>
    </div>
  )
}

export default App
