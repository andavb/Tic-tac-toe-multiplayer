
var igralec;
var igra;
const X = 'X';
const O = 'O';

const socket = io.connect('http://localhost:1234');


/*########################CLASS IGRALEC#############################*/
class Igralec{
  constructor(ime, tipIgralca){
    this.ime = ime;
    this.tipIgralca = tipIgralca;
    this.naVrsti = true;
    this.tocke = 0;
  }
//vrnemo zmago
  static get zmaga(){
    return [7, 56, 448, 73, 146, 292, 273, 84];
  }

//posodobimo tocke igralca
  posodobiTocke(vrednost){
    this.tocke += vrednost;
  }

//vrni tocke igralca
  getTocke(){
    return this.tocke;
  }

  //kdo je na vrsti
  setNaVrsti(poteza){
    this.naVrsti = poteza;
    if(poteza == true){
      $("#kdoJe").text("Vi ste na vrsti").css('color', 'green');
    }
    else{
      $("#kdoJe").text("Počakajte na nasportnika").css('color', 'red');
    }
  }

  getIme(){
    return this.ime;
  }

  getTipIgralca(){
    return this.tipIgralca;
  }

  getNaVrsti(){
    return this.naVrsti;
  }
}
/*############################################################*/

/*########################CLASS IGRA#############################*/
class Igra{
  constructor(soba){
    this.soba = soba;
    this.matrika = [];
    this.poteze = 0;
  }

  ustvariIgro(){

    function klikNaPozicijo(){
      const vrstica = parseInt(this.id.split('_')[1][0], 10);
      const stolpec = parseInt(this.id.split('_')[1][1], 10);

      console.log(vrstica);
      console.log(stolpec);
      console.log(igralec.getNaVrsti());

      if (!igralec.getNaVrsti() || !igra) {
         alert('Nisi na potezi!');
        return;
      }

      if ($(this).prop('disabled')) {
        alert("To polje je ze zasedeno!");
        return;
      }

      igra.posljiPotezo(this);
      igra.posodobiMatirko(igralec.getTipIgralca(), vrstica, stolpec, this.id);

      igralec.setNaVrsti(false);
      igralec.posodobiTocke(1 << ((vrstica * 3) + stolpec));

      igra.preveriAliJeZmagal();
    }

    for (var i = 0; i < 3; i++) {
      this.matrika.push(['', '', '']);
      for (var j = 0; j < 3; j++) {
        $('#gumb_' + i + j).on('click', klikNaPozicijo);
      }
    }
  }

  /*ustvariIgroSingle(){

    function klikNaPozicijo(){
      const vrstica = parseInt(this.id.split('_')[1][0], 10);
      const stolpec = parseInt(this.id.split('_')[1][1], 10);

      console.log(vrstica);
      console.log(stolpec);
      console.log(igralec.getNaVrsti());

      if (!igralec.getNaVrsti() || !igra) {
         alert('Nisi na potezi!');
        return;
      }

      if ($(this).prop('disabled')) {
        alert("To polje je ze zasedeno!");
        return;
      }

      igra.posljiPotezo(this);
      igra.posodobiMatirko(igralec.getTipIgralca(), vrstica, stolpec, this.id);

      igralec.setNaVrsti(false);
      igralec.posodobiTocke(1 << ((vrstica * 3) + stolpec));

      igra.preveriAliJeZmagal();
    }

    if(igralec.getNaVrsti() == true){
      for (var i = 0; i < 3; i++) {
        this.matrika.push(['', '', '']);
        for (var j = 0; j < 3; j++) {
          $('#gumb_' + i + j).on('click', klikNaPozicijo);
        }
      }
    }
    else{
      while(1){
        var vrstica = Math.floor(Math.random() * 2);
        var stolpec = Math.floor(Math.random() * 2);
        var gum = '#gumb_' + vrstica + stolpec;
        console.log(gum);
        if(!($(gum).disabled)){
          return;
        }
      }
      document.getElementById(gum).click();
    }
  }*/

  prikaziIgro(sporocila) {
    $(".jumbotron").hide();
    $(".info").css('display', 'block');
    $(".igra").css('display', 'block');
    $('#kajIgra').html(sporocila);
    this.ustvariIgro();
  }

  prikaziIgroSingle(spo){
    $(".jumbotron").hide();
    $(".info").css('display', 'block');
    $(".igra").css('display', 'block');
    $('#kajIgra').html(sporocila);
    this.ustvariIgroSingle();

  }

