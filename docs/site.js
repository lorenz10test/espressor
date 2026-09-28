/* Espressoare Premium · prototip funcțional (fără server).
   Datele se salvează în browser (localStorage), ca adminul să poată fi demonstrat. */
(() => {
'use strict';

/* ---------- utilitare ---------- */
const IMG = 'img/';
const LS_DB = 'ep-db-v1', SS_ADMIN = 'ep-admin';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('ro-RO');
const clone = o => JSON.parse(JSON.stringify(o));
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
const store = {
  get(k, area = localStorage) { try { return area.getItem(k); } catch { return null; } },
  set(k, v, area = localStorage) { try { area.setItem(k, v); return true; } catch { return false; } },
  del(k, area = localStorage) { try { area.removeItem(k); } catch {} }
};

let DB = (() => { const s = store.get(LS_DB); if (s) { try { const d = JSON.parse(s); if (d && d.version === window.DB_DEFAULT.version) return d; } catch {} } return clone(window.DB_DEFAULT); })();
function save() { save.ok = store.set(LS_DB, JSON.stringify(DB)); if (!save.ok) toast('Nu am putut salva. Poate poza e prea mare. Încearcă una mai mică.'); return save.ok; }
save.ok = true;
(function migrate() {   // date salvate de o versiune mai veche a demo-ului: completăm ce lipsește
  const D = window.DB_DEFAULT;
  for (const k of Object.keys(D)) if (DB[k] == null) DB[k] = clone(D[k]);
  for (const k of Object.keys(D.settings)) if (DB.settings[k] == null) DB.settings[k] = clone(D.settings[k]);
  if (!Array.isArray(DB.admins) || !DB.admins.length) DB.admins = clone(D.admins);
  DB.parts.forEach(p => { p.status = p.status || 'activ'; p.compat = p.compat || []; });
  DB.machines.forEach(m => { m.status = m.status || 'activ'; m.specs = m.specs || []; m.checked = m.checked || []; });
})();

const imgSrc = s => !s ? '' : (s.startsWith('data:') || s.startsWith('http')) ? s : IMG + s;
const waLink = t => `https://wa.me/${DB.settings.wa}?text=${encodeURIComponent(t)}`;
const telLink = () => 'tel:' + String(DB.settings.tel).replace(/[^\d+]/g, '');
const WA = '<svg class="wa-ico" aria-hidden="true"><use href="#wa"/></svg>';
const LOGO = '<svg aria-hidden="true"><use href="#logo"/></svg>';
const active = arr => arr.filter(x => (x.status || 'activ') !== 'ascuns');

function priceHTML(o, cls = 'pr') {
  if (o.priceType === 'cerere' || o.price == null || o.price === '') return `<span class="${cls} q">Preț la cerere</span>`;
  if (o.priceType === 'de-la') return `<span class="${cls}"><small>de la</small>${fmt(o.price)} lei</span>`;
  return `<span class="${cls}">${fmt(o.price)} lei</span>`;
}
function priceText(o) {
  if (o.priceType === 'cerere' || o.price == null || o.price === '') return 'preț la cerere';
  return (o.priceType === 'de-la' ? 'de la ' : '') + fmt(o.price) + ' lei';
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2800);
}
const typeLabel = { profesional: 'Profesional', automat: 'Automat', manual: 'Manual', capsule: 'Capsule' };
const stockLabel = { stoc: 'Pe stoc', comanda: 'La comandă, 2–4 zile', epuizat: 'Epuizat momentan' };

/* ---------- icons pentru piese ---------- */
const PART_ICON = {
  'Garnituri': '<circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="9"/>',
  'Site de duș': '<circle cx="24" cy="24" r="15"/><g stroke-width="2.4"><path d="M18 19h.01M24 19h.01M30 19h.01M18 25h.01M24 25h.01M30 25h.01M21 31h.01M27 31h.01"/></g>',
  'Portafiltre și coșuri': '<path d="M9 17h22v5a11 11 0 0 1-22 0z"/><path d="M31 20h11"/><path d="M17 33l-2 5M23 33l2 5"/>',
  'Pompe': '<rect x="8" y="16" width="22" height="16" rx="4"/><path d="M30 24h10M40 18v12M4 24h4"/>',
  'Rezistențe': '<path d="M8 12h6v24h6V14h6v22h6V14h6v24h4"/>',
  'Electrovalve': '<rect x="14" y="8" width="20" height="16" rx="3"/><path d="M24 24v6M8 34h32M12 30h24v8H12z"/>',
  'Presostate și manometre': '<circle cx="24" cy="24" r="15"/><path d="M24 24l7-7M14 30h20"/>',
  'Filtre de apă': '<rect x="15" y="6" width="18" height="36" rx="6"/><path d="M15 16h18M15 32h18"/>'
};
const partIcon = c => `<svg viewBox="0 0 48 48" fill="none" stroke="#e7c496" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PART_ICON[c] || '<circle cx="24" cy="24" r="14"/>'}</svg>`;

/* ================================================================
   CHROME (topbar, header, drawer, footer, fab, bara mobil)
   ================================================================ */
const NAV = [
  { href: '#/service', label: 'Service', dd: [
    ['#/service', 'Prețuri și servicii', 'Ce facem și cât costă'],
    ['#/reparatie', 'Cere o reparație', 'Diagnostic în 4 pași, pe WhatsApp'],
    ['#/horeca', 'Pentru cafenele', 'Abonament, aparat de schimb, comodat'] ] },
  { href: '#/espressoare', label: 'Espressoare', dd: [
    ['#/espressoare?tip=profesional', 'Profesionale', 'Pentru cafenele și restaurante'],
    ['#/espressoare?tip=automat', 'Automate', 'Pentru acasă și birou'],
    ['#/espressoare?stare=Recondi%C8%9Bionat', 'Recondiționate', 'Verificate în atelier, cu garanție'] ] },
  { href: '#/piese', label: 'Piese' },
  { href: '#/horeca', label: 'HoReCa' },
  { href: '#/contact', label: 'Contact' }
];

function renderChrome() {
  const S = DB.settings;
  $('#topbar').innerHTML = `<div class="wrap"><span><b>●</b> Venim repede în București și Ilfov. Piese și service în toată țara.</span>
    <span class="hide-s">${esc(S.hours[0][0])}: ${esc(S.hours[0][1])} · <a href="${telLink()}"><b>${esc(S.phone)}</b></a></span></div>`;
  $('#hdr').innerHTML = `<div class="wrap nav">
    <a class="logo" href="#/" aria-label="Espressoare Premium, pagina principală">${LOGO}ESPRESSOARE<span>premium</span></a>
    <nav aria-label="Meniu principal"><ul class="menu">${NAV.map(n => `<li><a href="${n.href}" data-nav="${n.href}">${n.label}${n.dd ? '<span class="chev">▾</span>' : ''}</a>${n.dd ? `<div class="dd">${n.dd.map(d => `<a href="${d[0]}"><b>${d[1]}</b><small>${d[2]}</small></a>`).join('')}</div>` : ''}</li>`).join('')}</ul></nav>
    <div class="nav-cta"><a class="btn btn-ghost btn-sm hide-m" href="#/reparatie">Cere o reparație</a>
      <a class="btn btn-wa btn-sm hide-m" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}WhatsApp</a>
      <button class="burger" id="burger" aria-label="Deschide meniul" aria-expanded="false" aria-controls="drawer">☰</button></div></div>`;
  $('#drawer').innerHTML = `<button class="burger close" id="dclose" aria-label="Închide meniul">✕</button>
    <nav aria-label="Meniu mobil">
      <a href="#/">Acasă</a><a href="#/service">Service <small>prețuri</small></a><a href="#/reparatie">Cere o reparație</a>
      <a href="#/espressoare">Espressoare</a><a href="#/piese">Piese</a><a href="#/horeca">HoReCa</a><a href="#/contact">Contact</a></nav>
    <div class="dcta"><a class="btn btn-wa" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}Scrie-ne pe WhatsApp</a>
      <a class="btn btn-ghost" href="${telLink()}">Sună-ne: ${esc(S.phone)}</a></div>`;
  $('#footer').innerHTML = `<div class="wrap"><div class="fgrid">
    <div><a class="logo" href="#/">${LOGO}ESPRESSOARE<span>premium</span></a>
      <p class="muted" style="font-size:15px;line-height:1.7;margin:18px 0 20px;max-width:320px">Atelier de espressoare din București. Reparăm, recondiționăm și vindem aparate pentru cafenele și pentru acasă.</p>
      <a class="btn btn-wa btn-sm" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}${esc(S.phone)}</a></div>
    <div><h4>Service</h4><nav><a href="#/service">Prețuri</a><a href="#/reparatie">Cere o reparație</a><a href="#/horeca">Pentru cafenele</a><a href="#/service" data-scroll="faq">Întrebări frecvente</a></nav></div>
    <div><h4>Magazin</h4><nav><a href="#/espressoare">Espressoare</a><a href="#/espressoare?stare=Recondi%C8%9Bionat">Recondiționate</a><a href="#/piese">Piese de schimb</a></nav></div>
    <div><h4>Atelier</h4><span class="ln">${esc(S.address)}</span>${S.hours.map(h => `<span class="ln">${esc(h[0])}: ${esc(h[1])}</span>`).join('')}<nav><a href="#/contact">Cum ajungi la noi →</a></nav></div>
  </div><div class="legal"><span>© ${new Date().getFullYear()} ${esc(S.brand)} · operat de ${esc(S.company)} · CUI ${esc(S.cui)} · ${esc(S.regcom)}</span>
    <span><a href="#/termeni">Termeni</a> · <a href="#/confidentialitate">Confidențialitate</a> · <a href="#/admin">Admin</a></span>
    <span class="anpc"><a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener">ANPC · SAL</a><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">SOL</a></span></div></div>`;
  $('#fab').innerHTML = `<span class="bubble">Salut! Cu ce te putem ajuta?</span><a href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener" aria-label="Scrie-ne pe WhatsApp"><svg style="width:30px;height:30px;color:#fff"><use href="#wa"/></svg></a>`;
  $('#mbar').innerHTML = `<a class="call" href="${telLink()}">Sună</a><a class="wa" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}WhatsApp</a><a class="rep" href="#/reparatie">Reparație</a>`;
  $('#burger').onclick = () => toggleDrawer(true);
  $('#dclose').onclick = () => toggleDrawer(false);
}
function toggleDrawer(open) {
  const d = $('#drawer'); d.classList.toggle('open', open); d.setAttribute('aria-hidden', !open);
  $('#burger')?.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
}

/* ================================================================
   COMPONENTE
   ================================================================ */
function machineCard(m, d = '') {
  const sold = m.status === 'vandut';
  return `<a class="prod rv ${d} ${sold ? 'sold' : ''}" href="#/espressoare/${m.slug}">
    <div class="img">${m.img ? `<img src="${imgSrc(m.img)}" alt="${esc(m.name)}" loading="lazy">` : ""}<span class="tag">${esc(m.cond)}</span>${sold ? '<span class="tag sold">Vândut</span>' : ''}</div>
    <div class="body"><div class="meta">${typeLabel[m.type] || ''}${m.groups ? ` · ${m.groups} ${m.groups > 1 ? 'grupuri' : 'grup'}` : ''} · garanție ${esc(m.warranty)}</div>
      <h3>${esc(m.name)}</h3><p class="short">${esc(m.short)}</p>
      <div class="row">${sold ? '<span class="pr q">Vândut</span>' : priceHTML(m)}<span class="link">Detalii <span class="arrow">→</span></span></div></div></a>`;
}
const partThumb = p => p.img ? `<img src="${imgSrc(p.img)}" alt="${esc(p.name)}" loading="lazy">` : partIcon(p.cat);
function partRow(p) {
  return `<a class="part" href="#/piese/${p.slug}">
    <div class="ic${p.img ? ' photo' : ''}">${partThumb(p)}</div>
    <div><div class="meta">${esc(p.cat)} · cod ${esc(p.code)}</div><h3>${esc(p.name)}</h3><div class="sub">Se potrivește la: ${esc(p.compat.join(', '))}</div></div>
    <div class="end">${priceHTML(p)}<span class="stock ${p.stock}">${stockLabel[p.stock]}</span></div></a>`;
}
function priceRows(items) {
  return items.map(s => `<div class="price"><span class="n">${esc(s.name)}${s.note ? `<small>${esc(s.note)}</small>` : ''}</span><span class="dots"></span>${
    s.priceType === 'cerere' || s.price == null || s.price === '' ? '<span class="v q">la cerere</span>' : `<span class="v">${s.priceType === 'de-la' ? '<small>de la</small>' : ''}${fmt(s.price)} lei</span>`}</div>`).join('');
}
const waysHTML = () => `<div class="ways">
  <div class="way"><b>La atelier</b>Îl aduci tu, în ${esc(DB.settings.address.split(',').slice(-2).join(',').trim())}</div>
  <div class="way"><b>Prin curier</b>Din toată țara. Îți trimitem noi curierul.</div>
  <div class="way"><b>La tine în local</b>În București și Ilfov, de obicei în aceeași zi.</div></div>`;
const processHTML = () => `<div class="process">
  <div class="rv"><i>1</i><b>Ne scrii</b><p>Trimite-ne o poză cu aparatul și spune-ne ce face. Îți răspundem în aceeași zi.</p></div>
  <div class="rv d1"><i>2</i><b>Ne uităm la el</b><p>La atelier sau la tine în local. Găsim exact ce s-a stricat.</p></div>
  <div class="rv d2"><i>3</i><b>Îți spunem prețul</b><p>Nu ne apucăm de nimic până nu ești de acord.</p></div>
  <div class="rv d3"><i>4</i><b>Îl reparăm</b><p>Cu piese bune, apoi îl testăm cu cafea adevărată.</p></div>
  <div class="rv d3"><i>5</i><b>Primești garanție</b><p>Scrisă, pentru manoperă și pentru piesele montate.</p></div></div>`;
const faqHTML = (n) => `<div class="faq" id="faq">${DB.faq.slice(0, n || 99).map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('')}</div>`;
const horecaList = () => `<div class="hlist">${DB.horeca.map(h => `<div><span class="ico" aria-hidden="true">${esc(h.icon)}</span><b>${esc(h.title)}</b><p>${esc(h.text)}</p><small>${esc(h.price)}</small></div>`).join('')}</div>`;
const pageHead = (crumb, eyebrow, title, lead) => `<div class="page-head"><div class="wrap">
  <nav class="crumbs" aria-label="Ești aici"><a href="#/">Acasă</a><span>/</span>${crumb}</nav>
  <div class="eyebrow" style="margin-top:22px">${eyebrow}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></div>`;

/* --- diagnostic în 4 pași --- */
const DIAG_TYPES = [['Profesional 1 grup', 'Profesional', '1 grup'], ['Profesional 2 grupuri', 'Profesional', '2 grupuri'], ['Profesional 3–4 grupuri', 'Profesional', '3–4 grupuri'],
  ['Profesional cu pârghie', 'Cu pârghie', 'lever, profesional'], ['Superautomat HoReCa/birou', 'Superautomat', 'HoReCa sau birou'], ['Automat de casă', 'Automat', 'de casă, cu râșniță'],
  ['Manual de casă', 'Manual', 'de casă, cu portafiltru'], ['Espressor cu capsule', 'Capsule', 'Nespresso, Dolce Gusto…'], ['Râșniță', 'Râșniță', 'profesională sau de casă'], ['Aparat cafea filtru', 'Cafea la filtru', 'batch brew']];
const DIAG_PB = [['Nu face presiune', '250–900', '57% 63%', 2.2, 'pompă, presostat'], ['Curge apă din grup', '180–400', '35% 45%', 2.4, 'garnituri, site'],
  ['Nu încălzește', '300–1.200', '60% 20%', 2, 'rezistență, calcar'], ['Abur slab sau deloc', '150–450', '21% 57%', 2.4, 'robinet, lance'],
  ['Dozele nu mai ies bine', 'cerere', '46% 30%', 2.2, 'electronică, debitmetre'], ['Vreau o revizie', '900–1.600', '60% 50%', 1, 'întreținere preventivă']];
function diagHTML() {
  const brands = ['La Marzocco', 'La Cimbali', 'Faema', 'Nuova Simonelli', 'Victoria Arduino', 'Astoria', 'Rancilio', 'Wega', 'Expobar', 'Gaggia', 'Lelit', 'Rocket', 'Sage', 'DeLonghi', 'Philips', 'Saeco', 'Jura', 'Siemens', 'Melitta', 'Krups', 'Nespresso', 'Mazzer', 'Eureka', 'Fiorenzato'];
  return `<div class="dg">
    <div class="dg-vis" id="dgv"><img src="${IMG}hero.jpg" alt="Espressor profesional"><div class="dg-tag" id="dgtag">Alege problema și îți arătăm zona</div></div>
    <div class="dg-panel" id="dgp">
      <div class="prog" aria-hidden="true"><span class="on"></span><span></span><span></span><span></span><span></span></div>
      <form class="step on" id="s1" novalidate><div class="sn">Pasul 1 din 4</div><h3>Ce aparat ai?</h3>
        <div class="opts opts3">${DIAG_TYPES.map(t => `<button type="button" class="opt" data-k="tip" data-v="${t[0]}">${t[1]}<small>${t[2]}</small></button>`).join('')}
          <button type="button" class="opt" data-k="tip" data-v="Alt tip" data-other="1" style="grid-column:span 2">Alt tip de aparat<small>ni-l descrii tu</small></button></div>
        <div class="f" id="otherWrap" hidden style="margin-top:12px"><label for="fo">Ce aparat este? *</label><input id="fo" placeholder="de exemplu, un espressor de bar mai vechi"></div>
        <div class="f2" style="margin-top:14px"><div class="f"><label for="fb">Marca *</label><input id="fb" list="brands" autocomplete="off" placeholder="de exemplu, La Cimbali"></div>
          <div class="f"><label for="fm">Modelul *</label><input id="fm" placeholder="de exemplu, M39"></div></div>
        <datalist id="brands">${brands.map(b => `<option>${b}</option>`).join('')}</datalist>
        <p class="err" id="e1" hidden></p>
        <p class="muted" style="font-size:13.5px;margin:2px 0 16px">Nu știi modelul? E scris pe eticheta din spate sau sub tava de scurgere.</p>
        <button class="btn btn-primary btn-block">Mai departe →</button></form>
      <div class="step"><div class="sn">Pasul 2 din 4</div><h3>Ce face aparatul?</h3><div class="opts">
        ${DIAG_PB.map(p => `<button type="button" class="opt" data-k="pb" data-v="${p[0]}" data-r="${p[1]}" data-op="${p[2]}" data-sc="${p[3]}">${p[0]}<small>${p[4]}</small></button>`).join('')}
        <button type="button" class="opt" data-k="pb" data-v="Altă problemă" data-r="diag" data-op="60% 50%" data-sc="1" style="grid-column:1/-1">Altceva<small>ne povestești la pasul 4</small></button></div></div>
      <div class="step"><div class="sn">Pasul 3 din 4</div><h3>Cum ajunge aparatul la noi?</h3><div class="opts">
        <button type="button" class="opt" data-k="pred" data-v="Îl aduc eu la atelier">La atelier<small>îl aduci tu</small></button>
        <button type="button" class="opt" data-k="pred" data-v="Îl trimit prin curier">Prin curier<small>din toată țara</small></button>
        <button type="button" class="opt" data-k="pred" data-v="Vreau să veniți la mine (București/Ilfov)">Veniți voi<small>București și Ilfov</small></button>
        <button type="button" class="opt" data-k="pred" data-v="Am nevoie de un aparat de schimb">Aparat de schimb<small>localul nu se oprește</small></button></div></div>
      <form class="step" id="s4" novalidate><div class="sn">Pasul 4 din 4</div><h3>Cum te găsim?</h3>
        <div class="f2"><div class="f"><label for="fn">Numele tău</label><input id="fn" autocomplete="name" placeholder="Andrei Popescu"></div>
          <div class="f"><label for="fl">Localitatea</label><input id="fl" autocomplete="address-level2" placeholder="București, Sector 2"></div></div>
        <div class="f"><label for="fp">Mai vrei să ne spui ceva? <span class="muted">(opțional)</span></label><textarea id="fp" rows="3" placeholder="de exemplu: se oprește după câteva cafele"></textarea></div>
        <button class="btn btn-primary btn-block">Vezi cât ar costa →</button></form>
      <div class="step"><div class="res"><div class="eyebrow">Cam atât ar costa</div><div class="range" id="rng"></div>
        <p class="muted" style="font-size:14px;margin:0">E o estimare. Prețul exact ți-l spunem după ce vedem aparatul și nu ne apucăm de nimic fără acordul tău.</p>
        <div class="msg" id="msg"></div>
        <a class="btn btn-wa btn-block" id="send" target="_blank" rel="noopener">${WA}Trimite pe WhatsApp</a>
        <p class="muted" style="font-size:13px;text-align:center;margin:10px 0 0">Se deschide WhatsApp cu mesajul gata scris. Acolo ne poți trimite și poze.</p></div></div>
      <button class="back" id="dgback" hidden>← Înapoi</button>
    </div></div>`;
}
function mountDiag() {
  const root = $('#dgp'); if (!root) return;
  const ans = {}, st = $$('.step', root), bars = $$('.prog span', root), vis = $('#dgv'), tag = $('#dgtag'), back = $('#dgback');
  const v = id => $('#' + id).value.trim(); let cur = 0;
  const go = n => {
    cur = n; st.forEach((s, i) => s.classList.toggle('on', i === n)); bars.forEach((b, i) => b.classList.toggle('on', i <= n)); back.hidden = !n;
    if (n === 4) {
      $('#rng').textContent = ans.r === 'cerere' ? 'Preț la cerere' : ans.r === 'diag' ? 'După diagnostic' : ans.r + ' lei';
      const lines = ['Bună ziua! Am nevoie de o reparație.', `Aparat: ${ans.tip === 'Alt tip' ? v('fo') : ans.tip}`, `Marca și modelul: ${v('fb')} ${v('fm')}`,
        `Problema: ${ans.pb}`, v('fp') && `Detalii: ${v('fp')}`, `Cum ajunge la voi: ${ans.pred}`, v('fn') && `Nume: ${v('fn')}`, v('fl') && `Localitate: ${v('fl')}`].filter(Boolean);
      $('#msg').textContent = lines.join('\n'); $('#send').href = waLink(lines.join('\n'));
    }
    if (innerWidth < 1020) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $$('.opt', root).forEach(o => o.onclick = () => {
    $$('.opt', o.parentNode).forEach(x => x.classList.toggle('sel', x === o)); ans[o.dataset.k] = o.dataset.v;
    if (o.closest('#s1')) { $('#otherWrap').hidden = !o.dataset.other; if (o.dataset.other) $('#fo').focus(); return; }
    if (o.dataset.r) { ans.r = o.dataset.r; vis.style.setProperty('--op', o.dataset.op); vis.style.setProperty('--sc', o.dataset.sc); tag.textContent = 'Zona: ' + o.dataset.v.toLowerCase(); }
    if (root.dataset.busy) return; root.dataset.busy = 1; const next = cur + 1; setTimeout(() => { delete root.dataset.busy; go(next); }, 280);
  });
  $('#s1').onsubmit = e => {
    e.preventDefault(); const miss = [], e1 = $('#e1');
    $$('#s1 input').forEach(i => i.classList.remove('bad'));
    if (!ans.tip) miss.push('tipul aparatului');
    if (ans.tip === 'Alt tip' && !v('fo')) { miss.push('ce aparat este'); $('#fo').classList.add('bad'); }
    if (!v('fb')) { miss.push('marca'); $('#fb').classList.add('bad'); }
    if (!v('fm')) { miss.push('modelul'); $('#fm').classList.add('bad'); }
    if (miss.length) { e1.textContent = 'Mai avem nevoie de: ' + miss.join(', ') + '.'; e1.hidden = false; return; }
    e1.hidden = true; go(1);
  };
  $('#s4').onsubmit = e => { e.preventDefault(); go(4); };
  back.onclick = () => go(Math.max(cur - 1, 0));
}

/* --- vederea explodată la scroll --- */
const HS = [['Carcasă din inox', '78%', '24%', '', '#/service'], ['Boiler și rezistență', '27%', '41%', 'l', '#/piese?cat=Rezisten%C8%9Be'],
  ['Grup de extracție', '66%', '56%', '', '#/piese?cat=Site%20de%20du%C8%99'], ['Garnituri și site', '35%', '64.5%', 'l', '#/piese?cat=Garnituri'],
  ['Portafiltre', '72%', '74%', '', '#/piese?cat=Portafiltre%20%C8%99i%20co%C8%99uri']];
const catLink = href => { const m = href.match(/cat=(.+)$/); return !m || DB.partCats.includes(decodeURIComponent(m[1])) ? href : '#/piese'; };
const explodeHTML = () => `<section class="explode" id="explode" aria-label="Aparatul desfăcut în piese"><div class="wrap stick">
  <div><div class="eyebrow">Îl știm pe dinăuntru</div><h2 style="margin-top:14px">Piesă cu piesă,<br><em>șurub cu șurub.</em></h2>
    <p class="lead" style="margin-top:18px">Știm ce se ascunde sub carcasă, de la garnitura de grup până la boiler. Derulează încet și apasă pe piese.</p>
    <ul class="steps-ex" id="exsteps">${HS.map((h, i) => `<li><span>${['i.', 'ii.', 'iii.', 'iv.', 'v.'][i]}</span>${h[0]}</li>`).join('')}</ul>
    <a class="btn btn-ghost" href="#/piese" style="margin-top:26px">Vezi toate piesele <span class="arrow">→</span></a></div>
  <div class="stage" id="stage"><div class="clip"><img class="s-a" src="${IMG}hero.jpg" alt=""><img class="s-b" src="${IMG}explode.jpg" alt="Espressor profesional desfăcut în piese"></div>
    ${HS.map(h => `<a class="hs ${h[3]}" href="${catLink(h[4])}" style="--x:${h[1]};--y:${h[2]}"><i></i><span>${h[0]}</span></a>`).join('')}</div></div></section>`;
function mountExplode() {
  const ex = $('#explode'); if (!ex) return;
  const stage = $('#stage'), hs = $$('.hs', stage), steps = $$('#exsteps li');
  const on = () => {
    const r = ex.getBoundingClientRect(), tot = ex.offsetHeight - innerHeight, p = Math.min(Math.max(-r.top / tot, 0), 1);
    const m = Math.min(Math.max((p - .05) / .4, 0), 1), k = m * m * (3 - 2 * m); stage.style.setProperty('--k', k);
    const lp = Math.min(Math.max((p - .45) / .4, 0), 1); hs.forEach((h, i) => { const s = lp > i / 5; h.classList.toggle('on', s); steps[i]?.classList.toggle('on', s); });
  };
  addEventListener('scroll', on, { passive: true }); on(); cleanups.push(() => removeEventListener('scroll', on));
}

/* ================================================================
   PAGINI
   ================================================================ */
function pgHome() {
  const S = DB.settings, feat = active(DB.machines).filter(m => m.status !== 'vandut').slice(0, 3);
  const words = ['Decalcifiere', 'Garnituri de grup', 'Pompe', 'Rezistențe', 'Revizii complete', 'Electrovalve', 'Aparate recondiționate', 'Filtre de apă', 'Lănci de abur', 'Instalare'];
  return { title: '', html: `
  <section class="hero"><div class="hero-bg"><img src="${IMG}hero.jpg" alt="" fetchpriority="high"></div>
    <div class="wrap"><div class="in">
      <div class="eyebrow rv">Service espressoare · București și Ilfov</div>
      <h1 class="rv d1">Espressorul tău,<br><em>din nou în formă.</em></h1>
      <p class="lead rv d2" style="color:#d7cabb">Când espressorul se oprește în mijlocul programului, pierzi clienți. Venim repede, găsim problema și o rezolvăm. Lucrăm cu aparate profesionale și de casă, iar piesele le avem de obicei pe stoc.</p>
      <div class="ctas rv d3"><a class="btn btn-primary" href="#/reparatie">Cere o reparație <span class="arrow">→</span></a>
        <a class="btn btn-wa" href="${waLink('Bună ziua! Am o problemă cu espressorul.')}" target="_blank" rel="noopener">${WA}Scrie-ne pe WhatsApp</a></div>
      <div class="trust rv d3"><span><i>✓</i>Răspundem în aceeași zi</span><span><i>✓</i>Afli prețul înainte să ne apucăm</span><span><i>✓</i>Garanție scrisă la fiecare lucrare</span></div>
    </div></div></section>
  <div class="ticker" aria-hidden="true"><div class="track">${[...words, ...words].map(w => `<span>${w}</span><span>·</span>`).join('')}</div></div>
  ${explodeHTML()}
  <section><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow rv">Ce facem</div><h2 class="rv d1">Tot ce ține de<br><em>espressorul tău.</em></h2></div>
      <p class="lead rv d2">De la o garnitură schimbată până la revizia completă a unui aparat cu trei grupuri.</p></div>
    <div class="grid4">
      <a class="card rv" href="#/service"><span class="num">01</span><h3>Service și reparații</h3><p>Revizii, decalcifieri, reparații. La noi în atelier, prin curier sau la tine în local.</p><span class="link">Vezi prețurile <span class="arrow">→</span></span></a>
      <a class="card rv d1" href="#/espressoare"><span class="num">02</span><h3>Espressoare</h3><p>Aparate recondiționate, verificate piesă cu piesă, și aparate noi la comandă.</p><span class="link">Vezi aparatele <span class="arrow">→</span></span></a>
      <a class="card rv d2" href="#/piese"><span class="num">03</span><h3>Piese</h3><p>Garnituri, site, pompe, rezistențe. Spune-ne modelul și găsim piesa potrivită.</p><span class="link">Caută o piesă <span class="arrow">→</span></span></a>
      <a class="card rv d3" href="#/horeca"><span class="num">04</span><h3>Pentru cafenele</h3><p>Abonament de întreținere, aparat de schimb, comodat și instalare.</p><span class="link">Află mai mult <span class="arrow">→</span></span></a>
    </div></div></section>
  <section style="padding-top:0"><div class="wrap split2">
    <div><div class="eyebrow rv">Prețuri</div><h2 class="rv d1" style="margin-top:14px">Clare,<br><em>fără surprize.</em></h2>
      <p class="lead rv d2" style="margin-top:18px">Afli costul înainte să ne apucăm de lucru. Dacă găsim altceva pe parcurs, te sunăm întâi.</p>${waysHTML()}</div>
    <div class="rv d1">${priceRows(DB.services.flatMap(c => c.items).slice(0, 6))}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:28px"><a class="btn btn-primary" href="#/reparatie">Cere o reparație <span class="arrow">→</span></a><a class="btn btn-ghost" href="#/service">Toate prețurile</a></div></div>
  </div></section>
  <section style="background:var(--bg2)"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow rv">Recondiționate și noi</div><h2 class="rv d1">Aparate<br><em>gata de lucru.</em></h2></div>
      <a class="btn btn-ghost rv" href="#/espressoare">Toate espressoarele <span class="arrow">→</span></a></div>
    <p class="lead rv" style="margin:-20px 0 36px">Fiecare aparat recondiționat trece prin atelier: îl desfacem, îl curățăm, schimbăm ce e uzat și îl testăm cu cafea adevărată.</p>
    <div class="grid3">${feat.map((m, i) => machineCard(m, ['', 'd1', 'd2'][i])).join('')}</div></div></section>
  <section><div class="wrap"><div class="horeca rv">
    <div class="eyebrow">Pentru cafenele, restaurante și hoteluri</div>
    <h2 style="margin-top:14px;max-width:720px">La o cafenea, aparatul<br><em>nu are voie să stea.</em></h2>
    ${horecaList()}
    <div style="margin-top:34px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="#/horeca">Vezi ce îți putem oferi <span class="arrow">→</span></a>
      <a class="btn btn-wa" href="${waLink('Bună ziua! Am o cafenea și aș vrea o ofertă de întreținere.')}" target="_blank" rel="noopener">${WA}Cere o ofertă</a></div></div></div></section>
  <section style="padding-top:0"><div class="wrap"><div class="eyebrow rv">Cum lucrăm</div><h2 class="rv d1" style="margin:14px 0 56px">Simplu, <em>de la primul mesaj.</em></h2>${processHTML()}</div></section>
  <section style="background:var(--bg2)" id="diagnostic"><div class="wrap">
    <div class="sec-head"><div><div class="eyebrow rv">Diagnostic în 4 pași</div><h2 class="rv d1">Ce are<br><em>espressorul tău?</em></h2></div>
      <p class="lead rv d2">Răspunzi la câteva întrebări și îți spunem cam cât ar costa. Mesajul pleacă apoi pe WhatsApp, unde ne poți trimite și poze.</p></div>
    <div class="rv">${diagHTML()}</div></div></section>
  <section><div class="wrap split2"><div><div class="eyebrow rv">Întrebări frecvente</div><h2 class="rv d1" style="margin-top:14px">Ce ne întreabă<br><em>lumea des.</em></h2>
    <p class="lead rv d2" style="margin-top:18px">Nu găsești răspunsul? Scrie-ne, durează un minut.</p>
    <a class="btn btn-wa rv d3" style="margin-top:24px" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}Întreabă-ne</a></div>
    <div class="rv d1">${faqHTML(4)}</div></div></section>`,
    mount() { mountExplode(); mountDiag(); } };
}

function pgMachines(_, q) {
  const state = { tip: q.get('tip') || 'toate', stare: q.get('stare') || 'toate', sort: 'rec' };
  const chips = (k, opts) => opts.map(o => `<button class="chip ${state[k] === o[0] ? 'on' : ''}" data-k="${k}" data-v="${o[0]}" aria-pressed="${state[k] === o[0]}">${o[1]}</button>`).join('');
  return { title: 'Espressoare', html: pageHead('<span>Espressoare</span>', 'Recondiționate și noi', 'Espressoare <em>gata de lucru.</em>',
    'Aparatele recondiționate le-am desfăcut, curățat și testat noi, în atelier. Toate vin cu garanție scrisă. Dacă nu găsești ce cauți, spune-ne și îți căutăm noi.') +
    `<div class="wrap" style="padding-bottom:90px"><div class="filters" id="flt">
      ${chips('tip', [['toate', 'Toate'], ['profesional', 'Profesionale'], ['automat', 'Automate'], ['manual', 'Manuale']])}<span class="fsep"></span>
      ${chips('stare', [['toate', 'Oricare'], ['Recondiționat', 'Recondiționate'], ['Nou', 'Noi']])}
      <label class="sr" for="sort">Ordonează</label><select class="select" id="sort"><option value="rec">Recomandate</option><option value="asc">Preț crescător</option><option value="desc">Preț descrescător</option></select>
      <span class="count" id="cnt"></span></div><div class="grid3" id="grid"></div></div>`,
    mount() {
      const draw = () => {
        let list = active(DB.machines).filter(m => (state.tip === 'toate' || m.type === state.tip) && (state.stare === 'toate' || m.cond === state.stare));
        const pv = m => m.priceType === 'cerere' || m.price == null ? Infinity : +m.price;
        if (state.sort === 'asc') list.sort((a, b) => pv(a) - pv(b)); if (state.sort === 'desc') list.sort((a, b) => (pv(b) === Infinity ? -1 : pv(b)) - (pv(a) === Infinity ? -1 : pv(a)));
        list.sort((a, b) => (a.status === 'vandut') - (b.status === 'vandut'));
        $('#cnt').textContent = list.length === 1 ? '1 aparat' : list.length + ' aparate';
        $('#grid').innerHTML = list.length ? list.map(m => machineCard(m)).join('') : `<div class="empty" style="grid-column:1/-1"><h3>Nimic aici, deocamdată.</h3><p>Aparatele se vând repede. Spune-ne ce cauți și te anunțăm când intră unul potrivit.</p>
          <a class="btn btn-wa" href="${waLink('Bună ziua! Caut un espressor și aș vrea să mă anunțați când aveți unul potrivit.')}" target="_blank" rel="noopener">${WA}Anunță-mă</a></div>`;
        reveal();
      };
      $('#flt').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; state[b.dataset.k] = b.dataset.v; $$(`.chip[data-k="${b.dataset.k}"]`).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); };
      $('#sort').onchange = e => { state.sort = e.target.value; draw(); };
      draw();
    } };
}

