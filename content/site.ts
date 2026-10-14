// All copy and data for the site. Real facts come from grupofirst.pt/firstfloor,
// the club's Linktree and public listings; event names/dates/prices are
// PLACEHOLDERS modelled on past nights (Quintas Académicas, First People,
// Ladies Night, Halloween Académico) until the club supplies the real calendar.

export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

type L = Record<Locale, string>;

export const club = {
  name: "First Floor Club",
  tagline: ["Rhythm", "Music", "Energy", "Life"],
  since: 2010,
  address: "Rua do Prior 39-41",
  city: "8000-301 Faro, Portugal",
  phone: "+351 915 966 199",
  phoneHref: "tel:+351915966199",
  whatsapp: "351915966199",
  tickets: "https://3cket.com/organizer/GRUPOFIRST",
  maps: "https://www.google.com/maps/search/?api=1&query=First+Floor+Club+Rua+do+Prior+41+Faro",
  socials: {
    instagram: "https://www.instagram.com/firstfloorclub/",
    facebook: "https://www.facebook.com/firstfloorfaro/",
    linktree: "https://linktr.ee/firstfloorclub",
  },
};

export type ClubEvent = {
  date: string; // ISO date the night starts
  open: string;
  close: string;
  title: string;
  subtitle: L;
  lineup: string[];
  genres: string[];
  ticketFrom: number;
  vipFrom: number;
  image: string;
  tag?: L;
  /** Weekly night (label shows the weekday) vs one-off special (label shows the date). */
  recurring?: boolean;
};

const special: L = { pt: "Evento especial", en: "Special event" };
const students: L = { pt: "Estudantes", en: "Students" };
const late = { open: "23:00", close: "04:00" };
const DJ = "André Salgueiro";

