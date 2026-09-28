# Espressoare Premium · prototip

Prototip funcțional pentru site-ul de service, piese și espressoare (București și Ilfov, accent pe aparate profesionale HoReCa).

**Demo:** https://lorenz10test.github.io/espressor/

> E un prototip de prezentare, fără server. Tot ce se modifică din admin se salvează doar în browserul celui care îl folosește (localStorage). Site-ul final va folosi Next.js + Supabase.

## Ce conține

**Site public**
- **Acasă**: hero, aparatul care se desface în piese la scroll, servicii, prețuri, espressoare, HoReCa, cum lucrăm, diagnostic, întrebări
- **Espressoare**: listă cu filtre (tip, stare, sortare) și pagină de produs (poză cu zoom, ce am făcut la el, detalii tehnice)
- **Piese**: căutare (merge și fără diacritice), filtre pe categorii, „doar pe stoc”, pagină de piesă
- **Service**: lista completă de prețuri, cum ajunge aparatul la noi, întrebări frecvente
- **Cere o reparație**: diagnostic în 4 pași. Marca și modelul sunt obligatorii. La final primești o estimare de preț, iar mesajul se deschide gata scris în WhatsApp.
- **HoReCa**, **Contact**, **Termeni**, **Confidențialitate**, pagină 404
- WhatsApp peste tot, cu mesaje precompletate. Pe mobil există o bară fixă jos cu Sună / WhatsApp / Reparație.

**Admin** (`#/admin`, sau linkul „Admin” din subsol)
- Panou cu statistici, acțiuni rapide și resetarea datelor demo
- Espressoare: adaugă, modifică, schimbă poza, marchează ca vândut, ascunde, șterge
- Piese: prețul și stocul se schimbă direct din listă; adaugă, modifică, șterge
- Servicii și prețuri, pachete HoReCa, categorii de piese, întrebări frecvente
- Setări: telefon, WhatsApp, email, adresă, program, date firmă (apar pe tot site-ul)
- Utilizatori: cel mult 5 persoane, toate cu aceleași drepturi

### Cont demo pentru admin

| Email | Parolă |
|---|---|
| `admin@espressoare.demo` | `demo-espresso-2026` |

Sunt doar pentru prototip, definite în `docs/data.js`. În site-ul real, autentificarea se face prin Supabase Auth.

## De completat înainte de lansare
- Numărul de telefon și de WhatsApp, emailul, adresa, CUI-ul și nr. Reg. Com. Se modifică din Admin → Setări sau din `docs/data.js`.
- Prețurile reale.
- Textele legale (Termeni, Confidențialitate), verificate de un jurist.
- Fotografiile reale din atelier. Cele de acum sunt generate cu AI, fără mărci pe ele.

## Rulare locală
```bash
python -m http.server 5510 --directory docs
```
Apoi deschide http://localhost:5510

## Publicare (GitHub Pages)
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder: **`/docs`** → Save.