function pgMachine([slug]) {
  const m = DB.machines.find(x => x.slug === slug && x.status !== 'ascuns'); if (!m) return pgNotFound();
  const sold = m.status === 'vandut';
  const others = active(DB.machines).filter(x => x.slug !== slug && x.status !== 'vandut').slice(0, 3);
  const ask = `Bună ziua! Mă interesează: ${m.name} (${m.cond}, ${priceText(m)}). Mai este disponibil?`;
  return { title: m.name, html: `<div class="wrap">
    <nav class="crumbs" style="padding-top:34px" aria-label="Ești aici"><a href="#/">Acasă</a><span>/</span><a href="#/espressoare">Espressoare</a><span>/</span><span>${esc(m.name)}</span></nav>
    <div class="pd"><div><div class="main-img" id="zoom" title="Apasă pentru zoom">${m.img ? `<img src="${imgSrc(m.img)}" alt="${esc(m.name)}">` : ""}<span class="tag">${esc(m.cond)}</span>${sold ? '<span class="tag sold">Vândut</span>' : ''}</div>
      <p class="muted" style="font-size:13px;margin-top:10px">Apasă pe poză ca s-o mărești. Vrei mai multe poze sau un video? Ți le trimitem pe WhatsApp.</p></div>
      <div><div class="meta">${typeLabel[m.type] || ''}${m.groups ? ` · ${m.groups} ${m.groups > 1 ? 'grupuri' : 'grup'}` : ''}</div><h1>${esc(m.name)}</h1><p class="lead">${esc(m.short)}</p>
        ${sold ? '<span class="pr q" style="display:block;margin:18px 0 6px;font-size:28px">Acest aparat s-a vândut</span>' : priceHTML(m)}
        <p class="muted" style="font-size:14px;margin:0">Garanție ${esc(m.warranty)} · factură · livrare în toată țara</p>
        <div class="actions">${sold
          ? `<a class="btn btn-wa" href="${waLink(`Bună ziua! Am văzut că ${m.name} s-a vândut. Mă anunțați când aveți unul asemănător?`)}" target="_blank" rel="noopener">${WA}Anunță-mă când apare altul</a>`
          : `<a class="btn btn-wa" href="${waLink(ask)}" target="_blank" rel="noopener">${WA}Întreabă de aparat</a>`}
          <a class="btn btn-ghost" href="${telLink()}">Sună: ${esc(DB.settings.phone)}</a></div>
        <div class="box"><h3 style="font-size:22px;margin-bottom:12px">Ce am făcut la el</h3><ul class="checks">${m.checked.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
        <div class="box"><h3 style="font-size:22px;margin-bottom:6px">Povestea aparatului</h3><p class="muted" style="line-height:1.75;margin:0">${esc(m.desc)}</p></div>
        <div class="box"><h3 style="font-size:22px;margin-bottom:6px">Detalii tehnice</h3><table class="specs">${m.specs.map(s => `<tr><td>${esc(s[0])}</td><td>${esc(s[1])}</td></tr>`).join('')}</table></div>
      </div></div></div>
    ${others.length ? `<section style="background:var(--bg2);padding:80px 0"><div class="wrap"><h2 style="font-size:40px;margin-bottom:34px">Te-ar mai putea <em>interesa</em></h2><div class="grid3">${others.map(o => machineCard(o)).join('')}</div></div></section>` : ''}`,
    mount() { const z = $('#zoom'); z.onclick = () => z.classList.toggle('zoom'); } };
}