  posodobiMatirko(tipIgralca, vrstica, stolpec, vrednost){
    console.log(vrednost);
    $('#'+vrednost).text(tipIgralca).prop('disabled', true);
    this.matrika[vrstica][stolpec] = tipIgralca;
    this.poteze++;
  }

  pridobiIDSobe(){
   return this.soba;
  }

  posljiPotezo(vrednost){
    const izbrana = $(vrednost).attr('id');

    socket.emit('odigrajPotezo', {
      kliknjenaVrednost: izbrana,
      soba: this.pridobiIDSobe()
    });
  }

  pridobiStPotez() {
    return this.poteze >= 9;
  }

  preveriAliJeZmagal(){
     var pozicijaTrenutnegaIgralca = igralec.getTocke();

     Igralec.zmaga.forEach((i) => {
      if ((i & pozicijaTrenutnegaIgralca) === i) {
         igra.igralecZmagal();
       }
     });

    if (this.pridobiStPotez()) {
      var spo = 'Igra je zakljucena brez zmagovalca...';
      socket.emit('igreJeKonec', {
        room: this.pridobiIDSobe(),
        message: spo,
       });
      alert(spo);
    }
  }

  igralecZmagal(){
    var spo = igralec.getIme() + " je zmagal!";
    console.log(spo);
    socket.emit('igreJeKonec', {
      room: this.pridobiIDSobe(),
      message: spo,
    });
    $("#kdoJe").text("Konec igre").css('color', 'red');
    alert(spo);
    //location.reload();
  }

  konecIgre(spo){
    console.log(spo);
    $("#kdoJe").text("Konec igre").css('color', 'red');
    alert(spo);
    //location.reload();
  }

}

$( "#nova" ).click(function() {
  var ime = $('#novaIgra').val();
  if(!ime){
    alert("Niste vnesli imena!");
    return;
  }
  socket.emit('ustvari_igro', {ime: ime});
  igralec = new Igralec(ime, X);
});

$('#pridruzi').on('click', () => {
    var ime = $('#pridruziIme').val();
    var IDsobe = $('#soba').val();
    if (!ime || !IDsobe) {
      alert('Prosimo vnesite ime in pravilnen ID sobe.');
      return;
    }
    socket.emit('pridruzil', { ime, soba: IDsobe });
    igralec = new Igralec(ime, O);
  });

$( "#novaSingle" ).click(function() {
  var ime = $('#novaIgra').val();
  if(!ime){
    alert("Niste vnesli imena!");
    return;
  }
  socket.emit('ustvari_igro_single', {ime: ime});
  igralec = new Igralec(ime, X);
});


socket.on('nova_igra', (data) => {  
  var spo = data.name + " pocakajte na igralca, ID sobe: " + data.room;
  igra = new Igra(data.room); 
  igra.prikaziIgro(spo);
});

socket.on('nova_igra_single', (data) => {  
  var spo = data.name;
  igra = new Igra("single"); 
  igra.prikaziIgroSingle(spo);
});

socket.on('igralec1', (data) => {
  $('#kajIgra').html("Vaše ime: " + igralec.getIme() + ", ste v sobi: " + igra.pridobiIDSobe());
  igralec.setNaVrsti(true);
});

 socket.on('igralec2', (data) => {
  var spo = "Vaše ime: " + data.name + ", ste v sobi: " + data.room;
  igra = new Igra(data.room); 
  igra.prikaziIgro(spo);
  igralec.setNaVrsti(false);
});

socket.on('odigranaPoteza', (data) => {
  var vrstica = data.kliknjenaVrednost.split('_')[1][0];
  var stolpec = data.kliknjenaVrednost.split('_')[1][1];
  var tipigralca = igralec.getTipIgralca() === X ? O : X;

  console.log(vrstica);
  console.log(stolpec);
  console.log(tipigralca);
  console.log("tipigralca");

  igra.posodobiMatirko(tipigralca, vrstica, stolpec, data.kliknjenaVrednost);
  igralec.setNaVrsti(true);
});

socket.on('konec', (data) => {
  igra.konecIgre(data.message);
  //socket.leave(data.room);
});

socket.on('napaka', (data) => {
  alert(data.sporocilo);
  location.reload();
});

socket.on('zapustil', function(){
  alert("Soigralec je zapustil igro");
  //location.reload();
});



