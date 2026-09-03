import { json, teamOk, getJson, putJson } from "./_lib.js";

const key = "team-internal-dates-v2";

const seed = [
  {
    id: "kb-fri-meet",
    title: "Treffpunkt Kerbeborsch",
    date: "2026-09-11",
    time: "17:30",
    owner: "Alle Kerbeborsch",
    location: "Kerbeplatz",
    note: "Gemeinsamer Start in den Kerbefreitag."
  },
  {
    id: "kb-fri-change",
    title: "Umziehen für Einlauf",
    date: "2026-09-11",
    time: "19:30",
    owner: "Kerbeborsch & Wuzzemädels",
    location: "Aktivenbereich",
    note: "Montur vollständig bereithalten."
  },
  {
    id: "kd-fri-einlauf",
    title: "Einlauf & Vereidigung",
    date: "2026-09-11",
    time: "20:00",
    owner: "Kerbeborsch & Wuzzemädels",
    location: "Festzelt",
    note: "Gemeinsamer Einlauf."
  },
  {
    id: "kd-fri-show",
    title: "Kerbeshow",
    date: "2026-09-11",
    time: "21:30",
    owner: "Aktive",
    location: "Festzelt",
    note: "Freitagabend."
  },
  {
    id: "kb-sat-meet",
    title: "Treffpunkt Jubiläumsabend",
    date: "2026-09-12",
    time: "18:30",
    owner: "Alle Kerbeborsch",
    location: "Kerbeplatz",
    note: "Vorbereitung auf den Jubiläumseinlauf."
  },
  {
    id: "kb-sat-change",
    title: "Umziehen für Jubiläumseinlauf",
    date: "2026-09-12",
    time: "19:00",
    owner: "Kerbeborsch seit 1976",
    location: "Aktivenbereich",
    note: "Montur vollständig."
  },
  {
    id: "kd-sat-jubi",
    title: "Jubiläumseinlauf aller Kerbeborsch seit 1976",
    date: "2026-09-12",
    time: "19:30",
    owner: "Kerbeborsch seit 1976",
    location: "Festzelt",
    note: "Gemeinsamer Jubiläumseinlauf."
  },
  {
    id: "kb-sun-meet",
    title: "Treffpunkt Festumzug",
    date: "2026-09-13",
    time: "12:30",
    owner: "Aktive",
    location: "Kerbeplatz",
    note: "Gemeinsame Vorbereitung auf den Umzug."
  },
  {
    id: "kb-sun-change",
    title: "Umziehen für Festumzug",
    date: "2026-09-13",
    time: "13:15",
    owner: "Aktive",
    location: "Aktivenbereich",
    note: "Montur vollständig."
  },
  {
    id: "kd-sun-umzug",
    title: "Festumzug",
    date: "2026-09-13",
    time: "14:00",
    owner: "Aktive",
    location: "Altenhain",
    note: "Gemeinsamer Festumzug."
  },
  {
    id: "kb-sun-burial-meet",
    title: "Treffpunkt Beerdigung",
    date: "2026-09-13",
    time: "17:30",
    owner: "Aktive",
    location: "Kerbeplatz",
    note: "Vorbereitung auf den traditionellen Abschluss."
  },
  {
    id: "kd-sun-beerdigung",
    title: "Beerdigung",
    date: "2026-09-13",
    time: "18:00",
    owner: "Aktive",
    location: "Kerbeplatz",
    note: "Traditioneller Abschluss."
  }
];

export async function onRequest({ request, env }) {
  if (!teamOk(request, env)) {
    return json({ error: "PIN falsch" }, 401);
  }

  try {
    let d = await getJson(env.WUZZE_KV, key, null);

    // Alten, leeren oder beschädigten KV-Eintrag sauber abfangen
    if (!d || typeof d !== "object") {
      d = {};
    }

    if (!Array.isArray(d.dates)) {
      d.dates = [];
    }

    // Fehlende Standardtermine ergänzen
    const ids = new Set(d.dates.map(x => x?.id).filter(Boolean));

    for (const item of seed) {
      if (!ids.has(item.id)) {
        d.dates.push({ ...item });
      }
    }

    // Chronologisch sortieren
    d.dates.sort((a, b) =>
      `${a.date || ""}${a.time || ""}`.localeCompare(
        `${b.date || ""}${b.time || ""}`
      )
    );

    if (request.method === "GET") {
      d.updatedAt = new Date().toISOString();

      await putJson(env.WUZZE_KV, key, d);

      return json(d);
    }

    const b = await request.json().catch(() => ({}));

    if (request.method === "POST") {
      if (
        !String(b.title || "").trim() ||
        !b.date ||
        !b.time
      ) {
        return json(
          { error: "Termin, Datum und Uhrzeit fehlen" },
          400
        );
      }

      d.dates.push({
        id:
          "date-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2, 7),

        title: String(b.title).trim().slice(0, 160),
        date: String(b.date).slice(0, 10),
        time: String(b.time).slice(0, 5),
        owner: String(b.owner || "").trim().slice(0, 120),
        location: String(b.location || "").trim().slice(0, 160),
        note: String(b.note || "").trim().slice(0, 400),
        createdBy: String(b.createdBy || "Team").slice(0, 80)
      });

    } else if (request.method === "DELETE") {

      if (!b.id) {
        return json({ error: "ID fehlt" }, 400);
      }

      d.dates = d.dates.filter(x => x.id !== b.id);

    } else {
      return json({ error: "Method not allowed" }, 405);
    }

    d.dates.sort((a, b) =>
      `${a.date || ""}${a.time || ""}`.localeCompare(
        `${b.date || ""}${b.time || ""}`
      )
    );

    d.updatedAt = new Date().toISOString();

    await putJson(env.WUZZE_KV, key, d);

    return json(d);

  } catch (error) {
    console.error("team-dates-live:", error);

    return json(
      {
        error: "Termine konnten nicht geladen werden",
        detail: String(error?.message || error)
      },
      500
    );
  }
}