function pgParts(_, q) {
  const state = { cat: q.get('cat') || 'toate', q: '', stoc: false };
  return { title: 'Piese de schimb', html: pageHead('<span>Piese</span>', 'Piese de schimb', 'Piesa potrivită, <em>din prima.</em>',
    'Caută după nume, cod sau model de aparat. Nu ești sigur că se potrivește? Trimite-ne o poză cu piesa veche și marca aparatului, și îți spunem noi.') +
    `<div class="wrap" style="padding-bottom:90px">
      <div class="filters" style="margin-bottom:12px"><label class="sr" for="pq">Caută</label><input class="search" id="pq" type="search" placeholder="Caută: garnitură, pompă, M39, cod piesă…" autocomplete="off">
        <label class="chip" style="display:inline-flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="pst" style="accent-color:#e7c496"> Doar ce e pe stoc</label></div>
      <div class="filters" id="pc" style="margin-top:0"><button class="chip ${state.cat === 'toate' ? 'on' : ''}" data-v="toate">Toate</button>${DB.partCats.map(c => `<button class="chip ${state.cat === c ? 'on' : ''}" data-v="${esc(c)}">${esc(c)}</button>`).join('')}<span class="count" id="cnt"></span></div>
      <div class="parts" id="plist"></div>
      <div class="cbox" style="margin-top:40px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap"><div><h3 style="font-size:26px">Nu găsești piesa?</h3><p class="muted" style="margin:6px 0 0">Avem mult mai multe decât apar aici. Spune-ne marca și modelul aparatului.</p></div>
        <a class="btn btn-wa" href="${waLink('Bună ziua! Caut o piesă pentru aparatul meu. Marca și modelul: ')}" target="_blank" rel="noopener">${WA}Caută-mi o piesă</a></div></div>`,
    mount() {
      const draw = () => {
        const t = state.q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const list = active(DB.parts).filter(p => (state.cat === 'toate' || p.cat === state.cat) && (!state.stoc || p.stock === 'stoc') &&
          (!t || norm([p.name, p.code, p.cat, ...p.compat].join(' ')).includes(t)));
        $('#cnt').textContent = list.length === 1 ? '1 piesă' : list.length + ' piese';
        $('#plist').innerHTML = list.length ? list.map(partRow).join('') : `<div class="empty"><h3>${state.q ? `N-am găsit nimic după „${esc(state.q)}”.` : 'Nicio piesă aici, deocamdată.'}</h3><p>${state.q ? 'Încearcă alt cuvânt sau scrie-ne direct, probabil o avem.' : 'Scoate un filtru sau scrie-ne direct. Probabil o avem.'}</p></div>`;
      };
      $('#pc').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; state.cat = b.dataset.v; $$('#pc .chip').forEach(x => x.classList.toggle('on', x === b)); draw(); };
      $('#pq').oninput = e => { state.q = e.target.value.trim(); draw(); };
      $('#pst').onchange = e => { state.stoc = e.target.checked; draw(); };
      draw();
    } };
}

