# Documentare Implementare MongoDB

## Descrierea Bazei de Date

În aplicația implementată, ca și în orice aplicație care conține date, baza de date este o colecție organizată de date. "Baza de date pentru a putea fi actualizată, modificată, utilizată în obținerea de rapoarte, se află sub controlul unui program. Întreg acest ansamblu poartă numele de SGBD (Sistem de Gestionare a Bazelor de Date), sau în engleză DBMS (Data Base Management System)." (Sitar, 2019)

MongoDB este o bază de date NoSQL orientată pe documente, fiind una dintre cele mai populare soluții pentru aplicațiile web moderne. Cu flexibilitatea sa în structurarea datelor, scalabilitatea orizontală și performanța ridicată, MongoDB a devenit alegerea principală a bazelor de date pentru aplicațiile web bazate pe JavaScript și Node.js. Datele sistemului sunt stocate în cloud prin serviciul MongoDB Atlas, fiind baza de date cea mai potrivită pentru platforma web implementată în Next.js. Existența unei baze de date este o necesitate vitală pentru un sistem deoarece aceasta facilitează manipularea datelor și stocarea acestora.

## Configurarea Conexiunii la MongoDB

Primul pas în implementarea bazei de date a fost configurarea conexiunii la MongoDB. Am creat un modul dedicat pentru gestionarea conexiunii (`mongodb.ts`) care utilizează un pattern de singleton pentru a menține o singură conexiune activă pe toată durata aplicației. Acest lucru este esențial pentru performanță, deoarece deschiderea conexiunilor noi este costisitoare.

Variabilele de mediu necesare pentru conexiune sunt:
- **MONGODB_URI** - URI-ul de conectare la cluster-ul MongoDB Atlas
- **MONGODB_DB** - numele bazei de date (opțional, poate fi inclus în URI)

Conexiunea este cache-uită în mediul de dezvoltare pentru a preveni recrearea conexiunilor la fiecare hot reload.

## Colecții Create

Am creat 2 colecții care reprezintă entitățile esențiale din cadrul aplicației. Le-am denumit în funcție de utilizarea acestora și anume:

### 1. Colecția `listings` (Oferte Imobiliare)

Prima colecție creată este colecția **listings** care stochează toate ofertele imobiliare disponibile. Aceasta conține documente cu următoarea structură:

| Câmp | Tip | Descriere |
|------|-----|-----------|
| `_id` | String | Identificator unic al ofertei (cheie primară), identifică în mod unic fiecare document în colecție |
| `kind` | String | Tipul proprietății: "apartment", "house" sau "land" |
| `badge` | String | Eticheta afișată (ex: "Exclusivitate", "Nou", "Premium") |
| `title` | String | Titlul ofertei (ex: "Apartament 3 camere • Zorilor") |
| `subtitle` | String | Subtitlul descriptiv |
| `price` | String | Prețul afișat (ex: "189.000 €") |
| `details` | Array[String] | Lista de detalii (suprafață, camere, băi, etaj) |
| `description` | String | Descrierea completă a proprietății |
| `images` | Array[Object] | Lista de imagini cu câmpurile `src` și `alt` |
| `createdAt` | Date | Data creării documentului |
| `updatedAt` | Date | Data ultimei actualizări |

Această colecție permite stocarea și gestionarea tuturor ofertelor imobiliare, oferind funcționalități complete de CRUD (Create, Read, Update, Delete). Documentele sunt sortate implicit după `updatedAt` în ordine descrescătoare pentru a afișa cele mai recente actualizări primele.

### 2. Colecția `users` (Utilizatori)

A doua colecție creată este colecția **users** pentru gestionarea utilizatorilor aplicației. Aceasta conține documente cu următoarea structură:

| Câmp | Tip | Descriere |
|------|-----|-----------|
| `_id` | String | Email-ul normalizat (lowercase), servește ca cheie primară unică |
| `email` | String | Adresa de email a utilizatorului |
| `passwordHash` | String | Hash-ul parolei (folosind algoritm de criptare sigur) |
| `createdAt` | Date | Data creării contului |
| `updatedAt` | Date | Data ultimei actualizări |

Email-ul este utilizat ca identificator unic (`_id`) pentru a asigura că nu pot exista conturi duplicate. MongoDB creează automat un index unic pe câmpul `_id`, astfel unicitatea este garantată de baza de date.

## Funcționalități Implementate

### Pentru Colecția `listings`:

1. **getAllListings()** - Returnează toate ofertele sortate după data actualizării
2. **getListingById(id)** - Returnează o ofertă specifică după ID
3. **upsertListing(listing)** - Creează sau actualizează o ofertă (operație upsert)
4. **deleteListingById(id)** - Șterge o ofertă după ID
5. **resetListingsToDefaults()** - Resetează colecția la datele inițiale
6. **seedListingsIfEmpty()** - Populează automat colecția dacă este goală

### Pentru Colecția `users`:

1. **getUserByEmail(email)** - Returnează un utilizator după email
2. **createUser({email, passwordHash})** - Creează un cont nou de utilizator

## Avantajele MongoDB pentru această Aplicație

1. **Flexibilitate** - Structura documentelor poate fi modificată ușor fără migrări complexe
2. **Performanță** - Operațiile de citire sunt foarte rapide datorită stocării în format BSON
3. **Scalabilitate** - MongoDB Atlas oferă scalare automată în cloud
4. **Compatibilitate** - Driver-ul oficial pentru Node.js se integrează perfect cu Next.js
5. **Indexare automată** - Indexul pe `_id` asigură căutări rapide

## Schema de Conectare

```
Next.js Application
        │
        ▼
    mongodb.ts (Singleton Connection)
        │
        ▼
    MongoDB Atlas Cluster
        │
        ├── Database: sig-imob-cluj
        │       │
        │       ├── Collection: listings
        │       │       └── Documents: oferte imobiliare
        │       │
        │       └── Collection: users
        │               └── Documents: conturi utilizatori
```

## Concluzie

Implementarea MongoDB în această aplicație imobiliară oferă o soluție robustă și scalabilă pentru gestionarea datelor. Structura orientată pe documente se potrivește perfect cu natura datelor imobiliare, unde fiecare ofertă poate avea un număr variabil de imagini și detalii. Conexiunea singleton asigură performanță optimă, iar integrarea cu MongoDB Atlas oferă fiabilitate și disponibilitate ridicată în producție.
