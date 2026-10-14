const datotecniSustav = require("fs");

const SEPARATOR = "#";

class Zapisi {
  constructor(putanjaDatoteke) {
    this.putanjaDatoteke = putanjaDatoteke;
  }

  ucitajSve() {
    let sadrzaj = datotecniSustav.readFileSync(this.putanjaDatoteke, "utf-8");
    let linije = sadrzaj.split("\n");
    let zapisi = [];

    for (let linija of linije) {
      let ocisceno = linija.trim();
      if (ocisceno === "") {
        continue;
      }
      let dijelovi = ocisceno.split(SEPARATOR);
      let zapis = {
        id: Number(dijelovi[0]),
        naziv: dijelovi[1],
        opis: dijelovi[2],
        kategorija: dijelovi[3],
        datumUnosa: dijelovi[4]
      };
      zapisi.push(zapis);
    }
    return zapisi;
  }

  spremiSve(zapisi) {
    let redovi = [];
    for (let zapis of zapisi) {
      let redak =
        zapis.id +
        SEPARATOR +
        zapis.naziv +
        SEPARATOR +
        zapis.opis +
        SEPARATOR +
        zapis.kategorija +
        SEPARATOR +
        zapis.datumUnosa;
      redovi.push(redak);
    }
    datotecniSustav.writeFileSync(
      this.putanjaDatoteke,
      redovi.join("\n") + "\n",
      "utf-8"
    );
  }

  dohvatiSve(kriteriji) {
    let sviZapisi = this.ucitajSve();

    if (!kriteriji) {
      return sviZapisi;
    }

    let pojam = kriteriji.pojam;
    let kategorija = kriteriji.kategorija;
    let rezultat = [];

    for (let zapis of sviZapisi) {
      let zadovoljavaPojam = true;
      let zadovoljavaKategoriju = true;

      if (pojam !== undefined && pojam !== null && pojam.trim() !== "") {
        let pojamMali = pojam.toLowerCase();
        let nazivMali = zapis.naziv.toLowerCase();
        let opisMali = zapis.opis.toLowerCase();
        zadovoljavaPojam =
          nazivMali.indexOf(pojamMali) !== -1 ||
          opisMali.indexOf(pojamMali) !== -1;
      }

      if (
        kategorija !== undefined &&
        kategorija !== null &&
        kategorija.trim() !== ""
      ) {
        zadovoljavaKategoriju = zapis.kategorija === kategorija;
      }

      if (zadovoljavaPojam && zadovoljavaKategoriju) {
        rezultat.push(zapis);
      }
    }
    return rezultat;
  }

  dohvatiPoIdentifikatoru(id) {
    let trazeniId = Number(id);
    let sviZapisi = this.ucitajSve();
    for (let zapis of sviZapisi) {
      if (zapis.id === trazeniId) {
        return zapis;
      }
    }
    return null;
  }

  dodajNovi(noviZapis) {
    let sviZapisi = this.ucitajSve();

    let najveciId = 0;
    for (let zapis of sviZapisi) {
      if (zapis.id > najveciId) {
        najveciId = zapis.id;
      }
    }

    let zapisZaSpremanje = {
      id: najveciId + 1,
      naziv: noviZapis.naziv,
      opis: noviZapis.opis,
      kategorija: noviZapis.kategorija,
      datumUnosa: noviZapis.datumUnosa
    };

    sviZapisi.push(zapisZaSpremanje);
    this.spremiSve(sviZapisi);
    return zapisZaSpremanje;
  }

  azurirajPostojeci(id, noviPodaci) {
    let trazeniId = Number(id);
    let sviZapisi = this.ucitajSve();
    let azurirani = null;

    for (let zapis of sviZapisi) {
      if (zapis.id === trazeniId) {
        zapis.naziv = noviPodaci.naziv;
        zapis.opis = noviPodaci.opis;
        zapis.kategorija = noviPodaci.kategorija;
        zapis.datumUnosa = noviPodaci.datumUnosa;
        azurirani = zapis;
      }
    }

    if (azurirani !== null) {
      this.spremiSve(sviZapisi);
    }
    return azurirani;
  }

  ukloniPoIdentifikatoru(id) {
    let trazeniId = Number(id);
    let sviZapisi = this.ucitajSve();
    let preostali = [];
    let pronaden = false;

    for (let zapis of sviZapisi) {
      if (zapis.id === trazeniId) {
        pronaden = true;
      } else {
        preostali.push(zapis);
      }
    }

    if (pronaden) {
      this.spremiSve(preostali);
    }
    return pronaden;
  }
}

module.exports = Zapisi;