function pgPart([slug]) {
  const p = DB.parts.find(x => x.slug === slug && x.status !== 'ascuns'); if (!p) return pgNotFound();
  const rel = active(DB.parts).filter(x => x.cat === p.cat && x.slug !== slug).slice(0, 3);
  const order = `Bună ziua! Aș vrea piesa: ${p.name} (cod ${p.code}, ${priceText(p)}). Aparatul meu este: `;
  return { title: p.name, html: `<div class="wrap">
    <nav class="crumbs" style="padding-top:34px" aria-label="Ești aici"><a href="#/">Acasă</a><span>/</span><a href="#/piese">Piese</a><span>/</span><a href="#/piese?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a></nav>
    <div class="pd"><div>${p.img ? `<div class="main-img" id="zoom" title="Apasă pentru zoom"><img src="${imgSrc(p.img)}" alt="${esc(p.name)}"></div><p class="muted" style="font-size:13px;margin-top:10px">Apasă pe poză ca s-o mărești.</p>` : `<div class="main-img" style="display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#2b1d15,#0e0907)"><div style="width:45%">${partIcon(p.cat)}</div></div><p class="muted" style="font-size:13px;margin-top:10px">Vrei să vezi piesa? Îți trimitem poze pe WhatsApp.</p>`}</div>
      <div><div class="meta">${esc(p.cat)} · cod ${esc(p.code)}</div><h1>${esc(p.name)}</h1>
        <span class="stock ${p.stock}">${stockLabel[p.stock]}</span>${priceHTML(p)}<p class="muted" style="font-size:14px;margin:0">Preț cu TVA. Montajul îl putem face noi.</p>
        <div class="actions"><a class="btn btn-wa" href="${waLink(order)}" target="_blank" rel="noopener">${WA}${p.stock === 'epuizat' ? 'Anunță-mă când intră' : 'Comandă piesa'}</a><a class="btn btn-ghost" href="${telLink()}">Sună-ne</a></div>
        <div class="box"><h3 style="font-size:22px;margin-bottom:10px">Se potrivește la</h3><ul class="checks">${p.compat.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
          ${p.note ? `<p class="muted" style="margin:16px 0 0;line-height:1.7">${esc(p.note)}</p>` : ''}</div>
        <div class="box"><h3 style="font-size:22px;margin-bottom:6px">Nu ești sigur?</h3><p class="muted" style="margin:0 0 14px;line-height:1.7">Trimite-ne o poză cu piesa veche și eticheta aparatului. Îți spunem pe loc dacă e cea bună, ca să nu dai banii degeaba.</p>
          <a class="link" href="${waLink('Bună ziua! Nu sunt sigur ce piesă îmi trebuie. Vă trimit poze.')}" target="_blank" rel="noopener">Trimite poze pe WhatsApp <span class="arrow">→</span></a></div></div></div>
    ${rel.length ? `<h2 style="font-size:34px;margin:0 0 24px">Din aceeași categorie</h2><div class="parts" style="padding-bottom:90px">${rel.map(partRow).join('')}</div>` : '<div style="height:60px"></div>'}</div>`,
    mount() { const z = $('#zoom'); if (z) z.onclick = () => z.classList.toggle('zoom'); } };
}

function pgService() {
  return { title: 'Service și prețuri', html: pageHead('<span>Service</span>', 'Service și reparații', 'Ce facem <em>și cât costă.</em>',
    'Prețurile de mai jos sunt orientative. Pe cel exact ți-l spunem după diagnostic, înainte să ne apucăm de lucru. Piesele se plătesc separat, doar dacă nu scrie altfel.') +
    `<section style="padding-top:60px"><div class="wrap split2"><div>${DB.services.map(c => `<div class="pcat rv"><h3>${esc(c.cat)}</h3>${priceRows(c.items)}</div>`).join('')}</div>
      <div><div class="cbox rv" style="position:sticky;top:calc(var(--hdr) + 30px)"><div class="eyebrow">Cum ajunge aparatul la noi</div><h3 style="margin-top:12px">Alegi cum îți e mai ușor.</h3>${waysHTML()}
        <div style="display:grid;gap:10px;margin-top:24px"><a class="btn btn-primary" href="#/reparatie">Cere o reparație <span class="arrow">→</span></a>
        <a class="btn btn-wa" href="${waLink('Bună ziua! Aș vrea să vă trimit aparatul prin curier.')}" target="_blank" rel="noopener">${WA}Trimit prin curier</a></div></div></div></div></section>
    <section style="background:var(--bg2)"><div class="wrap"><div class="eyebrow rv">Cum lucrăm</div><h2 class="rv d1" style="margin:14px 0 56px">Simplu, <em>de la primul mesaj.</em></h2>${processHTML()}</div></section>
    <section><div class="wrap"><div class="eyebrow">Întrebări frecvente</div><h2 style="margin:14px 0 30px">Ce ne întreabă <em>lumea des.</em></h2>${faqHTML()}</div></section>` };
}

function pgRepair() {
  return { title: 'Cere o reparație', html: pageHead('<a href="#/service">Service</a><span>/</span><span>Cere o reparație</span>', 'Diagnostic în 4 pași · un minut',
    'Ce are <em>espressorul tău?</em>', 'Răspunzi la câteva întrebări și îți spunem cam cât ar costa. La final se deschide WhatsApp cu mesajul gata scris. Acolo ne poți trimite și poze sau un video cu problema.') +
    `<section style="padding-top:50px"><div class="wrap">${diagHTML()}
      <p class="muted" style="text-align:center;margin-top:40px">Preferi să vorbim? Sună-ne la <a class="link" href="${telLink()}">${esc(DB.settings.phone)}</a></p></div></section>`, mount: mountDiag };
}

