const express = require("express");
const datotecniSustav = require("fs");
const path = require("path");
const Zapisi = require("./js/server/zapisi.cjs");

const server = express();

const port = process.env.PORT || 3000;
const putanja = __dirname;
const bazaZapisa = new Zapisi(path.join(putanja, "zapisi.csv"));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use("/JSklijent", express.static(path.join(putanja, "js", "klijent")));
server.use("/dizajn", express.static(path.join(putanja, "css")));
server.use("/resursi", express.static(path.join(putanja, "resursi")));

const direktorijHtml = path.join(putanja, "html");

server.get("/", function (zahtjev, odgovor) {
  odgovor.redirect("/index");
});

function posluziStranicu(ruta, datoteka) {
  server.get(ruta, function (zahtjev, odgovor) {
    odgovor.sendFile(path.join(direktorijHtml, datoteka));
  });
}

posluziStranicu("/index", "index.html");
posluziStranicu("/igraci", "igraci.html");
posluziStranicu("/turniri", "turniri.html");
posluziStranicu("/pravila", "pravila.html");
posluziStranicu("/oprema", "oprema.html");
posluziStranicu("/galerija", "galerija.html");
posluziStranicu("/dokumentacija", "dokumentacija.html");
posluziStranicu("/obrValidacija", "kontakt.html");

function generirajZaglavlje(naslov) {
  return (
    "<!DOCTYPE html>" +
    '<html lang="hr">' +
    "<head>" +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    "<title>Pikado portal — " + naslov + "</title>" +
    '<link rel="stylesheet" href="/dizajn/mstarcevi21.css">' +
    '<link rel="stylesheet" href="/dizajn/responzivnost.css">' +
    "</head>" +
    "<body>" +
    '<header class="zaglavlje"><div class="kontejner">' +
    '<a href="/index" class="logo">Pikado<span>Portal</span></a>' +
    '<nav class="navigacija" aria-label="Glavna navigacija"><ul>' +
    '<li><a href="/index">Početna</a></li>' +
    '<li><a href="/igraci">Igrači</a></li>' +
    '<li><a href="/turniri">Turniri</a></li>' +
    '<li><a href="/pravila">Pravila</a></li>' +
    '<li><a href="/oprema">Oprema</a></li>' +
    '<li><a href="/galerija">Galerija</a></li>' +
    '<li><a href="/obrValidacija">Obrazac</a></li>' +
    '<li><a href="/pregled" class="aktivna">Pregled</a></li>' +
    '<li><a href="/api/zapisi">API</a></li>' +
    '<li><a href="/dokumentacija">Dokumentacija</a></li>' +
    "</ul></nav>" +
    "</div></header><main>"
  );
}

function generirajPodnozje() {
  return (
    "</main>" +
    '<footer class="podnozje"><div class="kontejner">' +
    "<p>&copy; 2026 PikadoPortal &mdash; Matej Starčević (mstarcevi21)</p>" +
    "</div></footer>" +
    "</body></html>"
  );
}

server.get("/pregled", function (zahtjev, odgovor) {
  let pojam = zahtjev.query.pojam;
  let kategorija = zahtjev.query.kategorija;
  let zapisi = bazaZapisa.dohvatiSve({ pojam: pojam, kategorija: kategorija });

  let html = generirajZaglavlje("Pregled zapisa");
  html += '<section class="odjeljak"><div class="kontejner">';
  html += "<h2>Pregled zapisa</h2>";

  let vrijednostPojma = pojam ? pojam : "";
  html += '<form class="obrazac" method="GET" action="/pregled">';
  html += '<div class="obrazac-grupa">';
  html += '<label for="pojam">Pojam pretrage:</label>';
  html += '<input type="text" id="pojam" name="pojam" value="' + vrijednostPojma + '" placeholder="npr. strelice">';
  html += "</div>";
  html += '<div class="obrazac-grupa">';
  html += '<label for="kategorija">Kategorija:</label>';
  html += '<select id="kategorija" name="kategorija">';
  let kategorije = ["", "turnir", "igrac", "oprema", "pravila"];
  let nazivi = ["-- Sve kategorije --", "Turnir", "Igrač", "Oprema", "Pravila"];
  for (let i = 0; i < kategorije.length; i++) {
    let odabrano = kategorija === kategorije[i] ? " selected" : "";
    html += '<option value="' + kategorije[i] + '"' + odabrano + ">" + nazivi[i] + "</option>";
  }
  html += "</select>";
  html += "</div>";
  html += '<button type="submit" class="obrazac-gumb">Primjeni</button>';
  html += "</form>";

  html += '<div class="omot-tablice"><table>';
  html += "<caption>Popis zapisa</caption><thead><tr>" +
    "<th>ID</th><th>Naziv</th><th>Kategorija</th><th>Detalji</th><th>Akcija</th>" +
    "</tr></thead><tbody>";

  if (zapisi.length === 0) {
    html += '<tr><td colspan="5">Nema zapisa za zadane kriterije.</td></tr>';
  } else {
    for (let zapis of zapisi) {
      html += "<tr>";
      html += "<td>" + zapis.id + "</td>";
      html += "<td>" + zapis.naziv + "</td>";
      html += "<td>" + zapis.kategorija + "</td>";
      html += '<td><a href="/pregled/' + zapis.id + '">Prikaži</a></td>';
      html += '<td><form method="POST" action="/pregled/obrisi/' + zapis.id + '">' +
        '<button type="submit" class="obrazac-gumb">Obriši</button>' +
        "</form></td>";
      html += "</tr>";
    }
  }

  html += "</tbody></table></div>";
  html += "</div></section>";
  html += generirajPodnozje();
  odgovor.send(html);
});

