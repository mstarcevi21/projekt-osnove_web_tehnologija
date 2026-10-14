document.addEventListener("DOMContentLoaded", function () {
  var obrazac = document.querySelector("form.obrazac");
  if (!obrazac) {
    return;
  }

  obrazac.setAttribute("novalidate", "novalidate");

  obrazac.addEventListener("submit", function (dogadaj) {
    var ispravno = provjeriObrazac(obrazac);
    if (!ispravno) {
      dogadaj.preventDefault();
    }
  });
});

function provjeriObrazac(obrazac) {
  ocistiSveGreske(obrazac);
  var sveOk = true;

  var poljeIme = obrazac.querySelector("[name='ime']");
  var poljeEmail = obrazac.querySelector("[name='email']");
  var poljeTelefon = obrazac.querySelector("[name='telefon']");
  var poljeVrsta = obrazac.querySelector("[name='vrsta-upita']");
  var poljePoruka = obrazac.querySelector("[name='poruka']");
  var poljeDatum = obrazac.querySelector("[name='datum']");
  var poljeDob = obrazac.querySelector("[name='dob']");

  var ime = poljeIme.value.trim();
  if (ime === "") {
    prikaziGresku(poljeIme, "Ime i prezime je obavezno polje.");
    sveOk = false;
  } else {
    var rijeci = ime.split(/\s+/);
    var samoSlova = /^[A-Za-zČčĆćĐđŠšŽž\s-]+$/;
    if (rijeci.length < 2) {
      prikaziGresku(poljeIme, "Upišite i ime i prezime (najmanje dvije riječi).");
      sveOk = false;
    } else if (!samoSlova.test(ime)) {
      prikaziGresku(poljeIme, "Ime smije sadržavati samo slova.");
      sveOk = false;
    }
  }

  var email = poljeEmail.value.trim();
  var oblikEmaila = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === "") {
    prikaziGresku(poljeEmail, "E-mail adresa je obavezna.");
    sveOk = false;
  } else if (!oblikEmaila.test(email)) {
    prikaziGresku(poljeEmail, "Unesite ispravnu e-mail adresu (npr. ime@domena.hr).");
    sveOk = false;
  }

  var vrsta = poljeVrsta.value;
  if (vrsta === "") {
    prikaziGresku(poljeVrsta, "Odaberite vrstu upita.");
    sveOk = false;
  }

  var poruka = poljePoruka.value.trim();
  if (poruka === "") {
    prikaziGresku(poljePoruka, "Poruka je obavezna.");
    sveOk = false;
  } else if (poruka.length < 10) {
    prikaziGresku(poljePoruka, "Poruka mora imati najmanje 10 znakova.");
    sveOk = false;
  }

  var telefon = poljeTelefon.value.trim();
  if (telefon !== "") {
    var oblikTelefona = /^\+?[0-9\s-]{6,20}$/;
    if (!oblikTelefona.test(telefon)) {
      prikaziGresku(
        poljeTelefon,
        "Telefon smije sadržavati samo brojeve, razmake i crtice (6-20 znamenki)."
      );
      sveOk = false;
    }
  }

  var datum = poljeDatum.value;
  var dobTekst = poljeDob.value;
  if (datum !== "" && dobTekst !== "") {
    var datumPocetka = new Date(datum);
    var danas = new Date();

    if (datumPocetka > danas) {
      prikaziGresku(poljeDatum, "Datum početka igranja ne može biti u budućnosti.");
      sveOk = false;
    } else {
      var razlikaGodina = danas.getFullYear() - datumPocetka.getFullYear();
      var brojGodina = Number(dobTekst);
      if (Math.abs(razlikaGodina - brojGodina) > 1) {
        prikaziGresku(
          poljeDob,
          "Broj godina igranja ne odgovara upisanom datumu početka."
        );
        sveOk = false;
      }
    }
  }

  if (vrsta === "greska") {
    if (poruka.length < 20) {
      prikaziGresku(
        poljePoruka,
        "Kod prijave greške opišite problem s najmanje 20 znakova."
      );
      sveOk = false;
    }
  }

  if (!sveOk) {
    var prvaGreska = obrazac.querySelector(
      ".obrazac-grupa--greska input, .obrazac-grupa--greska select, .obrazac-grupa--greska textarea"
    );
    if (prvaGreska) {
      prvaGreska.focus();
    }
  }

  return sveOk;
}

function prikaziGresku(polje, poruka) {
  var grupa = polje.closest(".obrazac-grupa");
  if (!grupa) {
    grupa = polje.parentNode;
  }
  grupa.classList.add("obrazac-grupa--greska");

  var span = document.createElement("span");
  span.className = "greska";
  span.setAttribute("role", "alert");
  span.textContent = poruka;
  grupa.appendChild(span);
}

function ocistiSveGreske(obrazac) {
  var poruke = obrazac.querySelectorAll(".greska");
  for (var i = 0; i < poruke.length; i++) {
    poruke[i].parentNode.removeChild(poruke[i]);
  }
  var istaknute = obrazac.querySelectorAll(".obrazac-grupa--greska");
  for (var j = 0; j < istaknute.length; j++) {
    istaknute[j].classList.remove("obrazac-grupa--greska");
  }
}