function pgHoreca() {
  return { title: 'Pentru cafenele', html: pageHead('<span>HoReCa</span>', 'Pentru cafenele, restaurante și hoteluri', 'Aparatul tău <em>nu are voie să stea.</em>',
    'Știm cum e să ai coadă la tejghea și aparatul să nu mai scoată presiune. De asta avem câteva servicii gândite special pentru localuri.') +
    `<section style="padding-top:60px"><div class="wrap"><div class="grid4" style="grid-template-columns:repeat(2,1fr)">
      ${DB.horeca.map((h, i) => `<div class="card rv ${['', 'd1', 'd2', 'd3'][i]}"><span class="ico" aria-hidden="true">${esc(h.icon)}</span><h3 style="margin-top:22px">${esc(h.title)}</h3><p>${esc(h.text)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span class="pr" style="font-size:19px">${esc(h.price)}</span>
        <a class="btn btn-wa btn-sm" href="${waLink(`Bună ziua! Am o cafenea și mă interesează: ${h.title}.`)}" target="_blank" rel="noopener">${WA}Cere o ofertă</a></div></div>`).join('')}</div></div></section>
    <section style="background:var(--bg2)"><div class="wrap split2"><div><div class="eyebrow rv">Abonamentul, pe scurt</div><h2 class="rv d1" style="margin-top:14px">Venim înainte<br><em>să se strice.</em></h2>
      <p class="lead rv d2" style="margin-top:18px">Un aparat întreținut regulat se strică mult mai rar. Iar când se strică totuși, ești primul pe listă.</p></div>
      <div class="rv d1"><ul class="checks" style="gap:16px;font-size:16px">
        <li>Vizită lunară sau trimestrială, cum ai nevoie</li><li>Garnituri, site și curățare incluse</li><li>Verificare presiune, temperatură și filtru de apă</li>
        <li>Prioritate la urgențe, inclusiv duminica</li><li>Aparat de schimb dacă al tău trebuie să ajungă în atelier</li><li>Fișă de service pentru fiecare vizită</li></ul>
        <a class="btn btn-primary" style="margin-top:30px" href="${waLink('Bună ziua! Aș vrea o ofertă pentru abonament de întreținere. Am o cafenea cu aparat de ... grupuri.')}" target="_blank" rel="noopener">Cere oferta de abonament <span class="arrow">→</span></a></div></div></section>` };
}

function pgContact() {
  const S = DB.settings;
  return { title: 'Contact', html: pageHead('<span>Contact</span>', 'Contact', 'Hai să <em>vorbim.</em>', 'Cel mai repede ne găsești pe WhatsApp. Dacă vii la atelier, sună-ne înainte, ca să fim sigur acolo.') +
    `<section style="padding-top:60px"><div class="wrap cgrid">
      <div class="cbox"><h3>Scrie-ne sau sună-ne</h3><div style="display:grid;gap:10px;margin-top:16px">
        <a class="btn btn-wa" href="${waLink('Bună ziua! Am o întrebare.')}" target="_blank" rel="noopener">${WA}WhatsApp</a>
        <a class="btn btn-ghost" href="${telLink()}">Sună: ${esc(S.phone)}</a><a class="btn btn-ghost" href="mailto:${esc(S.email)}">${esc(S.email)}</a></div>
        <p class="muted" style="font-size:14px;margin:16px 0 0">Răspundem în aceeași zi, în timpul programului.</p></div>
      <div class="cbox"><h3>Program</h3><table class="hours">${S.hours.map(h => `<tr><td>${esc(h[0])}</td><td>${esc(h[1])}</td></tr>`).join('')}</table></div>
      <div class="map" style="grid-column:1/-1"><span class="pin" aria-hidden="true"></span><div class="lbl"><span class="cbox" style="padding:12px 16px">${esc(S.address)}</span>
        <a class="btn btn-primary btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.address)}" target="_blank" rel="noopener">Deschide în Google Maps ↗</a></div></div>
      <div class="cbox"><h3>Date firmă</h3><p class="muted" style="line-height:1.9;margin:0">${esc(S.company)}<br>CUI ${esc(S.cui)}<br>${esc(S.regcom)}<br>${esc(S.address)}</p></div>
      <div class="cbox"><h3>Trimiți prin curier?</h3><p class="muted" style="line-height:1.7;margin:0 0 16px">Scrie-ne înainte și îți trimitem noi curierul. Golește apa din rezervor și tavă și ambalează aparatul bine, ideal în cutia lui.</p>
        <a class="link" href="${waLink('Bună ziua! Aș vrea să vă trimit aparatul prin curier.')}" target="_blank" rel="noopener">Programează curierul <span class="arrow">→</span></a></div>
    </div></section>` };
}

const legal = (title, body) => ({ title, html: pageHead(`<span>${title}</span>`, 'Informații legale', title, 'Text orientativ pentru prototip. Varianta finală trebuie verificată de un jurist.') + `<div class="wrap legal-text">${body}</div>` });
const pgTerms = () => legal('Termeni și condiții', `<h2>Cine suntem</h2><p>Site-ul ${esc(DB.settings.brand)} este operat de ${esc(DB.settings.company)}, CUI ${esc(DB.settings.cui)}, ${esc(DB.settings.regcom)}.</p>
  <h2>Prețuri</h2><p>Prețurile afișate includ TVA. Prețurile „de la” sunt orientative. Prețul final pentru reparații ți-l comunicăm după diagnostic și lucrăm doar cu acordul tău.</p>
  <h2>Comenzi</h2><p>Comenzile se confirmă pe WhatsApp sau telefonic. Nu există plată online pe site.</p>
  <h2>Garanție</h2><p>Oferim garanție scrisă pentru manoperă și pentru piesele montate. Durata e trecută pe fișa de service sau pe factură.</p>
  <h2>Retur</h2><p>Pentru produsele cumpărate la distanță ai 14 zile să te răzgândești, conform OUG 34/2014. Piesele montate nu se mai pot returna.</p>`);
const pgPrivacy = () => legal('Politica de confidențialitate', `<h2>Ce date colectăm</h2><p>Doar ce ne trimiți tu: nume, telefon, localitate și detalii despre aparat. Formularul de reparație nu salvează nimic pe server. Doar deschide WhatsApp cu mesajul pregătit.</p>
  <h2>De ce</h2><p>Ca să îți răspundem, să facem oferta și reparația și să emitem factura.</p><h2>Cât timp</h2><p>Cât e nevoie pentru garanție și cât cere legea contabilă.</p>
  <h2>Drepturile tale</h2><p>Poți cere oricând să vezi, să corectezi sau să ștergem datele tale. Scrie-ne la ${esc(DB.settings.email)}.</p><h2>Cookie-uri</h2><p>Site-ul nu folosește cookie-uri de urmărire sau reclame.</p>`);
const pgNotFound = () => ({ title: 'Pagina nu există', html: `<div class="wrap" style="padding:120px 24px;text-align:center"><div class="eyebrow">404</div><h1 style="font-size:64px;margin:16px 0">Aici nu e <em>nicio cafea.</em></h1>
  <p class="lead" style="margin:0 auto 30px">Pagina pe care o cauți nu există sau a fost mutată.</p><a class="btn btn-primary" href="#/">Înapoi acasă</a></div>` });

/* ================================================================
   ADMIN (demo: date în localStorage, conturi în data.js)
   Gândit întâi pentru telefon: bară de taburi jos, liste pe carduri,
   formulare pe tot ecranul cu butonul de salvare mereu la vedere.
   ================================================================ */
const ADM_TABS = [['panou', 'Panou', '◎'], ['espressoare', 'Espressoare', '☕'], ['piese', 'Piese', '⚙'], ['servicii', 'Prețuri service', '₤'], ['horeca', 'Pachete HoReCa', '⌂'],
  ['categorii', 'Categorii piese', '≡'], ['intrebari', 'Întrebări frecvente', '?'], ['setari', 'Setări și contact', '☎'], ['utilizatori', 'Utilizatori', '☺']];
const ADM_MAIN = ['panou', 'espressoare', 'piese', 'servicii'];
const ADM_ICON = {
  panou: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  espressoare: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  piese: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  servicii: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  horeca: '<path d="M3 10l2-6h14l2 6M4 10v10h16V10M3 10h18M9 20v-5h6v5"/>',
  categorii: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  intrebari: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
  setari: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  utilizatori: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  site: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>'
};
const aico = k => `<svg class="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ADM_ICON[k] || ''}</svg>`;

const SS_TAB = 'ep-admin-tab';
let admTab = store.get(SS_TAB, sessionStorage) || 'panou';
let admDirty = null;            // funcția de salvare a formularului curent, dacă are modificări nesalvate
const me = () => { const e = store.get(SS_ADMIN, sessionStorage); return e && (DB.admins || []).find(a => a.email === e); };
const STATUS_M = { activ: 'La vânzare', ascuns: 'Ascuns', vandut: 'Vândut' };

function pgAdmin(_, q) {
  if (!me()) return { title: 'Admin', admin: true, html: `<div class="wrap"><form class="login" id="login" novalidate>
    <a class="logo" href="#/">${LOGO}ESPRESSOARE<span>premium</span></a><h1 style="font-size:34px;margin:26px 0 6px">Intră în admin</h1>
    <p class="muted" style="margin:0 0 22px;font-size:15px">Doar pentru echipă. Contul de demo e trecut în README.</p>
    <div class="f"><label for="le">Email</label><input id="le" type="email" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false" required></div>
    <div class="f"><label for="lp">Parola</label><input id="lp" type="password" autocomplete="current-password" required></div>
    <p class="err" id="lerr" hidden>Emailul sau parola nu se potrivesc.</p>
    <button class="btn btn-primary btn-block">Intră</button><a class="link" href="#/" style="margin-top:20px">← Înapoi pe site</a></form></div>`,
    mount() { $('#login').onsubmit = e => { e.preventDefault(); const a = (DB.admins || []).find(x => x.email.toLowerCase() === $('#le').value.trim().toLowerCase() && x.pass === $('#lp').value);
      if (!a) { $('#lerr').hidden = false; $('#lp').value = ''; $('#lp').focus(); return; } store.set(SS_ADMIN, a.email, sessionStorage); render(); }; } };
  if (q.get('t') && ADM_TABS.some(t => t[0] === q.get('t'))) admTab = q.get('t');
  const btn = t => `<button type="button" data-t="${t[0]}">${aico(t[0])}<span>${t[1]}</span></button>`;
  return { title: 'Admin', admin: true, html: `<div class="adm">
    <header class="adm-bar"><a class="logo" href="#/" aria-label="Înapoi pe site">${LOGO}<span class="hide-xs">ESPRESSOARE</span><span>admin</span></a>
      <div class="adm-bar-r"><a class="btn btn-ghost btn-sm" href="#/" target="_blank" rel="noopener">Vezi site-ul ↗</a><button type="button" class="iconbtn" id="logout">Ieși</button></div></header>
    <div class="adm-body">
      <aside class="adm-side" aria-label="Meniu admin"><div class="muted" style="font-size:14px;padding:4px 14px 14px">Salut, ${esc(me().name)}</div>${ADM_TABS.map(btn).join('')}</aside>
      <div class="pane" id="pane"></div></div>
    <nav class="adm-tabs" aria-label="Meniu admin">${ADM_TABS.filter(t => ADM_MAIN.includes(t[0])).map(t => btn([t[0], t[1].split(' ')[0], t[2]])).join('')}
      <button type="button" id="more">${aico('more')}<span>Mai mult</span></button></nav></div>`,
    mount() {
      $$('.adm [data-t]').forEach(b => b.onclick = () => setTab(b.dataset.t));
      $('#logout').onclick = () => { if (!leaveOk()) return; store.del(SS_ADMIN, sessionStorage); toast('Ai ieșit din cont.'); render(); };
      $('#more').onclick = () => sheet({ title: 'Mai mult', body: `<div class="more-list">${ADM_TABS.filter(t => !ADM_MAIN.includes(t[0])).map(t => `<button type="button" class="more-item" data-mt="${t[0]}">${aico(t[0])}${t[1]}<span class="arrow">→</span></button>`).join('')}
          <a class="more-item" href="#/" target="_blank" rel="noopener">${aico('site')}Vezi site-ul<span class="arrow">→</span></a>
          <button type="button" class="more-item" data-out="1">${aico('out')}Ieși din cont<span class="arrow">→</span></button></div>`, bottom: true },
        (M, close) => { $$('[data-mt]', M).forEach(b => b.onclick = () => { close(); setTab(b.dataset.mt); }); $('[data-out]', M).onclick = () => { close(); $('#logout').click(); }; });
      setTab(admTab, true);
    } };
}
function leaveOk() {                 // salvează automat formularul curent înainte să pleci din el
  if (!admDirty) return true;
  const ok = admDirty(); if (ok) { admDirty = null; toast('Am salvat modificările.'); } return ok;
}
function setTab(t, first) {
  if (!first && !leaveOk()) return;
  admTab = ADM_TABS.some(x => x[0] === t) ? t : 'panou'; store.set(SS_TAB, admTab, sessionStorage);
  $$('.adm [data-t]').forEach(b => { const on = b.dataset.t === admTab; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  $('#more')?.classList.toggle('on', !ADM_MAIN.includes(admTab));
  admDraw(); if (!first) scrollTo(0, 0);
}
function admSaved(msg = 'Salvat. Schimbarea se vede deja pe site.') { admDirty = null; const ok = save(); renderChrome(); if (ok) toast(msg); admDraw(); }
function admTop(title, sub, btn = '') { return `<div class="adm-top"><div class="adm-title"><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${btn ? `<div class="adm-actions">${btn}</div>` : ''}</div>`; }
function trackDirty(root, saveFn) {  // marchează formularul ca modificat la prima tastare
  const sv = $('#sv', root);
  root.addEventListener('input', () => { admDirty = saveFn; sv?.classList.add('pulse'); });
}
function confirmBtn(btn, onYes) {  // confirmare în pagină, fără dialog de browser
  if (btn.dataset.armed) { if (Date.now() - btn.dataset.armed > 400) onYes(); return; }
  btn.dataset.armed = Date.now(); const old = btn.innerHTML; btn.textContent = 'Sigur? Apasă iar'; btn.classList.add('armed');
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.innerHTML = old; btn.classList.remove('armed'); } }, 3500);
}
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };

