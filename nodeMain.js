//############## Krizec krozec server ####################//
var express = require('express');
var app = express();//poklice fun. express
var server = require('http').Server(app);//nalozi http in namesto fun. pisemo Server(app)---> function(req, res)
var io = require('socket.io')(server);//nalozi socket.io
var port = 1234
var sobe = 0;// definiramo sobe, v katere se bosta lahko 2 igralca povezala

app.use(express.static('.'));

//se responda na get request in poslje file na igra.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/igra.html');
});

server.listen(port);//poslusa na portu

io.on('connection', (socket) => {//connect avtomatsko zazna ce se je odjemalec povezal, (socket je namesto function(socket))
	console.log('Uporabnik se je povezal!');

    socket.on('disconnect', function() {
        socket.broadcast.emit('zapustil', {});
        console.log("Igralec je zapustil");
    });

    socket.on('ustvari_igro', (data) => {
        socket.join('soba#' + ++sobe);
        socket.emit('nova_igra', {name: data.ime, room: 'soba#'+sobe});
        console.log(data);
    });

    socket.on('ustvari_igro_single', (data) => {
        socket.emit('nova_igra_single', {name: data.ime});
    });

    socket.on('pridruzil', (data) => {
        var soba = io.nsps['/'].adapter.rooms[data.soba];
        if (soba && soba.length === 1) {
            console.log(soba);
            socket.join(data.soba);
            socket.broadcast.to(data.soba).emit('igralec1', {});
            socket.emit('igralec2', { name: data.ime, room: data.soba })
        } else {
            socket.emit('napaka', { sporocilo: "Soba je polna!" });
        }
    });

    socket.on('odigrajPotezo', (data) => {
        console.log("klinememna" + data.kliknjenaVrednost);
        socket.broadcast.to(data.soba).emit('odigranaPoteza', {
            kliknjenaVrednost: data.kliknjenaVrednost,
            soba: data.soba
        });
    });

    socket.on('igreJeKonec', (data) => {
        socket.broadcast.to(data.room).emit('konec', data);
    });
});