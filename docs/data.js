/* Date demo. În site-ul real vin din baza de date (Supabase) și se editează din admin. */
window.DB_DEFAULT = {
  version: 3,   // crește numărul când schimbi datele de mai jos: browserele încarcă din nou datele demo
  settings: {
    brand: 'Espressoare Premium',
    phone: '07XX XXX XXX',          // de completat
    tel: '+40700000000',            // de completat
    wa: '40700000000',              // de completat (fără +)
    email: 'contact@exemplu.ro',    // de completat
    address: 'Str. Exemplu nr. 10, Sector 2, București', // de completat
    hours: [['Luni – Vineri', '08:00 – 18:00'], ['Sâmbătă', '09:00 – 14:00'], ['Duminică', 'doar urgențe HoReCa']],
    company: 'DATAPAD SRL', cui: 'ROxxxxxxxx', regcom: 'J40/xxxx/xxxx'
  },

  machines: [
    { slug: 'profesional-2-grupuri-dual-boiler', name: 'Espressor profesional cu 2 grupuri, dual boiler', type: 'profesional', groups: 2, cond: 'Recondiționat',
      img: 'p1.jpg', priceType: 'fix', price: 14900, status: 'activ', warranty: '12 luni',
      short: 'Ideal pentru o cafenea cu 150–300 de cafele pe zi.',
      desc: 'L-am primit de la o cafenea care și-a schimbat conceptul. L-am desfăcut complet, am schimbat toate garniturile, sitele și electrovalvele, am decalcifiat boilerele și am calibrat presiunea. Merge ca în prima zi și arată aproape la fel.',
      specs: [['Grupuri', '2'], ['Boiler', 'dual boiler, 11 l + 1,8 l'], ['Alimentare', '230 V / 380 V'], ['Pompă', 'rotativă, volumetrică'], ['Dimensiuni', '78 × 56 × 53 cm'], ['An fabricație', '2019']],
      checked: ['Garnituri și site noi la ambele grupuri', 'Boilere decalcifiate', 'Electrovalve înlocuite', 'Presiune calibrată la 9 bar', 'Testat cu 200 de cafele'] },
    { slug: 'profesional-3-grupuri-multiboiler', name: 'Espressor profesional cu 3 grupuri, multiboiler', type: 'profesional', groups: 3, cond: 'Nou',
      img: 'p2.jpg', priceType: 'cerere', price: null, status: 'activ', warranty: '24 luni',
      short: 'Pentru localuri aglomerate, cu temperatură reglabilă pe fiecare grup.',
      desc: 'Un aparat pentru cafenelele care nu au timp de pauză. Fiecare grup are boilerul lui, așa că poți regla temperatura separat, pentru blenduri diferite. Îl aducem la comandă, îl instalăm și îți arătăm cum să-l folosești.',
      specs: [['Grupuri', '3'], ['Boiler', 'multiboiler, independent pe grup'], ['Alimentare', '380 V'], ['Comenzi', 'ecran tactil pe fiecare grup'], ['Dimensiuni', '105 × 58 × 55 cm']],
      checked: ['Instalare și racord la apă incluse', 'Reglaj râșniță la punerea în funcțiune', 'Instruire pentru baristă'] },
    { slug: 'automat-casa-rasnita', name: 'Espressor automat cu râșniță integrată', type: 'automat', groups: 0, cond: 'Recondiționat',
      img: 'p3.jpg', priceType: 'de-la', price: 1450, status: 'activ', warranty: '6 luni',
      short: 'Pui boabele, apeși un buton și ai cafeaua.',
      desc: 'Un automat de casă numai bun pentru cine vrea cafea bună fără bătăi de cap. I-am schimbat unitatea de infuzare, l-am decalcifiat și i-am curățat circuitul de lapte. Prețul diferă puțin în funcție de culoare și accesorii.',
      specs: [['Tip', 'automat, cu râșniță ceramică'], ['Rezervor apă', '1,8 l'], ['Spumare lapte', 'lance manuală'], ['Dimensiuni', '24 × 44 × 36 cm']],
      checked: ['Unitate de infuzare nouă', 'Decalcifiere completă', 'Râșniță reglată', 'Testat 50 de cafele'] },
    { slug: 'profesional-2-grupuri-clasic', name: 'Espressor profesional cu 2 grupuri, clasic', type: 'profesional', groups: 2, cond: 'Recondiționat',
      img: 'hero.jpg', priceType: 'fix', price: 11900, status: 'activ', warranty: '12 luni',
      short: 'Un cal de povară: simplu, robust, ușor de întreținut.',
      desc: 'Genul de aparat care merge ani de zile dacă îl îngrijești. Are un singur boiler mare și schimbătoare de căldură pe grupuri, deci e rapid și stabil la temperatură. I-am refăcut toată partea hidraulică.',
      specs: [['Grupuri', '2'], ['Boiler', '11 l, schimbătoare de căldură'], ['Alimentare', '230 V / 380 V'], ['Pompă', 'rotativă']],
      checked: ['Circuit hidraulic refăcut', 'Garnituri și site noi', 'Presostat nou', 'Testat 150 de cafele'] },
    { slug: 'profesional-1-grup', name: 'Espressor profesional cu 1 grup', type: 'profesional', groups: 1, cond: 'Recondiționat',
      img: 'p1.jpg', priceType: 'fix', price: 7900, status: 'activ', warranty: '12 luni',
      short: 'Pentru o cafenea mică, un food truck sau un birou.',
      desc: 'Compact, dar făcut ca aparatele mari. Merge pe 230 V, deci îl poți pune aproape oriunde. Potrivit dacă faci până la 80–100 de cafele pe zi.',
      specs: [['Grupuri', '1'], ['Boiler', '5 l'], ['Alimentare', '230 V'], ['Dimensiuni', '45 × 53 × 50 cm']],
      checked: ['Garnituri și site noi', 'Decalcifiere', 'Testat 100 de cafele'] },
    { slug: 'automat-casa-lapte', name: 'Espressor automat cu sistem de lapte', type: 'automat', groups: 0, cond: 'Recondiționat',
      img: 'p3.jpg', priceType: 'fix', price: 2100, status: 'vandut', warranty: '6 luni',
      short: 'Cappuccino dintr-o singură apăsare.',
      desc: 'Automat cu carafă de lapte, pentru cine bea mai mult cappuccino și latte.',
      specs: [['Tip', 'automat, cu carafă de lapte'], ['Rezervor apă', '1,8 l']],
      checked: ['Unitate de infuzare nouă', 'Circuit lapte curățat'] }
  ],

  partCats: ['Garnituri', 'Site de duș', 'Portafiltre și coșuri', 'Pompe', 'Rezistențe', 'Electrovalve', 'Presostate și manometre', 'Filtre de apă'],
  parts: [
    { slug: 'garnitura-grup-8-5mm', name: 'Garnitură de grup 73 × 57 × 8,5 mm', cat: 'Garnituri', code: 'GR-7357-85', compat: ['majoritatea aparatelor profesionale cu grup E61', 'multe modele cu 2–3 grupuri'], priceType: 'fix', price: 45, stock: 'stoc', note: 'Dacă nu știi grosimea, măsoar-o pe cea veche sau trimite-ne modelul aparatului.' },
    { slug: 'sita-dus-58mm', name: 'Sită de duș 58 mm', cat: 'Site de duș', code: 'SD-58', compat: ['grupuri de 58 mm'], priceType: 'fix', price: 65, stock: 'stoc', note: 'Merită schimbată odată cu garnitura, la 6–12 luni.' },
    { slug: 'cos-dublu-18g', name: 'Coș portafiltru dublu 18 g', cat: 'Portafiltre și coșuri', code: 'CS-D18', compat: ['portafiltre de 58 mm'], priceType: 'fix', price: 90, stock: 'stoc' },
    { slug: 'portafiltru-complet-58', name: 'Portafiltru complet 58 mm, cu 2 ciocuri', cat: 'Portafiltre și coșuri', code: 'PF-58-2', compat: ['grupuri E61 și similare'], priceType: 'fix', price: 320, stock: 'stoc' },
    { slug: 'pompa-rotativa-150l', name: 'Pompă rotativă 150 l/h', cat: 'Pompe', code: 'PR-150', compat: ['aparate profesionale cu pompă rotativă'], priceType: 'de-la', price: 780, stock: 'comanda', note: 'O aducem în 2–4 zile lucrătoare. Montajul îl putem face noi.' },
    { slug: 'pompa-vibratie-48w', name: 'Pompă cu vibrații 48 W', cat: 'Pompe', code: 'PV-48', compat: ['aparate de casă cu portafiltru', 'unele automate'], priceType: 'fix', price: 160, stock: 'stoc' },
    { slug: 'rezistenta-boiler-3kw', name: 'Rezistență boiler 3000 W', cat: 'Rezistențe', code: 'RZ-3000', compat: ['aparate cu 2 grupuri, boiler 11 l'], priceType: 'de-la', price: 390, stock: 'stoc', note: 'Există mai multe forme de flanșă. Trimite-ne o poză cu cea veche.' },
    { slug: 'electrovalva-3-cai', name: 'Electrovalvă cu 3 căi, 230 V', cat: 'Electrovalve', code: 'EV-3C-230', compat: ['grupuri profesionale'], priceType: 'fix', price: 210, stock: 'stoc' },
    { slug: 'presostat-boiler', name: 'Presostat boiler 0–2 bar', cat: 'Presostate și manometre', code: 'PS-02', compat: ['aparate cu boiler de abur'], priceType: 'fix', price: 240, stock: 'epuizat' },
    { slug: 'filtru-apa-dedurizare', name: 'Filtru de apă cu dedurizare', cat: 'Filtre de apă', code: 'FA-DED', compat: ['orice aparat racordat la apă'], priceType: 'de-la', price: 450, stock: 'stoc', note: 'Cel mai ieftin mod de a ține calcarul departe de boiler.' }
  ],

  services: [
    { cat: 'Diagnostic și deplasare', items: [
      { name: 'Diagnostic la atelier', note: 'se scade din reparație dacă o facem noi', priceType: 'fix', price: 150 },
      { name: 'Deplasare în București', note: 'în aceeași zi, de obicei', priceType: 'fix', price: 150 },
      { name: 'Deplasare în Ilfov', note: 'în funcție de distanță', priceType: 'de-la', price: 200 } ] },
    { cat: 'Întreținere', items: [
      { name: 'Decalcifiere, aparat cu 1 grup', priceType: 'de-la', price: 300 },
      { name: 'Decalcifiere, aparat cu 2 grupuri', priceType: 'de-la', price: 450 },
      { name: 'Garnitură și sită, pe grup', note: 'piesele incluse', priceType: 'de-la', price: 180 },
      { name: 'Revizie completă', note: 'curățare, garnituri, calibrare, test', priceType: 'de-la', price: 900 } ] },
    { cat: 'Reparații', items: [
      { name: 'Înlocuire rezistență', priceType: 'de-la', price: 350 },
      { name: 'Înlocuire electrovalvă', priceType: 'de-la', price: 250 },
      { name: 'Presostat sau manometru', priceType: 'de-la', price: 250 },
      { name: 'Lance de abur', note: 'robinet, garnituri, duză', priceType: 'de-la', price: 150 },
      { name: 'Pompă', note: 'depinde mult de model', priceType: 'cerere' },
      { name: 'Electronică și dozare', priceType: 'cerere' } ] },
    { cat: 'Aparate de casă', items: [
      { name: 'Decalcifiere automat', priceType: 'de-la', price: 180 },
      { name: 'Revizie automat', priceType: 'de-la', price: 350 },
      { name: 'Unitate de infuzare', note: 'curățare sau înlocuire', priceType: 'de-la', price: 250 } ] }
  ],

  horeca: [
    { icon: '↻', title: 'Abonament de întreținere', text: 'Venim la tine periodic, curățăm, schimbăm garniturile și verificăm tot. Dacă se strică ceva între vizite, ai prioritate.', price: 'de la 250 lei / lună' },
    { icon: '⇄', title: 'Aparat de schimb', text: 'Dacă aparatul tău trebuie să stea la noi în atelier, îți lăsăm unul de-al nostru. Localul nu se oprește.', price: 'inclus în abonament' },
    { icon: '◎', title: 'Comodat și închiriere', text: 'Pornești o cafenea și nu vrei să dai mulți bani pe aparat? Îți punem unul profesional în local, cu service inclus.', price: 'ofertă personalizată' },
    { icon: '⌁', title: 'Instalare și punere în funcțiune', text: 'Racord la apă și scurgere, filtru de apă, reglaj de râșniță și o oră cu barista, ca să iasă cafeaua cum trebuie din prima zi.', price: 'de la 400 lei' }
  ],

  /* Conturi DEMO pentru prezentare. În site-ul real: Supabase Auth, parole criptate. */
  admins: [
    { name: 'Administrator', email: 'admin@espressoare.demo', pass: 'demo-espresso-2026' },
    { name: 'Tehnician atelier', email: 'atelier@espressoare.demo', pass: 'demo-atelier-2026' }
  ],

  faq: [
    ['Cât durează o reparație?', 'Cele mai multe le terminăm în 1–3 zile lucrătoare. Garniturile și decalcifierile la cafenele le facem de obicei pe loc. Dacă trebuie să comandăm o piesă, îți spunem de la început cât durează.'],
    ['Îmi spuneți prețul înainte?', 'Da. După diagnostic primești prețul exact și nu ne apucăm de nimic fără acordul tău. Dacă descoperim altceva pe parcurs, te sunăm întâi.'],
    ['Cum trimit aparatul prin curier?', 'Scrie-ne pe WhatsApp și îți trimitem noi curierul. Ambalează aparatul bine, ideal în cutia originală, și golește apa din rezervor și din tavă.'],
    ['Lucrați și cu aparate de casă?', 'Da, reparăm și automate de casă, espressoare manuale și aparate cu capsule. Accentul nostru rămâne însă pe aparatele profesionale.'],
    ['Ce garanție primesc?', 'Garanție scrisă pentru manoperă și pentru piesele montate. Durata depinde de lucrare și ți-o spunem când primești oferta.'],
    ['Veniți și în weekend?', 'Sâmbăta lucrăm până la 14:00. Pentru cafenelele cu abonament venim și duminica, dacă e urgent.']
  ]
};