export const events: ClubEvent[] = [
  { date: "2026-09-26", ...late, title: "Opening Season 26/27", subtitle: { pt: "A noite que abre o ano", en: "The night that opens the year" }, lineup: [DJ, "Guest DJ TBA"], genres: ["Hits", "House"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/lasers-crowd.webp", tag: { pt: "Esgota rápido", en: "Selling fast" } },
  { date: "2026-10-01", ...late, recurring: true, title: "Quintas Académicas", subtitle: { pt: "Receção ao Caloiro", en: "Freshers' welcome" }, lineup: [DJ, "UAlg Residents"], genres: ["Commercial", "Reggaeton"], ticketFrom: 5, vipFrom: 100, image: "/img/hq/crowd-pink.webp", tag: students },
  { date: "2026-10-02", ...late, recurring: true, title: "First People", subtitle: { pt: "Hits & clássicos", en: "Hits & classics" }, lineup: [DJ, "MC Special Guest"], genres: ["Hits", "Classics"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/crowd-blue.webp" },
  { date: "2026-10-10", ...late, recurring: true, title: "First Saturdays", subtitle: { pt: "Guest DJ convidado", en: "Guest DJ night" }, lineup: [DJ, "Guest DJ TBA"], genres: ["House", "Commercial"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/golden-lights.webp" },
  { date: "2026-10-16", ...late, recurring: true, title: "Ladies Night", subtitle: { pt: "Entrada livre para elas até à 01h", en: "Free entry for ladies until 1am" }, lineup: [DJ, "Sax Live Act"], genres: ["R&B", "Reggaeton"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/magenta-girl.webp" },
  { date: "2026-10-22", ...late, title: "Noite do Traje", subtitle: { pt: "Quintas Académicas especial", en: "Student gown special" }, lineup: [DJ, "Tunas convidadas"], genres: ["Commercial", "Portuguesa"], ticketFrom: 5, vipFrom: 100, image: "/img/hq/floor-88mph.webp", tag: students },
  { date: "2026-10-31", ...late, title: "Halloween Académico", subtitle: { pt: "Traje obrigatório. Ou quase.", en: "Costume required. Almost." }, lineup: [DJ, "Guest DJ TBA"], genres: ["Hits", "Reggaeton"], ticketFrom: 12, vipFrom: 200, image: "/img/hq/red-lights.webp", tag: special },
  { date: "2026-11-07", ...late, title: "15 Anos First", subtitle: { pt: "Aniversário do Grupo First", en: "Grupo First anniversary" }, lineup: [DJ, "Special Guests"], genres: ["Classics", "House"], ticketFrom: 15, vipFrom: 250, image: "/img/hq/lasers.webp", tag: special },
  { date: "2026-11-13", ...late, title: "Throwback 2000s", subtitle: { pt: "Só clássicos dos anos 2000", en: "Only 2000s classics" }, lineup: [DJ], genres: ["2000s", "R&B"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/floor-cubes.webp" },
  { date: "2026-11-28", ...late, title: "Black Night", subtitle: { pt: "Dress code: preto", en: "Dress code: black" }, lineup: [DJ, "Guest DJ TBA"], genres: ["House", "Techno"], ticketFrom: 12, vipFrom: 180, image: "/img/hq/dj-magenta.webp" },
  { date: "2026-12-12", ...late, title: "Christmas Party", subtitle: { pt: "Festa de Natal First", en: "First Christmas party" }, lineup: [DJ], genres: ["Hits", "Commercial"], ticketFrom: 10, vipFrom: 150, image: "/img/hq/bar-neon.webp" },
  { date: "2026-12-31", open: "23:30", close: "06:00", title: "Réveillon 2027", subtitle: { pt: "Passagem de ano", en: "New Year's Eve" }, lineup: [DJ, "Special Guests"], genres: ["Hits", "House"], ticketFrom: 30, vipFrom: 400, image: "/img/hq/crowd-wide.webp", tag: special },
];

export const nights: { day: L; name: string; blurb: L; hours: string; image: string }[] = [
  {
    day: { pt: "Terça", en: "Tuesday" },
    name: "Social Night",
    blurb: { pt: "Abre a semana com os hits do momento.", en: "Open the week with the hits of the moment." },
    hours: "23:00 – 03:00",
    image: "/img/hq/neon-girl.webp",
  },
  {
    day: { pt: "Quarta", en: "Wednesday" },
    name: "Music Sessions",
    blurb: { pt: "DJs convidados e sessões temáticas.", en: "Guest DJs and themed sessions." },
    hours: "23:00 – 03:00",
    image: "/img/hq/decks-hands.webp",
  },
  {
    day: { pt: "Quinta", en: "Thursday" },
    name: "Quintas Académicas",
    blurb: { pt: "A noite dos estudantes de Faro.", en: "Faro's student night." },
    hours: "23:00 – 04:00",
    image: "/img/hq/crowd-wide.webp",
  },
  {
    day: { pt: "Sexta", en: "Friday" },
    name: "First People",
    blurb: { pt: "Dos últimos hits aos clássicos.", en: "From the latest hits to the classics." },
    hours: "23:00 – 04:00",
    image: "/img/hq/dj-arms.webp",
  },
  {
    day: { pt: "Sábado", en: "Saturday" },
    name: "First Saturdays",
    blurb: { pt: "A noite maior, com o residente André Salgueiro.", en: "The big night, with resident André Salgueiro." },
    hours: "23:00 – 04:00",
    image: "/img/hq/golden-lights.webp",
  },
];

const dict = {
  pt: {
    meta: {
      title: "First Floor Club · Faro",
      description:
        "First Floor Club, Faro. Desde 2010 a marcar a noite no centro de Faro. Eventos, bilhetes e reservas VIP.",
    },
    nav: {
      tickets: "Bilhetes",
      vip: "VIP",
      menu: "Menu",
      close: "Fechar",
      items: [
        ["Comprar bilhetes", "#eventos"],
        ["Reservar zona VIP", "/vip"],
        ["Eventos", "#eventos"],
        ["Noites da semana", "#noites"],
        ["Galeria", "#galeria"],
        ["Localização & contactos", "#contactos"],
      ] as [string, string][],
    },
    hero: {
      kicker: "Faro · Desde 2010",
      title: "O epicentro da noite em Faro",
      tickets: "Comprar bilhetes",
      vip: "Reservar VIP",
      scroll: "Scroll",
    },
    events: {
      title: "Próximos eventos",
      lineup: "Lineup",
      buy: "Comprar bilhete",
      vip: "Reservar VIP",
      from: "desde",
      vipNote: "Consumo mínimo equivalente ao valor da reserva",
      all: "Ver todos",
      calendar: "Calendário",
      drag: "Arrasta para ver mais",
    },
    manifesto: {
      kicker: "15 anos a marcar a noite",
      body: "Nascemos no primeiro andar da Rua do Prior e nunca mais descemos. Aqui, a noite conta-se em pessoas.",
      stat1: ["2010", "desde"],
      stat2: ["5", "noites por semana"],
      stat3: ["2", "bares"],
    },
    nights: {
      title: "Noites da semana",
      intro: "De terça a sábado há sempre uma razão para subir.",
      kicker: "Todas as semanas",
    },
    vip: {
      kicker: "The full experience",
      title: "Mesas VIP",
      body: "Mesa reservada junto à pista, serviço de garrafa com sparklers e um anfitrião dedicado toda a noite. Reserve com antecedência para noites especiais.",
      cta: "Reservar mesa",
      call: "Ligar",
      form: {
        name: "Nome",
        phone: "Telemóvel",
        date: "Data",
        people: "Pessoas",
        send: "Pedir reserva via WhatsApp",
        steps: ["Quando?", "Quantos?", "Quem?"],
        next: "Seguinte",
        back: "Voltar",
        more: "Mais datas",
        less: "Menos datas",
        pick: "Escolhe uma noite",
        special: "Evento especial",
        minimum: "Consumo mínimo estimado",
      },
      msg: "Olá! Gostaria de reservar uma mesa VIP",
    },
    vipPage: {
      metaTitle: "Mesas VIP · First Floor Club",
      kicker: "The full experience",
      title: "Mesas VIP",
      intro: "Escolhe a noite, a zona e a tua mesa. Serviço de garrafa com sparklers e anfitrião dedicado.",
      all: "Todos",
      book: "Reservar VIP",
      from: "desde",
      drinks: "Bebidas no valor da reserva",
      more: "Ver mais",
      special: "Evento especial",
      back: "Voltar às noites",
      steps: ["Zona & mesa", "Contactos", "Reservar"],
      help: "Grupos grandes ou dúvidas? Fala connosco.",
      chooseZone: "Escolhe a tua zona",
      legend: { available: "Disponível", last: "Última mesa", soldout: "Esgotado" },
      table: "Mesa",
      upTo: "até",
      people: "pessoas",
      min: "mín.",
      included: "Inclui",
      map: "Mapa da sala — em breve",
      continue: "Continuar",
      contactTitle: "Os teus contactos",
      name: "Nome",
      phone: "Telemóvel",
      email: "Email",
      guests: "Pessoas",
      note: "Nota (aniversário, pedidos especiais…)",
      summaryTitle: "Confirma a tua reserva",
      night: "Noite",
      zone: "Zona",
      minimum: "Consumo mínimo",
      contact: "Contacto",
      confirm: "Confirmar via WhatsApp",
      orCall: "Ou liga",
      stepBack: "Voltar",
      msg: "Olá! Gostaria de reservar uma mesa VIP no First Floor.",
    },
    gallery: { title: "Galeria", follow: "Segue-nos" },
    location: {
      title: "Localização",
      where: "Onde",
      contact: "Contacto",
      hours: "Horário",
      hoursShort: ["Ter – Qua · 23h – 03h", "Qui – Sáb · 23h – 04h"],
      closed: "Fechado",
      directions: "Como chegar",
      newsletter: "Recebe primeiro as novidades",
      email: "O teu email",
      subscribe: "Subscrever",
    },
    footer: {
      rights: "Todos os direitos reservados.",
      demo: "Conceito de design independente · eventos, preços e disponibilidade de exemplo.",
      links: ["Privacidade", "Cookies", "Termos", "Livro de Reclamações", "Trabalha connosco"],
    },
    weekdays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    weekdaysPlural: ["Domingos", "Segundas", "Terças", "Quartas", "Quintas", "Sextas", "Sábados"],
    months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  },
  en: {
    meta: {
      title: "First Floor Club · Faro",
      description:
        "First Floor Club, Faro. Shaping Faro's nightlife since 2010. Events, tickets and VIP bookings.",
    },
    nav: {
      tickets: "Tickets",
      vip: "VIP",
      menu: "Menu",
      close: "Close",
      items: [
        ["Buy tickets", "#eventos"],
        ["Book VIP zone", "/vip"],
        ["Events", "#eventos"],
        ["Weekly nights", "#noites"],
        ["Gallery", "#galeria"],
        ["Location & contact", "#contactos"],
      ] as [string, string][],
    },
    hero: {
      kicker: "Faro · Since 2010",
      title: "The epicentre of Faro nightlife",
      tickets: "Buy tickets",
      vip: "Book VIP",
      scroll: "Scroll",
    },
    events: {
      title: "Upcoming events",
      lineup: "Lineup",
      buy: "Buy ticket",
      vip: "Book VIP",
      from: "from",
      vipNote: "Minimum spend equal to the booking value",
      all: "Show all",
      calendar: "Calendar",
      drag: "Drag to see more",
    },
    manifesto: {
      kicker: "15 years shaping the night",
      body: "We were born on the first floor of Rua do Prior and never came down. Up here, nights are counted in people.",
      stat1: ["2010", "since"],
      stat2: ["5", "nights a week"],
      stat3: ["2", "bars"],
    },
    nights: {
      title: "Weekly nights",
      intro: "Tuesday to Saturday there's always a reason to go up.",
      kicker: "Every week",
    },
    vip: {
      kicker: "The full experience",
      title: "VIP Tables",
      body: "A reserved table by the dance floor, bottle service with sparklers and a dedicated host all night. Book ahead for special nights.",
      cta: "Book a table",
      call: "Call",
      form: {
        name: "Name",
        phone: "Phone",
        date: "Date",
        people: "Guests",
        send: "Request via WhatsApp",
        steps: ["When?", "How many?", "Who?"],
        next: "Next",
        back: "Back",
        more: "More dates",
        less: "Fewer dates",
        pick: "Pick a night",
        special: "Special event",
        minimum: "Estimated minimum spend",
      },
      msg: "Hi! I'd like to book a VIP table",
    },
    vipPage: {
      metaTitle: "VIP Tables · First Floor Club",
      kicker: "The full experience",
      title: "VIP Tables",
      intro: "Pick the night, the zone and your table. Bottle service with sparklers and a dedicated host.",
      all: "All",
      book: "Book VIP",
      from: "from",
      drinks: "Drinks worth the booking value",
      more: "Show more",
      special: "Special event",
      back: "Back to nights",
      steps: ["Zone & table", "Contact", "Book"],
      help: "Large groups or questions? Talk to us.",
      chooseZone: "Choose your zone",
      legend: { available: "Available", last: "Last table", soldout: "Sold out" },
      table: "Table",
      upTo: "up to",
      people: "people",
      min: "min.",
      included: "Includes",
      map: "Floor map — coming soon",
      continue: "Continue",
      contactTitle: "Your details",
      name: "Name",
      phone: "Phone",
      email: "Email",
      guests: "Guests",
      note: "Note (birthday, special requests…)",
      summaryTitle: "Confirm your booking",
      night: "Night",
      zone: "Zone",
      minimum: "Minimum spend",
      contact: "Contact",
      confirm: "Confirm via WhatsApp",
      orCall: "Or call",
      stepBack: "Back",
      msg: "Hi! I'd like to book a VIP table at First Floor.",
    },
    gallery: { title: "Gallery", follow: "Follow us" },
    location: {
      title: "Location",
      where: "Where",
      contact: "Contact",
      hours: "Opening hours",
      hoursShort: ["Tue – Wed · 11pm – 3am", "Thu – Sat · 11pm – 4am"],
      closed: "Closed",
      directions: "Get directions",
      newsletter: "Hear it first",
      email: "Your email",
      subscribe: "Subscribe",
    },
    footer: {
      rights: "All rights reserved.",
      demo: "Independent design concept · sample events, prices, and availability.",
      links: ["Privacy", "Cookies", "Terms", "Complaints Book", "Work with us"],
    },
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekdaysPlural: ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

export type Dict = (typeof dict)["pt"];
export const getDict = (l: Locale): Dict => dict[l];
