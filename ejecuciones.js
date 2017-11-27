// Import needed modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const uuid = require('node-uuid');
const appData = require('./data.json');
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient
// Create default port
const PORT = 3005;
// Create a new server
const server = express();
// Configure server
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(session({
  secret: process.env.SESSION_SECRET || 'awesomecookiesecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: process.env.MONGO_URL || 'mongodb://localhost/alertas',
  }),
}));
server.use(flash());
server.use(express.static('public'));
server.use('/images',express.static('images'));
server.use(passport.initialize());
server.use(passport.session());
server.set('views', './views');
server.set('view engine', 'pug');
// Create API routes
const apiRoutes = express.Router();
server.use('/api', apiRoutes);
// Start the server
var db
MongoClient.connect('mongodb://localhost:27017/alertas?authSource=admin', (err, database) => {
    if (err) return console.log(err)
    db = database
    server.listen(PORT, () => {
      console.log(`The API is listening on port ${PORT}`);
    });
})
//inicio:enrolarCliente
apiRoutes.post("/enrolarCliente",
(req, res) => {
console.log("Ingresando a servicio enrolarCliente");
    console.log(req.body);
    db.collection('saypd_enroll').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.send({salida:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.send({salida:"NOK", descripcion:"Enrolado ya existe."});
         db.collection('saypd_enroll').save(req.body,
         function (err, result) {
           if (err)
             return res.send({salida:"NOK", descripcion:"Error al ingresar el registro"});
           return res.send({salida:"OK", descripcion:"Registro guardado correctamente"});
         })
    })
  }
);
//fin:enrolarCliente
//inicio:validarEnrolado
apiRoutes.post("/validarEnrolado",
(req, res) => {
console.log("Ingresando a servicio validarEnrolado");
    console.log(req.body);
    db.collection('saypd_enroll').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.send({salida:"NOK", descripcion:"Error al obtener el registro"});
        console.log("results:",results);
        if (results>0)
           return res.send({salida:"SI"});
    })
  }
);
//fin:validarEnrolado
//inicio:guardarCliente
apiRoutes.post("/guardarCliente",
(req, res) => {
console.log("Ingresando a servicio guardarCliente");
    console.log(req.body);
    req.body.perfil= 'CLIENTE';
    if(req.body.email == null){
      req.body.email = req.body.name+"@saypd.cl";
    }
    console.log("before:",req.body);
    db.collection('usuarios').find({email:req.body.email}).count(
      function(err, results) {
        if (err)
          return res.send({salida:'NOK',descripcion:"Error al ingresar el registro"});
        if (results>0)
           res.send({ salida : "NOK", descripcion:"Existe Cliente"});
         req.body.estado = "I";
         db.collection('usuarios').save(req.body,
         function (err, result) {
           if (err)
             return res.send({salida:"NOK", descripcion:"Error al actualizar el registro"});
           res.send({ salida : 'OK'});
         })
    })
  }
);
//fin:guardarCliente
//inicio:validarProyecto
apiRoutes.post("/validarProyecto",
(req, res) => {
console.log("Ingresando a servicio validarProyecto");
    console.log(req.body);
    var salida = 'No Valido';
    db.collection('saypd_project').findOne({id : req.body.projectId}).then(
      function(resp){
        console.log(resp);
        if(resp.estado == 'A'){
            salida = 'Activo';
        }
        res.send({ salida : salida});
      });
  });
//fin:validarProyecto


//inicio:generarAccionAbrir
apiRoutes.post("/generarAccionAbrir",
(req, res) => {
console.log("Ingresando a servicio generarAccionAbrir");
console.log(req.body);
   if(req.body.codigo == '001'){
       console.log("entro a la validacion");
       req.body.codigo = "ABRIR LA PUERTA";
   }

    db.collection('saypd_work').save(req.body, (err, result) => {
        if (err) return res.send({salida:"NOK", descripcion:"Error al guardar el registro"});
    })
    console.log(req.body.idAlerta);
    db.collection('saypd_alerts').updateMany({idAlerta:req.body.idAlerta,estado:'E'},{$set : {'estado': 'A'}},
      function (err, result) {
        if (err)
          return res.send({salida:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.send({salida:"OK", descripcion:"Registro guardado correctamente"});
  }
);
//fin:generarAccionAbrir