function admDraw() {
  const P = $('#pane'); if (!P) return; admDirty = null;
  const V = {
    panou() {
      const ms = DB.machines, ps = DB.parts;
      P.innerHTML = admTop('Panou', `Salut, ${esc(me().name)}. Ce se întâmplă pe site, pe scurt.`) +
        `<div class="stats"><button type="button" class="stat" data-go="espressoare"><b>${ms.filter(m => m.status === 'activ').length}</b>espressoare la vânzare</button><button type="button" class="stat" data-go="espressoare"><b>${ms.filter(m => m.status === 'vandut').length}</b>vândute</button>
        <button type="button" class="stat" data-go="piese"><b>${ps.filter(p => p.stock === 'stoc').length}</b>piese pe stoc</button><button type="button" class="stat" data-go="piese"><b>${ps.filter(p => p.stock === 'epuizat').length}</b>piese epuizate</button></div>
        <div class="cgrid"><div class="cbox"><h3>Acțiuni rapide</h3><div class="qa">
          <button type="button" class="btn btn-primary" data-go="espressoare" data-new="1">+ Adaugă un espressor</button><button type="button" class="btn btn-ghost" data-go="piese" data-new="1">+ Adaugă o piesă</button>
          <button type="button" class="btn btn-ghost" data-go="servicii">Schimbă prețurile la service</button><button type="button" class="btn btn-ghost" data-go="setari">Telefon, WhatsApp, program</button></div></div>
        <div class="cbox"><h3>Despre datele demo</h3><p class="muted" style="line-height:1.7">În prototip, tot ce schimbi aici se salvează doar în browserul tău. În site-ul final, datele stau în baza de date și le vede toată lumea.</p>
          <button type="button" class="iconbtn" id="reset">Readu datele demo la început</button></div></div>`;
      $$('[data-go]', P).forEach(b => b.onclick = () => { setTab(b.dataset.go); if (b.dataset.new) (b.dataset.go === 'piese' ? editPart : editMachine)(null); });
      $('#reset').onclick = e => confirmBtn(e.currentTarget, () => { DB = clone(window.DB_DEFAULT); store.del(LS_DB); if (!me()) { store.set(SS_ADMIN, DB.admins[0].email, sessionStorage); } renderChrome(); toast('Datele demo au fost resetate.'); admDraw(); });
    },
    espressoare() {
      P.innerHTML = admTop('Espressoare', 'Apasă pe un aparat ca să-l modifici.', '<button type="button" class="btn btn-primary btn-sm" id="add">+ Adaugă</button>') +
        (DB.machines.length ? `<div class="alist">${DB.machines.map((m, i) => `<div class="arow">
          <button type="button" class="arow-main" data-e="${i}">${m.img ? `<img class="th" src="${imgSrc(m.img)}" alt="">` : `<span class="th pth">${partIcon("")}</span>`}<span class="ainfo"><b>${esc(m.name)}</b><small>${typeLabel[m.type] || ''} · ${esc(m.cond)} · ${esc(priceText(m))}</small></span></button>
          <span class="pill ${m.status}">${STATUS_M[m.status] || m.status}</span>
          <div class="aact">${m.status === 'vandut' ? `<button type="button" class="iconbtn" data-a="${i}">Pune din nou la vânzare</button>` : `<button type="button" class="iconbtn" data-s="${i}">Marchează vândut</button>`}
            <a class="iconbtn" href="#/espressoare/${esc(m.slug)}" target="_blank" rel="noopener">${m.status === 'ascuns' ? 'Ascuns pe site' : 'Vezi pe site ↗'}</a></div></div>`).join('')}</div>`
          : '<div class="empty"><h3>Nu ai niciun espressor.</h3><p>Apasă „+ Adaugă” ca să pui primul aparat pe site.</p></div>');
      $('#add').onclick = () => editMachine(null);
      $$('[data-e]', P).forEach(b => b.onclick = () => editMachine(+b.dataset.e));
      $$('[data-s]', P).forEach(b => b.onclick = () => { DB.machines[+b.dataset.s].status = 'vandut'; admSaved('Marcat ca vândut. Pe site apare cu eticheta „Vândut”.'); });
      $$('[data-a]', P).forEach(b => b.onclick = () => { DB.machines[+b.dataset.a].status = 'activ'; admSaved('Aparatul e din nou la vânzare.'); });
    },
    piese() {
      P.innerHTML = admTop('Piese', 'Prețul și stocul le schimbi direct din listă. Pentru restul, apasă pe piesă.', '<button type="button" class="btn btn-primary btn-sm" id="add">+ Adaugă</button>') +
        `<label class="sr" for="aq">Caută în piese</label><input class="search" id="aq" type="search" placeholder="Caută după nume sau cod…" autocomplete="off" style="width:100%;margin-bottom:14px"><div class="alist" id="plist"></div>`;
      const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const draw = () => { const t = norm($('#aq').value.trim());
        const rows = DB.parts.map((p, i) => [p, i]).filter(([p]) => !t || norm(p.name + ' ' + p.code).includes(t));
        $('#plist').innerHTML = rows.length ? rows.map(([p, i]) => `<div class="arow part-row${p.status === 'ascuns' ? ' dim' : ''}">
          <button type="button" class="arow-main" data-e="${i}"><span class="th pth">${partThumb(p)}</span><span class="ainfo"><b>${esc(p.name)}</b><small>${esc(p.cat)} · cod ${esc(p.code || '—')}${p.status === 'ascuns' ? ' · ascunsă' : ''}</small></span></button>
          <div class="aedit"><label><span>Preț (lei)</span><input type="text" inputmode="decimal" value="${p.priceType === 'cerere' || p.price == null ? '' : p.price}" placeholder="la cerere" data-pr="${i}"></label>
            <label><span>Stoc</span><select data-st="${i}">${Object.entries(stockLabel).map(([k, l]) => `<option value="${k}" ${p.stock === k ? 'selected' : ''}>${l.split(',')[0]}</option>`).join('')}</select></label></div></div>`).join('')
          : `<div class="empty"><h3>Nicio piesă găsită.</h3><p>Încearcă alt cuvânt sau adaugă piesa.</p></div>`;
        $$('[data-e]', P).forEach(b => b.onclick = () => editPart(+b.dataset.e));
        $$('[data-pr]', P).forEach(inp => inp.onchange = () => { const p = DB.parts[+inp.dataset.pr], v = inp.value.trim();
          if (v === '') { p.price = null; p.priceType = 'cerere'; } else { const n = num(v); if (n == null || n === 0) { toast('Scrie un preț valid, de exemplu 180.'); inp.value = p.price ?? ''; return; } p.price = n; if (p.priceType === 'cerere') p.priceType = 'fix'; }
          if (save()) toast(v === '' ? 'Piesa are acum „preț la cerere”.' : 'Preț actualizat: ' + priceText(p) + '.'); });
        $$('[data-st]', P).forEach(s => s.onchange = () => { DB.parts[+s.dataset.st].stock = s.value; if (save()) toast('Stoc actualizat: ' + stockLabel[s.value].split(',')[0].toLowerCase() + '.'); }); };
      $('#aq').oninput = draw; $('#add').onclick = () => editPart(null); draw();
    },
    servicii() {
      const opt = (v, cur, l) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
      P.innerHTML = admTop('Prețuri service', 'Lista de prețuri de pe pagina Service.', '<button type="button" class="btn btn-primary btn-sm" id="sv">Salvează</button>') +
        DB.services.map((c, ci) => `<div class="cbox svc-cat"><div class="f"><label for="c${ci}">Categoria</label><input id="c${ci}" data-cat="${ci}" value="${esc(c.cat)}"></div>
          ${c.items.map((s, si) => `<div class="svc-item">
            <div class="f sname"><label>Serviciu</label><input data-n="${ci}.${si}" value="${esc(s.name)}"></div>
            <div class="f snote"><label>Notă mică <span class="muted">(opțional)</span></label><input data-no="${ci}.${si}" value="${esc(s.note || '')}"></div>
            <div class="f"><label>Tip preț</label><select data-t="${ci}.${si}">${opt('fix', s.priceType, 'fix')}${opt('de-la', s.priceType, 'de la')}${opt('cerere', s.priceType, 'la cerere')}</select></div>
            <div class="f"><label>Lei</label><input type="text" inputmode="decimal" data-p="${ci}.${si}" value="${s.price ?? ''}" ${s.priceType === 'cerere' ? 'disabled' : ''}></div>
            <button type="button" class="iconbtn sdel" data-del="${ci}.${si}" aria-label="Șterge serviciul ${esc(s.name)}">Șterge</button></div>`).join('')}
          <div class="row-btns"><button type="button" class="iconbtn" data-addi="${ci}">+ Adaugă serviciu</button><button type="button" class="iconbtn" data-delc="${ci}">Șterge categoria</button></div></div>`).join('') +
        '<button type="button" class="btn btn-ghost btn-sm" id="addc">+ Categorie nouă</button>';
      const it = k => { const [a, b] = k.split('.').map(Number); return DB.services[a].items[b]; };
      const collect = () => {
        for (const i of $$('[data-p]', P)) { const s = $(`[data-t="${i.dataset.p}"]`, P).value; if (s !== 'cerere' && !(num(i.value) > 0)) { i.classList.add('bad'); i.focus(); toast('Pune un preț sau alege „la cerere”.'); return false; } }
        $$('[data-cat]', P).forEach(i => DB.services[+i.dataset.cat].cat = i.value.trim() || 'Fără nume');
        $$('[data-n]', P).forEach(i => it(i.dataset.n).name = i.value.trim() || 'Serviciu'); $$('[data-no]', P).forEach(i => it(i.dataset.no).note = i.value.trim());
        $$('select[data-t]', P).forEach(i => it(i.dataset.t).priceType = i.value); $$('[data-p]', P).forEach(i => { const s = it(i.dataset.p); s.price = s.priceType === 'cerere' ? null : num(i.value); });
        save(); return true; };
      $$('select[data-t]', P).forEach(s => s.onchange = () => { const p = $(`[data-p="${s.dataset.t}"]`, P); p.disabled = s.value === 'cerere'; if (p.disabled) p.value = ''; p.classList.remove('bad'); });
      trackDirty(P, collect);
      $('#sv').onclick = () => { if (collect()) admSaved(); };
      $$('[data-addi]', P).forEach(b => b.onclick = () => { if (!collect()) return; DB.services[+b.dataset.addi].items.push({ name: 'Serviciu nou', priceType: 'de-la', price: 100 }); save(); admDraw(); toast('Am adăugat un rând nou. Completează-l și salvează.'); });
      $$('[data-del]', P).forEach(b => b.onclick = () => confirmBtn(b, () => { if (!collect()) return; const [a, c] = b.dataset.del.split('.').map(Number); DB.services[a].items.splice(c, 1); admSaved('Serviciu șters.'); }));
      $$('[data-delc]', P).forEach(b => b.onclick = () => confirmBtn(b, () => { if (!collect()) return; DB.services.splice(+b.dataset.delc, 1); admSaved('Categorie ștearsă.'); }));
      $('#addc').onclick = () => { if (!collect()) return; DB.services.push({ cat: 'Categorie nouă', items: [{ name: 'Serviciu nou', priceType: 'de-la', price: 100 }] }); save(); admDraw(); };
    },
    horeca() {
      P.innerHTML = admTop('Pachete HoReCa', 'Cele patru servicii pentru cafenele.', '<button type="button" class="btn btn-primary btn-sm" id="sv">Salvează</button>') +
        DB.horeca.map((h, i) => `<div class="cbox" style="margin-bottom:14px"><div class="f2"><div class="f"><label for="h${i}t">Titlu</label><input id="h${i}t" data-h="${i}.title" value="${esc(h.title)}"></div><div class="f"><label for="h${i}p">Preț afișat</label><input id="h${i}p" data-h="${i}.price" value="${esc(h.price)}"></div></div>
          <div class="f"><label for="h${i}x">Descriere</label><textarea id="h${i}x" rows="3" data-h="${i}.text">${esc(h.text)}</textarea></div></div>`).join('');
      const collect = () => { $$('[data-h]', P).forEach(x => { const [i, k] = x.dataset.h.split('.'); DB.horeca[+i][k] = x.value.trim(); }); save(); return true; };
      trackDirty(P, collect); $('#sv').onclick = () => { collect(); admSaved(); };
    },
    categorii() {
      P.innerHTML = admTop('Categorii de piese', 'Apar ca filtre pe pagina Piese.', '<button type="button" class="btn btn-primary btn-sm" id="sv">Salvează</button>') + `<div class="cbox">${DB.partCats.map((c, i) => { const n = DB.parts.filter(p => p.cat === c).length;
        return `<div class="cat-row"><label class="sr" for="cat${i}">Categoria ${i + 1}</label><input id="cat${i}" data-c="${i}" value="${esc(c)}"><span class="muted">${n === 1 ? '1 piesă' : n + ' piese'}</span>
          ${n ? '<span class="muted hint">se poate șterge doar goală</span>' : `<button type="button" class="iconbtn" data-del="${i}">Șterge</button>`}</div>`; }).join('')}
        <form class="cat-row" id="ncf" style="margin-top:16px"><label class="sr" for="nc">Categorie nouă</label><input id="nc" placeholder="Categorie nouă"><button class="btn btn-ghost btn-sm">Adaugă</button></form></div>`;
      const collect = () => { const names = $$('[data-c]', P).map(i => i.value.trim());
        if (names.some(n => !n)) { toast('O categorie nu poate rămâne fără nume.'); return false; }
        if (new Set(names).size !== names.length) { toast('Două categorii au același nume.'); return false; }
        names.forEach((nw, i) => { const old = DB.partCats[i]; if (nw !== old) { DB.parts.forEach(p => { if (p.cat === old) p.cat = nw; }); DB.partCats[i] = nw; } }); save(); return true; };
      trackDirty($('.cbox', P), collect);
      $('#sv').onclick = () => { if (collect()) admSaved(); };
      $('#ncf').onsubmit = e => { e.preventDefault(); const v = $('#nc').value.trim(); if (!v) return toast('Scrie numele categoriei.'); if (!collect()) return; if (DB.partCats.includes(v)) return toast('Categoria există deja.'); DB.partCats.push(v); admSaved('Categorie adăugată.'); };
      $$('[data-del]', P).forEach(b => b.onclick = () => confirmBtn(b, () => { if (!collect()) return; DB.partCats.splice(+b.dataset.del, 1); admSaved('Categorie ștearsă.'); }));
    },
    intrebari() {
      P.innerHTML = admTop('Întrebări frecvente', 'Apar pe prima pagină și pe pagina Service.', '<button type="button" class="btn btn-primary btn-sm" id="sv">Salvează</button>') +
        DB.faq.map((f, i) => `<div class="cbox" style="margin-bottom:12px"><div class="f"><label for="q${i}">Întrebarea</label><input id="q${i}" data-q="${i}" value="${esc(f[0])}"></div><div class="f"><label for="a${i}">Răspunsul</label><textarea id="a${i}" rows="3" data-a="${i}">${esc(f[1])}</textarea></div><button type="button" class="iconbtn" data-del="${i}">Șterge întrebarea</button></div>`).join('') +
        '<button type="button" class="btn btn-ghost btn-sm" id="add">+ Întrebare nouă</button>';
      const collect = () => { DB.faq = $$('[data-q]', P).map(i => [i.value.trim(), $(`[data-a="${i.dataset.q}"]`, P).value.trim()]).filter(f => f[0]); save(); return true; };
      trackDirty(P, collect);
      $('#sv').onclick = () => { collect(); admSaved(); };
      $('#add').onclick = () => { collect(); DB.faq.push(['Întrebare nouă', 'Răspunsul aici.']); save(); admDraw(); $$('[data-q]', P).pop()?.select(); };
      $$('[data-del]', P).forEach(b => b.onclick = () => confirmBtn(b, () => { const i = +b.dataset.del; collect(); DB.faq.splice(i, 1); admSaved('Întrebare ștearsă.'); }));
    },
    setari() {
      const S = DB.settings, fld = (k, l, t = 'text', extra = '') => `<div class="f"><label for="s-${k}">${l}</label><input id="s-${k}" type="${t}" data-s="${k}" value="${esc(S[k])}" ${extra}></div>`;
      P.innerHTML = admTop('Setări și contact', 'Apar pe tot site-ul: sus, jos și pe butoanele de WhatsApp.', '<button type="button" class="btn btn-primary btn-sm" id="sv">Salvează</button>') +
        `<div class="cgrid"><div class="cbox"><h3>Contact</h3>${fld('phone', 'Telefon, cum apare pe site', 'tel')}${fld('tel', 'Telefon pentru apel (+40…)', 'tel')}${fld('wa', 'Număr WhatsApp (40…, fără +)', 'tel', 'inputmode="numeric"')}${fld('email', 'Email', 'email', 'autocapitalize="off"')}${fld('address', 'Adresa atelierului')}
          <button type="button" class="link" id="watest" style="background:none;border:0;padding:0;cursor:pointer">Testează WhatsApp-ul ↗</button></div>
        <div class="cbox"><h3>Program</h3>${S.hours.map((h, i) => `<div class="f2"><div class="f"><label for="hd${i}">Zile</label><input id="hd${i}" data-hd="${i}" value="${esc(h[0])}"></div><div class="f"><label for="hh${i}">Ore</label><input id="hh${i}" data-hh="${i}" value="${esc(h[1])}"></div></div>`).join('')}
          <h3 style="margin-top:18px">Firma</h3>${fld('company', 'Denumire')}${fld('cui', 'CUI')}${fld('regcom', 'Nr. Reg. Com.')}</div></div>`;
      const collect = () => {
        const wa = $('#s-wa').value.replace(/\D/g, ''), tel = $('#s-tel').value.replace(/[^\d+]/g, '');
        $$('input.bad', P).forEach(i => i.classList.remove('bad'));
        if (!/^40\d{9}$/.test(wa)) { $('#s-wa').classList.add('bad'); $('#s-wa').focus(); toast('Numărul de WhatsApp trebuie să arate așa: 40722123456.'); return false; }
        if (!/^\+?\d{10,12}$/.test(tel)) { $('#s-tel').classList.add('bad'); $('#s-tel').focus(); toast('Telefonul pentru apel trebuie să arate așa: +40722123456.'); return false; }
        $$('[data-s]', P).forEach(i => S[i.dataset.s] = i.value.trim()); S.wa = wa; S.tel = tel;
        S.hours = S.hours.map((h, i) => [$(`[data-hd="${i}"]`, P).value.trim(), $(`[data-hh="${i}"]`, P).value.trim()]); save(); return true; };
      trackDirty(P, collect);
      $('#sv').onclick = () => { if (collect()) admSaved(); };
      $('#watest').onclick = () => { const wa = $('#s-wa').value.replace(/\D/g, ''); open(`https://wa.me/${wa}?text=${encodeURIComponent('Test de pe site')}`, '_blank', 'noopener'); };
    },
    utilizatori() {
      const self = me().email;
      P.innerHTML = admTop('Utilizatori', 'Cine are acces la admin. Toți au aceleași drepturi.') +
        `<div class="alist" style="margin-bottom:20px">${DB.admins.map((a, i) => `<div class="arow"><span class="arow-main"><span class="avatar" aria-hidden="true">${esc(a.name.trim()[0] || '?').toUpperCase()}</span><span class="ainfo"><b>${esc(a.name)}${a.email === self ? ' <span class="pill activ">tu</span>' : ''}</b><small>${esc(a.email)}</small></span></span>
          ${a.email === self ? '' : `<div class="aact"><button type="button" class="iconbtn" data-del="${i}">Scoate accesul</button></div>`}</div>`).join('')}</div>
        <form class="cbox" id="nu" novalidate><h3>Adaugă o persoană</h3><div class="f2"><div class="f"><label for="un">Nume</label><input id="un" autocomplete="off"></div><div class="f"><label for="ue">Email</label><input id="ue" type="email" inputmode="email" autocapitalize="off" autocomplete="off"></div></div>
          <div class="f"><label for="up">Parolă (minim 8 caractere)</label><input id="up" type="password" autocomplete="new-password"></div><p class="err" id="uerr" hidden></p><button class="btn btn-primary btn-sm">Adaugă</button>
          <p class="muted" style="font-size:13px;margin:12px 0 0">În site-ul final, persoana primește un email de invitație și își alege singură parola.</p></form>`;
      $$('[data-del]', P).forEach(b => b.onclick = () => confirmBtn(b, () => { DB.admins.splice(+b.dataset.del, 1); admSaved('Accesul a fost scos.'); }));
      $('#nu').onsubmit = e => { e.preventDefault(); const n = $('#un').value.trim(), em = $('#ue').value.trim().toLowerCase(), pw = $('#up').value, er = $('#uerr');
        const bad = !n ? 'Scrie numele.' : !/^\S+@\S+\.\S+$/.test(em) ? 'Emailul nu pare corect.' : DB.admins.some(a => a.email.toLowerCase() === em) ? 'Există deja un cont cu acest email.' : pw.length < 8 ? 'Parola trebuie să aibă minim 8 caractere.' : DB.admins.length >= 5 ? 'Poți avea cel mult 5 persoane în admin.' : '';
        if (bad) { er.textContent = bad; er.hidden = false; return; } DB.admins.push({ name: n, email: em, pass: pw }); admSaved('Persoana a fost adăugată.'); };
    }
  };
  (V[admTab] || V.panou)();
}