server.post("/pregled/obrisi/:id", function (zahtjev, odgovor) {
  let id = zahtjev.params.id;
  bazaZapisa.ukloniPoIdentifikatoru(id);
  odgovor.redirect("/pregled");
});

server.get("/pregled/:id", function (zahtjev, odgovor) {
  let id = zahtjev.params.id;
  let zapis = bazaZapisa.dohvatiPoIdentifikatoru(id);

  let html = generirajZaglavlje("Detalji zapisa");
  html += '<section class="odjeljak"><div class="kontejner">';

  if (zapis === null) {
    html += "<h2>Detalji zapisa</h2>";
    html += "<p>Traženi zapis nije pronađen!</p>";
  } else {
    html += "<h2>" + zapis.naziv + "</h2>";
    html += "<dl>";
    html += "<dt>ID</dt><dd>" + zapis.id + "</dd>";
    html += "<dt>Naziv</dt><dd>" + zapis.naziv + "</dd>";
    html += "<dt>Opis</dt><dd>" + zapis.opis + "</dd>";
    html += "<dt>Kategorija</dt><dd>" + zapis.kategorija + "</dd>";
    html += "<dt>Datum unosa</dt><dd>" + zapis.datumUnosa + "</dd>";
    html += "</dl>";
  }

  html += '<p><a href="/pregled">&larr; Povratak na pregled</a></p>';
  html += "</div></section>";
  html += generirajPodnozje();
  odgovor.send(html);
});

server.get("/api/zapisi", function (zahtjev, odgovor) {
  let pojam = zahtjev.query.pojam;
  let kategorija = zahtjev.query.kategorija;
  let zapisi = bazaZapisa.dohvatiSve({ pojam: pojam, kategorija: kategorija });
  odgovor.status(200).json(zapisi);
});

server.post("/api/zapisi", function (zahtjev, odgovor) {
  let tijelo = zahtjev.body;
  let ispravno =
    tijelo &&
    typeof tijelo.naziv === "string" && tijelo.naziv.trim() !== "" &&
    typeof tijelo.opis === "string" && tijelo.opis.trim() !== "" &&
    typeof tijelo.kategorija === "string" && tijelo.kategorija.trim() !== "" &&
    typeof tijelo.datumUnosa === "string" && tijelo.datumUnosa.trim() !== "";

  if (!ispravno) {
    odgovor.status(400).json({ greska: "Neispravni ili nepotpuni podaci za zapis." });
    return;
  }

  let dodani = bazaZapisa.dodajNovi({
    naziv: tijelo.naziv,
    opis: tijelo.opis,
    kategorija: tijelo.kategorija,
    datumUnosa: tijelo.datumUnosa
  });
  odgovor.status(201).json(dodani);
});

server.put("/api/zapisi", function (zahtjev, odgovor) {
  odgovor.status(405).json({ greska: "Metoda nije dopuštena za kolekciju zapisa." });
});

server.delete("/api/zapisi", function (zahtjev, odgovor) {
  odgovor.status(405).json({ greska: "Metoda nije dopuštena za kolekciju zapisa." });
});

server.get("/api/zapisi/:id", function (zahtjev, odgovor) {
  let zapis = bazaZapisa.dohvatiPoIdentifikatoru(zahtjev.params.id);
  if (zapis === null) {
    odgovor.status(404).json({ greska: "Zapis s traženim identifikatorom nije pronađen." });
    return;
  }
  odgovor.status(200).json(zapis);
});

server.post("/api/zapisi/:id", function (zahtjev, odgovor) {
  odgovor.status(405).json({ greska: "Metoda nije dopuštena za pojedinačni zapis." });
});

server.put("/api/zapisi/:id", function (zahtjev, odgovor) {
  let tijelo = zahtjev.body;
  let ispravno =
    tijelo &&
    typeof tijelo.naziv === "string" && tijelo.naziv.trim() !== "" &&
    typeof tijelo.opis === "string" && tijelo.opis.trim() !== "" &&
    typeof tijelo.kategorija === "string" && tijelo.kategorija.trim() !== "" &&
    typeof tijelo.datumUnosa === "string" && tijelo.datumUnosa.trim() !== "";

  if (!ispravno) {
    odgovor.status(400).json({ greska: "Neispravni podaci za ažuriranje." });
    return;
  }

  let azurirani = bazaZapisa.azurirajPostojeci(zahtjev.params.id, {
    naziv: tijelo.naziv,
    opis: tijelo.opis,
    kategorija: tijelo.kategorija,
    datumUnosa: tijelo.datumUnosa
  });

  if (azurirani === null) {
    odgovor.status(404).json({ greska: "Zapis s traženim id-im nije pronađen za ažuriranje." });
    return;
  }
  odgovor.status(200).json(azurirani);
});

server.delete("/api/zapisi/:id", function (zahtjev, odgovor) {
  let obrisan = bazaZapisa.ukloniPoIdentifikatoru(zahtjev.params.id);
  if (!obrisan) {
    odgovor.status(404).json({ greska: "Zapis s traženim identifikatorom nije pronađen za brisanje." });
    return;
  }
  odgovor.status(200).json({ poruka: "Zapis je uspješno obrisan." });
});

server.use(function (zahtjev, odgovor) {
  let html = generirajZaglavlje("Greška 404");
  html += '<section class="odjeljak"><div class="kontejner">';
  html += "<h2>Stranica ne postoji!</h2>";
  html += '<p><a href="/index">&larr; Natrag na početnu stranicu</a></p>';
  html += "</div></section>";
  html += generirajPodnozje();
  odgovor.status(404).send(html);
});

server.listen(port, function () {
  console.log("Server pokrenut na portu: " + port);
});