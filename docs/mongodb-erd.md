# MongoDB ERD (Schema – din cod)

Diagrama de mai jos descrie colecțiile MongoDB folosite efectiv în aplicație (conform `src/lib/usersDb.ts` și `src/lib/listingsDb.ts`).

```mermaid
erDiagram
  USERS {
    string _id PK "email normalizat (lowercase)"
    string email
    string passwordHash "format: scrypt:<saltHex>:<hashHex>"
    datetime createdAt
    datetime updatedAt
  }

  LISTINGS {
    string _id PK "egal cu Listing.id"
    string id "duplicat, pentru consum în app"
    string kind "apartment|house|land"
    string badge
    string title
    string subtitle
    string price
    string description
    datetime createdAt
    datetime updatedAt
  }

  LISTING_DETAILS {
    string value "un element din listings.details[]"
  }

  LISTING_IMAGES {
    string src
    string alt
  }

  %% Embedded arrays (nu colecții separate în DB; sunt câmpuri embed în documentul listings)
  LISTINGS ||--o{ LISTING_DETAILS : embeds
  LISTINGS ||--o{ LISTING_IMAGES : embeds
```

## Observații

- **Nu există relații între `users` și `listings`** în codul actual (nicio referință / foreign key).
- Formularele `contact` și `vizionare` trimit email (SMTP) și **nu salvează** în MongoDB.

