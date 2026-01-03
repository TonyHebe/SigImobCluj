export type Listing = {
  id: string;
  kind: "apartment" | "house" | "land";
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  details: readonly string[];
  description: string;
  images: readonly {
    src: string;
    alt: string;
  }[];
};

export const featuredListings = [
  {
    id: "apt-zorilor-3cam",
    kind: "apartment",
    badge: "Exclusivitate",
    title: "Apartament 3 camere • Zorilor",
    subtitle: "Terasa, parcare, aproape de UMF",
    price: "189.000 €",
    details: ["78 m²", "3 camere", "2 băi", "Et. 3/6"],
    description:
      "Apartament luminos, compartimentare practică și finisaje moderne. Potrivit pentru familie sau investiție, cu acces rapid spre UMF și centru. Terasă generoasă și posibilitate de parcare.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
        alt: "Apartament modern, living luminos",
      },
      {
        src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
        alt: "Bucătărie modernă, open space",
      },
      {
        src: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
        alt: "Dormitor amenajat modern",
      },
    ],
  },
  {
    id: "casa-faget",
    kind: "house",
    badge: "Nou",
    title: "Casă modernă • Făget",
    subtitle: "Curte, intimitate, acces rapid spre oraș",
    price: "465.000 €",
    details: ["156 m² utili", "5 camere", "Teren 420 m²"],
    description:
      "Casă contemporană într-o zonă verde, cu curte și intimitate. Ideală pentru cei care vor liniște, dar și acces rapid către oraș. Spații generoase, potrivită pentru familie.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
        alt: "Casă modernă cu fațadă luminoasă",
      },
      {
        src: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
        alt: "Living spațios într-o casă modernă",
      },
      {
        src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
        alt: "Detalii interioare premium",
      },
    ],
  },
  {
    id: "apt-gheorgheni",
    kind: "apartment",
    badge: "Recomandat",
    title: "Apartament 2 camere • Gheorgheni",
    subtitle: "Lângă Iulius Mall, finisaje premium",
    price: "142.500 €",
    details: ["56 m²", "2 camere", "Balcon", "Et. 5/10"],
    description:
      "Apartament ideal pentru locuit sau închiriere, aproape de Iulius Mall și facilități. Finisaje premium, balcon și acces excelent către transport și zone de birouri.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
        alt: "Apartament cu bucătărie open-space",
      },
      {
        src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
        alt: "Zonă de dining într-un apartament modern",
      },
      {
        src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
        alt: "Spațiu de lucru și living luminos",
      },
    ],
  },
  {
    id: "studio-marasti",
    kind: "apartment",
    badge: "Investiție",
    title: "Studio • Mărăști",
    subtitle: "Randament bun pentru închiriere",
    price: "94.900 €",
    details: ["32 m²", "1 cameră", "Renovat", "Et. 2/4"],
    description:
      "Studio compact, renovat, cu potențial bun pentru închiriere. Zonă bine conectată, aproape de transport public, campusuri și huburi de birouri.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
        alt: "Studio compact, amenajat modern",
      },
      {
        src: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=1600&q=80",
        alt: "Colț de living într-un studio modern",
      },
      {
        src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
        alt: "Pat și zonă de odihnă într-un studio",
      },
    ],
  },
  {
    id: "teren-someseni",
    kind: "land",
    badge: "Teren",
    title: "Teren intravilan • Someșeni",
    subtitle: "Potrivit pentru casă / duplex",
    price: "129.000 €",
    details: ["620 m²", "Front 18 m", "Utilități la limită"],
    description:
      "Teren intravilan cu front generos, potrivit pentru construcție casă sau duplex. Utilități la limită și acces bun către principalele artere.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
        alt: "Teren cu spațiu verde și deschidere",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        alt: "Peisaj verde, lot de teren",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        alt: "Vegetatie și teren în lumină naturală",
      },
    ],
  },
  {
    id: "penthouse-centru",
    kind: "apartment",
    badge: "Premium",
    title: "Penthouse • Centru",
    subtitle: "Vedere panoramică, 2 terase, lift",
    price: "399.000 €",
    details: ["112 m²", "4 camere", "2 terase", "Ultimul etaj"],
    description:
      "Penthouse premium cu vedere panoramică și două terase. Spații ample, lumină naturală și acces cu lift. Ideal pentru cei care vor confort în zona centrală.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        alt: "Apartament tip penthouse, interior elegant",
      },
      {
        src: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
        alt: "Dormitor elegant, lumină naturală",
      },
      {
        src: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
        alt: "Living modern cu spațiu generos",
      },
    ],
  },
] as const satisfies readonly Listing[];

export function getListingById(id: string) {
  return featuredListings.find((l) => l.id === id);
}

