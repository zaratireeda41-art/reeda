/*
  ============================================================
  FOTOVOLTAICO ED EOLICO — foto reali degli impianti di Reeda
  ============================================================
  Come aggiungere una foto:
  1. Copia la foto nella cartella  foto/impianti/
     (es. foto/impianti/fv-tetto-2021.jpg — meglio JPG, lato lungo ~1600 px)
  2. Aggiungi un oggetto nell'elenco qui sotto:
       foto:       percorso del file (obbligatorio: senza foto la scheda non compare)
       tipo:       "fotovoltaico" oppure "eolico"
       titolo:     nome breve dell'impianto
       luogo:      città / zona (facoltativo)
       anno:       anno di realizzazione (facoltativo)
       didascalia: una o due frasi su cosa hai fatto
  3. Per aggiungere altri impianti copia un blocco { ... }, incollalo
     sotto e separalo con una virgola.

  Se l'elenco è vuoto, o un impianto non ha il campo foto compilato,
  non viene mostrata nessuna scheda in galleria.

  Esempio:
  { foto: "foto/impianti/fv-2021.jpg", tipo: "fotovoltaico", titolo: "Impianto su capannone", luogo: "Napoli", anno: "2021", didascalia: "Montaggio strutture e moduli." }
  ============================================================
*/
window.IMPIANTI = [];
