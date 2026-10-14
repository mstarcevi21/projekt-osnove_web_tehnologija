document.addEventListener("DOMContentLoaded", function () {
  inicijalizirajIzbornik();
  inicijalizirajTablicuIgraca();
});

function inicijalizirajIzbornik() {
  var navigacija = document.querySelector(".navigacija");
  if (!navigacija) {
    return;
  }

  var zaglavljeKontejner = document.querySelector(".zaglavlje .kontejner");
  var gumbIzbornik = document.createElement("button");
  gumbIzbornik.textContent = "☰ Izbornik";
  gumbIzbornik.className = "gumb-izbornik";
  gumbIzbornik.setAttribute("type", "button");
  gumbIzbornik.setAttribute("aria-label", "Prikaži ili sakrij izbornik");

  zaglavljeKontejner.insertBefore(gumbIzbornik, navigacija);

  gumbIzbornik.addEventListener("click", function () {
    navigacija.classList.toggle("navigacija--otvorena");
  });

  var putanja = window.location.pathname;
  var dijeloviPutanje = putanja.split("/");
  var trenutnaStranica = dijeloviPutanje[dijeloviPutanje.length - 1];

  if (trenutnaStranica === "") {
    trenutnaStranica = "index";
  }

  trenutnaStranica = trenutnaStranica.replace(".html", "");

  var poveznice = navigacija.querySelectorAll("a");
  for (var i = 0; i < poveznice.length; i++) {
    var veza = poveznice[i];
    var hrefDijelovi = veza.getAttribute("href").split("/");
    var ciljana = hrefDijelovi[hrefDijelovi.length - 1].replace(".html", "");
    if (ciljana === trenutnaStranica) {
      veza.classList.add("aktivna");
    } else {
      veza.classList.remove("aktivna");
    }
  }
}

function inicijalizirajTablicuIgraca() {
  var tablica = document.querySelector("table");
  if (!tablica) {
    return;
  }

  var tijelo = tablica.querySelector("tbody");
  if (!tijelo) {
    return;
  }

  var omot = tablica.closest(".omot-tablice");
  if (omot) {
    var poljePretrage = document.createElement("input");
    poljePretrage.setAttribute("type", "search");
    poljePretrage.setAttribute("placeholder", "Pretraži...");
    poljePretrage.className = "pretraga-tablice";
    omot.parentNode.insertBefore(poljePretrage, omot);

    poljePretrage.addEventListener("input", function () {
      var pojam = poljePretrage.value.toLowerCase();
      var redovi = tijelo.querySelectorAll("tr");
      for (var i = 0; i < redovi.length; i++) {
        var red = redovi[i];
        var celije = red.querySelectorAll("td");
        if (celije.length === 0) {
          continue;
        }
        var ime = celije[1].textContent.toLowerCase();
        if (ime.indexOf(pojam) !== -1) {
          red.style.display = "";
        } else {
          red.style.display = "none";
        }
      }
    });
  }

  var zaglavlja = tablica.querySelectorAll("thead th");
  for (var j = 0; j < zaglavlja.length; j++) {
    (function (indeksStupca, celijaZaglavlja) {
      celijaZaglavlja.style.cursor = "pointer";
      celijaZaglavlja.setAttribute("title", "Klikni za sortiranje");
      var uzlazno = true;
      celijaZaglavlja.addEventListener("click", function () {
        sortirajTablicu(tijelo, indeksStupca, uzlazno);
        uzlazno = !uzlazno;
      });
    })(j, zaglavlja[j]);
  }
}

function sortirajTablicu(tijelo, indeksStupca, uzlazno) {
  var redoviCvor = tijelo.querySelectorAll("tr");
  var redovi = [];
  for (var i = 0; i < redoviCvor.length; i++) {
    if (redoviCvor[i].querySelectorAll("td").length > 0) {
      redovi.push(redoviCvor[i]);
    }
  }

  for (var a = 0; a < redovi.length - 1; a++) {
    for (var b = 0; b < redovi.length - 1 - a; b++) {
      var prviTekst = dohvatiVrijednostCelije(redovi[b], indeksStupca);
      var drugiTekst = dohvatiVrijednostCelije(redovi[b + 1], indeksStupca);

      var trebaZamjena = false;
      if (jeBroj(prviTekst) && jeBroj(drugiTekst)) {
        var prviBroj = pretvoriUBroj(prviTekst);
        var drugiBroj = pretvoriUBroj(drugiTekst);
        if (uzlazno) {
          trebaZamjena = prviBroj > drugiBroj;
        } else {
          trebaZamjena = prviBroj < drugiBroj;
        }
      } else {
        if (uzlazno) {
          trebaZamjena = prviTekst.localeCompare(drugiTekst) > 0;
        } else {
          trebaZamjena = prviTekst.localeCompare(drugiTekst) < 0;
        }
      }

      if (trebaZamjena) {
        var privremeni = redovi[b];
        redovi[b] = redovi[b + 1];
        redovi[b + 1] = privremeni;
      }
    }
  }

  for (var k = 0; k < redovi.length; k++) {
    tijelo.appendChild(redovi[k]);
  }
}

function dohvatiVrijednostCelije(red, indeksStupca) {
  var celije = red.querySelectorAll("td");
  if (indeksStupca >= celije.length) {
    return "";
  }
  return celije[indeksStupca].textContent.trim();
}

function jeBroj(tekst) {
  var ocisceno = tekst.replace(/\s/g, "").replace(".", "");
  if (ocisceno === "") {
    return false;
  }
  return !isNaN(Number(ocisceno));
}

function pretvoriUBroj(tekst) {
  var ocisceno = tekst.replace(/\s/g, "").replace(".", "");
  return Number(ocisceno);
}