/* fereastră de editare: pe telefon ocupă tot ecranul, cu butoanele mereu jos */
function sheet({ title, body, foot = '', bottom = false }, onMount) {
  const m = document.createElement('div'); m.className = 'modal' + (bottom ? ' bottom' : '');
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="sheet-head"><h2 id="sh-t" tabindex="-1">${title}</h2><button type="button" class="iconbtn" data-close>Închide ✕</button></div>
    <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}</div>`;
  document.body.appendChild(m); document.body.classList.add('lock');
  let dirty = false; m.addEventListener('input', () => dirty = true);
  const close = () => { m.remove(); document.body.classList.remove('lock'); removeEventListener('keydown', k); removeEventListener('hashchange', close); };
  const tryClose = btn => { if (!dirty) return close(); if (btn) return confirmBtn(btn, close); toast('Ai modificări nesalvate. Salvează sau apasă „Închide” de două ori.'); };
  const k = e => { if (e.key === 'Escape') tryClose(); };
  addEventListener('keydown', k); addEventListener('hashchange', close);
  m.onclick = e => { if (e.target === m) tryClose(); };
  $('[data-close]', m).onclick = e => tryClose(e.currentTarget);
  onMount(m, close); $('#sh-t', m).focus({ preventScroll: true });
}
const sel = (id, opts, v) => `<select id="${id}">${opts.map(o => `<option value="${esc(o[0])}" ${String(v) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
const PT = [['fix', 'Preț fix'], ['de-la', 'Preț „de la”'], ['cerere', 'Preț la cerere']];
function priceToggle(m) { const t = $('#x-pt', m), p = $('#x-price', m); const f = () => { p.disabled = t.value === 'cerere'; if (p.disabled) { p.value = ''; p.classList.remove('bad'); } }; t.addEventListener('change', f); f(); }
function readImage(input, cb) {
  const f = input.files[0]; if (!f) return; if (!f.type.startsWith('image/')) return toast('Alege o imagine (JPG sau PNG).');
  if (f.size > 15e6) return toast('Poza e prea mare. Alege una sub 15 MB.');
  const r = new FileReader(); r.onerror = () => toast('Nu am putut citi poza. Încearcă alta.');
  r.onload = () => { const im = new Image(); im.onerror = () => toast('Formatul pozei nu e suportat. Încearcă JPG sau PNG.');
    im.onload = () => {   // micșorăm poza ca să încapă în browser
      const c = document.createElement('canvas'), s = Math.min(1, 1000 / Math.max(im.width, im.height)); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      const cx = c.getContext('2d'); cx.fillStyle = '#1c120c'; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .8)); input.value = ''; }; im.src = r.result; };
  r.readAsDataURL(f);
}
function formFoot(isNew) { return `<button class="btn btn-primary" form="xf">${isNew ? 'Adaugă pe site' : 'Salvează'}</button>${isNew ? '' : '<button type="button" class="iconbtn" id="x-del">Șterge definitiv</button>'}`; }
function uniqueSlug(name, list, self) { const base = slugify(name); let s = base, n = 2; while (list.some(x => x !== self && x.slug === s)) s = base + '-' + n++; return s; }

function editMachine(i) {
  const isNew = i == null, m = isNew ? { name: '', type: 'profesional', groups: 2, cond: 'Recondiționat', priceType: 'fix', price: '', status: 'activ', warranty: '12 luni', short: '', desc: '', specs: [], checked: [], img: '' } : clone(DB.machines[i]);
  sheet({ title: isNew ? 'Espressor nou' : 'Modifică espressorul', foot: formFoot(isNew), body: `<form id="xf" novalidate>
    <div class="f"><label>Poza</label><div class="imgpick"><img id="x-prev" src="${m.img ? imgSrc(m.img) : ""}" alt="" ${m.img ? "" : "hidden"}>
      <label class="btn btn-ghost btn-sm">Schimbă poza<input type="file" accept="image/*" id="x-img" class="sr"></label></div></div>
    <div class="f"><label for="x-name">Nume *</label><input id="x-name" value="${esc(m.name)}" placeholder="de exemplu, Espressor profesional cu 2 grupuri"></div>
    <div class="f2"><div class="f"><label for="x-status">Pe site</label>${sel('x-status', Object.entries(STATUS_M), m.status)}</div><div class="f"><label for="x-cond">Stare</label>${sel('x-cond', [['Recondiționat', 'Recondiționat'], ['Nou', 'Nou']], m.cond)}</div></div>
    <div class="f2"><div class="f"><label for="x-pt">Tip preț</label>${sel('x-pt', PT, m.priceType)}</div><div class="f"><label for="x-price">Preț (lei)</label><input id="x-price" type="text" inputmode="decimal" value="${m.price ?? ''}"></div></div>
    <div class="f2"><div class="f"><label for="x-type">Tip aparat</label>${sel('x-type', Object.entries(typeLabel), m.type)}</div><div class="f"><label for="x-groups">Grupuri</label>${sel('x-groups', [[0, '—'], [1, '1'], [2, '2'], [3, '3'], [4, '4']], m.groups)}</div></div>
    <div class="f"><label for="x-war">Garanție</label><input id="x-war" value="${esc(m.warranty)}" placeholder="de exemplu, 12 luni"></div>
    <div class="f"><label for="x-short">O frază scurtă (apare pe card)</label><input id="x-short" value="${esc(m.short)}" maxlength="120"></div>
    <div class="f"><label for="x-desc">Povestea aparatului</label><textarea id="x-desc" rows="4">${esc(m.desc)}</textarea></div>
    <div class="f"><label for="x-checked">Ce am făcut la el <span class="muted">(câte una pe rând)</span></label><textarea id="x-checked" rows="4">${esc(m.checked.join('\n'))}</textarea></div>
    <div class="f"><label for="x-specs">Detalii tehnice <span class="muted">(câte una pe rând, „Denumire: valoare”)</span></label><textarea id="x-specs" rows="4">${esc(m.specs.map(s => s.join(': ')).join('\n'))}</textarea></div>
    <p class="err" id="x-err" hidden></p></form>` },
  (M, close) => {
    priceToggle(M);
    $('#x-img', M).onchange = e => readImage(e.target, d => { m.img = d; $('#x-prev', M).src = d; $('#x-prev', M).hidden = false; M.dispatchEvent(new Event('input')); });
    if (!isNew) $('#x-del', M).onclick = e => confirmBtn(e.currentTarget, () => { DB.machines.splice(i, 1); close(); admSaved('Espressor șters.'); });
    $('#xf', M).onsubmit = e => {
      e.preventDefault(); const g = id => $('#' + id, M).value.trim(), er = $('#x-err', M), bad = (id, msg) => { er.textContent = msg; er.hidden = false; $('#' + id, M).classList.add('bad'); $('#' + id, M).focus(); };
      $$('.bad', M).forEach(x => x.classList.remove('bad'));
      if (!g('x-name')) return bad('x-name', 'Scrie numele aparatului.');
      if (g('x-pt') !== 'cerere' && !(num(g('x-price')) > 0)) return bad('x-price', 'Pune un preț sau alege „Preț la cerere”.');
      Object.assign(m, { name: g('x-name'), type: g('x-type'), groups: +g('x-groups') || 0, cond: g('x-cond'), status: g('x-status'), priceType: g('x-pt'), price: g('x-pt') === 'cerere' ? null : num(g('x-price')),
        warranty: g('x-war') || '—', short: g('x-short'), desc: g('x-desc'), checked: g('x-checked').split('\n').map(s => s.trim()).filter(Boolean),
        specs: g('x-specs').split('\n').map(s => s.split(':')).filter(a => a[0].trim()).map(a => [a[0].trim(), a.slice(1).join(':').trim()]) });
      if (isNew) { m.slug = uniqueSlug(m.name, DB.machines); DB.machines.unshift(m); } else DB.machines[i] = m;
      if (!save.ok) { if (isNew) DB.machines.shift(); return bad('x-name', 'Nu am putut salva. Poza e prea mare pentru browser; încearcă una mai mică.'); }
      close(); admSaved(isNew ? 'Espressorul a fost adăugat pe site.' : undefined);
    };
  });
}
function editPart(i) {
  const isNew = i == null, p = isNew ? { name: '', code: '', cat: DB.partCats[0] || 'Altele', compat: [], priceType: 'fix', price: '', stock: 'stoc', note: '', status: 'activ' } : clone(DB.parts[i]);
  const cats = DB.partCats.includes(p.cat) ? DB.partCats : [...DB.partCats, p.cat];
  sheet({ title: isNew ? 'Piesă nouă' : 'Modifică piesa', foot: formFoot(isNew), body: `<form id="xf" novalidate>
    <div class="f"><label>Poza piesei</label><div class="imgpick"><span id="x-prev" class="pth">${partThumb(p)}</span>
      <label class="btn btn-ghost btn-sm">${p.img ? 'Schimbă poza' : 'Adaugă o poză'}<input type="file" accept="image/*" id="x-img" class="sr"></label>
      <button type="button" class="iconbtn" id="x-noimg" ${p.img ? '' : 'hidden'}>Scoate poza</button></div>
      <p class="muted" style="font-size:13px;margin:8px 0 0">Fără poză, pe site apare iconița categoriei. O micșorăm automat.</p></div>
    <div class="f"><label for="x-name">Nume *</label><input id="x-name" value="${esc(p.name)}"></div>
    <div class="f2"><div class="f"><label for="x-code">Cod piesă</label><input id="x-code" value="${esc(p.code)}" autocapitalize="characters"></div><div class="f"><label for="x-cat">Categorie</label>${sel('x-cat', cats.map(c => [c, c]), p.cat)}</div></div>
    <div class="f2"><div class="f"><label for="x-pt">Tip preț</label>${sel('x-pt', PT, p.priceType)}</div><div class="f"><label for="x-price">Preț (lei)</label><input id="x-price" type="text" inputmode="decimal" value="${p.price ?? ''}"></div></div>
    <div class="f2"><div class="f"><label for="x-stock">Stoc</label>${sel('x-stock', Object.entries(stockLabel).map(([k, l]) => [k, l.split(',')[0]]), p.stock)}</div><div class="f"><label for="x-status">Pe site</label>${sel('x-status', [['activ', 'Vizibilă'], ['ascuns', 'Ascunsă']], p.status || 'activ')}</div></div>
    <div class="f"><label for="x-compat">Se potrivește la <span class="muted">(câte una pe rând)</span></label><textarea id="x-compat" rows="3">${esc(p.compat.join('\n'))}</textarea></div>
    <div class="f"><label for="x-note">Sfat pentru client <span class="muted">(opțional)</span></label><textarea id="x-note" rows="2">${esc(p.note || '')}</textarea></div>
    <p class="err" id="x-err" hidden></p></form>` },
  (M, close) => {
    priceToggle(M);
    const prev = $('#x-prev', M), noimg = $('#x-noimg', M);
    $('#x-img', M).onchange = e => readImage(e.target, d => { p.img = d; prev.innerHTML = `<img src="${d}" alt="">`; noimg.hidden = false; M.dispatchEvent(new Event('input')); });
    noimg.onclick = () => { delete p.img; prev.innerHTML = partIcon($('#x-cat', M).value); noimg.hidden = true; M.dispatchEvent(new Event('input')); };
    $('#x-cat', M).addEventListener('change', e => { if (!p.img) prev.innerHTML = partIcon(e.target.value); });
    if (!isNew) $('#x-del', M).onclick = e => confirmBtn(e.currentTarget, () => { DB.parts.splice(i, 1); close(); admSaved('Piesă ștearsă.'); });
    $('#xf', M).onsubmit = e => {
      e.preventDefault(); const g = id => $('#' + id, M).value.trim(), er = $('#x-err', M), bad = (id, msg) => { er.textContent = msg; er.hidden = false; $('#' + id, M).classList.add('bad'); $('#' + id, M).focus(); };
      $$('.bad', M).forEach(x => x.classList.remove('bad'));
      if (!g('x-name')) return bad('x-name', 'Scrie numele piesei.');
      if (g('x-pt') !== 'cerere' && !(num(g('x-price')) > 0)) return bad('x-price', 'Pune un preț sau alege „Preț la cerere”.');
      Object.assign(p, { name: g('x-name'), code: g('x-code'), cat: g('x-cat'), priceType: g('x-pt'), price: g('x-pt') === 'cerere' ? null : num(g('x-price')), stock: g('x-stock'), status: g('x-status'),
        compat: g('x-compat').split('\n').map(s => s.trim()).filter(Boolean), note: g('x-note') });
      if (!p.compat.length) p.compat = ['întreabă-ne pentru modelul tău'];
      if (isNew) { p.slug = uniqueSlug(p.name, DB.parts); DB.parts.unshift(p); } else DB.parts[i] = p;
      if (!save.ok) { if (isNew) DB.parts.shift(); return bad('x-name', 'Nu am putut salva. Poza e prea mare pentru browser; încearcă una mai mică.'); }
      close(); admSaved(isNew ? 'Piesa a fost adăugată pe site.' : undefined);
    };
  });
}

/* ================================================================
   ROUTER
   ================================================================ */
const ROUTES = [[/^\/$/, pgHome], [/^\/espressoare$/, pgMachines], [/^\/espressoare\/([\w-]+)$/, pgMachine], [/^\/piese$/, pgParts], [/^\/piese\/([\w-]+)$/, pgPart],
  [/^\/service$/, pgService], [/^\/reparatie$/, pgRepair], [/^\/horeca$/, pgHoreca], [/^\/contact$/, pgContact], [/^\/termeni$/, pgTerms], [/^\/confidentialitate$/, pgPrivacy], [/^\/admin$/, pgAdmin]];
let cleanups = [], io;
function reveal() {
  io?.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv:not(.in)').forEach(el => io.observe(el));
}
function render() {
  if (admDirty && document.body.classList.contains('is-admin')) leaveOk();
  cleanups.forEach(f => f()); cleanups = []; toggleDrawer(false);
  const raw = location.hash.slice(1) || '/', [path, qs] = raw.split('?'), q = new URLSearchParams(qs || '');
  let page; for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { page = fn(m.slice(1), q); break; } }
  page = page || pgNotFound();
  const adminMode = !!page.admin; document.body.classList.toggle('is-admin', adminMode);
  ['#topbar', '#hdr', '#footer', '#fab', '#mbar'].forEach(s => $(s).hidden = adminMode);
  if (!adminMode) admDirty = null;
  const app = $('#app'); app.classList.remove('enter'); app.innerHTML = page.html; void app.offsetWidth; app.classList.add('enter'); prog.style.setProperty('--p', 0); document.title = (page.title ? page.title + ' · ' : '') + 'Espressoare Premium';
  $('#hdr').classList.toggle('solid', path !== '/');
  $$('[data-nav]').forEach(a => a.classList.toggle('active', path.startsWith(a.dataset.nav.slice(1)) && path !== '/'));
  scrollTo(0, 0); page.mount?.(); reveal();
  $$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));
  const ps = render.pendingScroll; render.pendingScroll = null;
  if (ps) { const el = document.getElementById(ps); el && setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60); }
}
document.addEventListener('click', e => {
  if (e.target.closest('.skip')) { e.preventDefault(); $('#app').focus(); return; }
  const s = e.target.closest('[data-scroll]'); if (s) render.pendingScroll = s.dataset.scroll;
  // link spre pagina pe care ești deja: browserul nu schimbă nimic, așa că o redesenăm noi (resetează filtrele, urcă sus, închide meniul)
  const a = e.target.closest('a[href^="#/"]');
  if (a && !a.target && !e.ctrlKey && !e.metaKey && a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); render(); }
});
addEventListener('hashchange', render);
const prog = $('#progress');
addEventListener('scroll', () => { $('#hdr').classList.toggle('scrolled', scrollY > 20);
  const max = document.documentElement.scrollHeight - innerHeight; prog.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0); }, { passive: true });
addEventListener('keydown', e => { if (e.key === 'Escape') toggleDrawer(false); });
renderChrome(); render();
})();
