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


// Create app data (mimics a DB)
const userData = appData.users;
const exclamationData = appData.exclamations;

function getUser(p_email) {
  const user = db.collection('usuarios').findOne({email : p_email});
  return user;
};

// Create default port
const PORT = process.env.PORT || 3000;

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

// Configure Passport
passport.use(new LocalStrategy(
  (email, password, done) => {
    const user = getUser(email);
    user.then(
      function(resp){
        if (!resp || resp.password !== password || resp.estado == 'I') {
          return done(null, false, { message: 'Username and password combination is wrong' });
        }
        delete user.password;
        return done(null, resp);
      }
    )
  }
));

// Serialize user in session
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const user = getUser(email);
  user.then(
    function(resp){
        delete user.password;
        done(null, resp);
    }
  );
});




// Create custom middleware functions
function hasScope(scope) {
  return (req, res, next) => {
    const { scopes } = req.user;

    if (!scopes.includes(scope)) {
      req.flash('error', 'The username and password are not valid.');
      return res.redirect('/');
    }

    return next();
  };
}

function canDelete(req, res, next) {
  const { scopes, username } = req.user;
  const { id } = req.params;
  const exclamation = exclamationData.find(exc => exc.id === id);

  if (!exclamation) {
    return res.sendStatus(404);
  }

  if (exclamation.user !== username && !scopes.includes('delete')) {
    return res.status(403).json({ message: "You can't delete that exclamation." });
  }

  return next();
}

function isAuthenticated(req, res, next) {
  if (!req.user) {
    req.flash('error', 'You must be logged in.');
    return res.redirect('/');
  }

  return next();
}

function sendMail (idAlerta, p_host,p_port,p_from,p_to,p_subject,p_html){
    console.log("p_host:"+p_host);
    console.log("p_port:"+p_port);
    console.log("p_from:"+p_from);
    console.log("p_to:"+p_to);
    console.log("p_subject:"+p_subject);
    console.log("p_html:"+p_html);
    var smtpTransport = nodemailer.createTransport({
          host: p_host,
          port: p_port,
          secure: false // true for 465, false for other ports
      });
    var mailOptions = {
        from: p_from, // sender address
        to: [p_to], // list of receivers
        subject: p_subject + '. Id '+idAlerta, // Subject line
        html: p_html + ' Id '+idAlerta  // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
  	  console.log(error);
  	}else{
  	  console.log("Email enviado con exito");
  	}
  });
}

function printPene (p_para){
    console.log("   !  ");
    console.log("(¨¨¨¨¨)");
    console.log(" |¨¨¨|");
}

function sendMailInterno (p_to,p_subject,p_html){
    var smtpTransport = nodemailer.createTransport({
      host: 'localhost',
          port: 25,
          secure: false // true for 465, false for other ports
      });
    var mailOptions = {
        from: 'SAYPD<noreply@alertas.cl>', // sender address
        to: [p_to], // list of receivers
        subject: p_subject, // Subject line
        html: p_html // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
  	  console.log(error);
  	}else{
  	  console.log("Email enviado con exito");
  	}
  });
}

// Create home route
server.get('/', (req, res) => {
  return res.render('inicio');
});

server.get('/dashboard',
  isAuthenticated,
  (req, res) => {
    console.log("entro a dashboard");
    res.render('dashboard');
  }
);



// Create auth routes
const authRoutes = express.Router();

authRoutes.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.status(201).json({ estado:'ok' });
});

server.use('/auth', authRoutes);



// Create API routes
const apiRoutes = express.Router();

//apiRoutes.use(isAuthenticated);
apiRoutes.post('/login', (req, res) => {
  console.log(req.body);
  res.status(201).json({ estado:'ok' });
});

apiRoutes.get('/logout',(req,res) => {
  console.log(req.session);
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.status(201).json({ estado:'ok' });
    }
  });
});

//Valido que la session este activa
apiRoutes.get('/usuario', (req, res) => {
  if(req.user)
    req.user.password = null;
  res.status(201).json({ user: req.user });
});






//CRUD Usuarios
//insert
apiRoutes.post('/setUser',
(req, res) => {
    console.log("Ingresando a servicio setUser");
    console.log(req.body);

    db.collection('usuarios').find({email:req.body.email}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Usuario ya existe."});

         db.collection('usuarios').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           const user = getUser(req.body.email);
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", usuario : user});
         })

    })
  }
);

//update
apiRoutes.post('/updateUser',
(req, res) => {
    console.log("Ingresando a servicio updateUser");
    console.log(req.body);
    db.collection('usuarios').find({email:req.body.email}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples usuarios"});

           if(req.body.password != ''){
             db.collection('usuarios').updateMany({email:req.body.email},{$set : {'name': req.body.name, 'lastname':req.body.lastname, 'cel':req.body.cel, 'password':req.body.password}},
             function (err, result) {
               if (err)
                 return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
               const user = getUser(req.body.email);
               return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", usuario : user});
             })
           }else{
             db.collection('usuarios').updateMany({email:req.body.email},{$set : {'name': req.body.name, 'lastname':req.body.lastname, 'cel':req.body.cel}},
               function (err, result) {
                 if (err)
                   return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
                 const user = getUser(req.body.email);
                 return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", usuario : user});
             })
           }
    })
  }
);

//updateState
apiRoutes.post('/userUpdateState',
  (req, res) => {
    console.log("Ingresando a servicio userUpdateState");
    console.log(req.body.email);
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('usuarios').updateMany({email:req.body.email,estado:req.body.state},{$set : {'estado': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeUser',
  (req, res) => {
    console.log("Ingresando a servicio removeUser");
    var stateNew = 'E'
    db.collection('usuarios').updateMany({email:req.body.email},{$set : {'estado': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);

//get
apiRoutes.get('/users',
  (req, res) => {
    db.collection('usuarios').find({perfil: 'SISTEMA', estado: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ users : results });
    })
  }
);

//get
apiRoutes.get('/clients',
  (req, res) => {
    db.collection('usuarios').find({perfil: 'CLIENTE', estado: { $in: [ "A", "I" ]}}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ users : results });
    })
  }
);

//CRUD TypeAlert
//insert
apiRoutes.post('/setTypeAlert',
(req, res) => {
    console.log("Ingresando a servicio setAlert");
    console.log(req.body);

    db.collection('saypd_type_alert').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Tipo ya existe."});

         db.collection('saypd_type_alert').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })

    })
  }
);

//update
apiRoutes.post('/updateTypeAlert',
(req, res) => {
    console.log("Ingresando a servicio updateTypeAlert");
    console.log(req.body);
    db.collection('saypd_type_alert').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples valores"});

       db.collection('saypd_type_alert').updateMany({name:req.body.name},{$set : {'name': req.body.name}},
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
       })

    })
  }
);

//updateState
apiRoutes.post('/stateTypeAlert',
  (req, res) => {
    console.log("Ingresando a servicio stateTypeAlert");
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('saypd_type_alert').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeTypeAlert',
  (req, res) => {
    console.log("Ingresando a servicio removeTypeAlert");
    var stateNew = 'E'
    db.collection('saypd_type_alert').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);


//getList
apiRoutes.get('/listTypeAlert',
  (req, res) => {
    db.collection('saypd_type_alert').find({state: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);

//CRUD TypeNotification
//insert
apiRoutes.post('/setTypeNotification',
(req, res) => {
    console.log("Ingresando a servicio setTypeNotification");
    console.log(req.body);

    db.collection('saypd_type_notification').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Tipo ya existe."});

         db.collection('saypd_type_notification').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })

    })
  }
);

//update
apiRoutes.post('/updateTypeNotification',
(req, res) => {
    console.log("Ingresando a servicio updateTypeNotification");
    console.log(req.body);
    db.collection('saypd_type_notification').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples valores"});

       db.collection('saypd_type_notification').updateMany({name:req.body.name},{$set : {'name': req.body.name}},
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
       })

    })
  }
);

//updateState
apiRoutes.post('/stateTypeNotification',
  (req, res) => {
    console.log("Ingresando a servicio stateTypeNotification");
    console.log(req.body.email);
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('saypd_type_notification').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeTypeNotification',
  (req, res) => {
    console.log("Ingresando a servicio removeTypeNotification");
    var stateNew = 'E'
    db.collection('saypd_type_notification').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);

//getList
apiRoutes.get('/listTypeNotification',
  (req, res) => {
    db.collection('saypd_type_notification').find({state: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);

//CRUD suscription
//insert
apiRoutes.post('/setSupcription',
(req, res) => {
    console.log("Ingresando a servicio setSupcription");
    console.log(req.body);
    db.collection('saypd_supcription').find({ email:req.body.email, notification:req.body.notification, alert:req.body.alert}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        console.log(results);
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Subcripción ya existe."});

         db.collection('saypd_supcription').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })
    })
  }
);

//updateState
apiRoutes.post('/stateSupcription',
  (req, res) => {
    console.log("Ingresando a servicio stateSupcription");
    var stateNew = req.body.estado == 'A' ? 'I' : 'A';
    db.collection('saypd_supcription').updateMany({email:req.body.email, notification:req.body.notification, alert:req.body.alert},{$set : {'estado': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeSupcription',
  (req, res) => {
    console.log("Ingresando a servicio removeSupcription");
    var stateNew = 'E'
    db.collection('saypd_supcription').remove({email:req.body.email, notification:req.body.notification, alert:req.body.alert},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);


//getList
apiRoutes.get('/listSuscription',
  (req, res) => {
    db.collection('saypd_supcription').find({estado: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);

var functions = [];
//CRUD Functions
//insert
apiRoutes.post('/setFunction',
(req, res) => {
    console.log("Ingresando a servicio setFunction");
    var array = [req.body.parameters];
    functions[req.body.name] = new Function([req.body.parameters], req.body.grammatic);
    db.collection('saypd_function').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Funcion ya existe."});

         db.collection('saypd_function').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })

    })
  }
);

//update
apiRoutes.post('/updateFunction',
(req, res) => {
    console.log("Ingresando a servicio updateFunction");
    console.log(req.body);
    functions[req.body.name] = new Function([req.body.parameters],req.body.grammatic);
    db.collection('saypd_function').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples valores"});

       db.collection('saypd_function').updateMany({name:req.body.name},{$set : {'grammatic': req.body.grammatic}},
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
       })

    })
  }
);

//update
apiRoutes.post('/testFunction',
(req, res) => {
    console.log("Ingresando a servicio testFunction");
    console.log(req.body);
    var f;
    if(req.body.values){
      var array = req.body.values.split(",");
      f = functions[req.body.name](...array);
    }else{
      f = functions[req.body.name]();
    }



    return res.status(201).json({estado:"OK", descripcion:"funcion ejecutada", object:f});
  }
);

//updateState
apiRoutes.post('/stateFunction',
  (req, res) => {
    console.log("Ingresando a servicio stateFunction");
    console.log(req.body.email);
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('saypd_function').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeFunction',
  (req, res) => {
    console.log("Ingresando a servicio removeFunction");
    var stateNew = 'E'
    db.collection('saypd_function').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);

//getList
apiRoutes.get('/listFunction',
  (req, res) => {
    db.collection('saypd_function').find({state: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);

//CRUD Executions
//insert
apiRoutes.post('/setExecution',
(req, res) => {
    console.log("Ingresando a servicio setExecution");
    db.collection('saypd_execution').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Ejecucion ya existe."});

         db.collection('saypd_execution').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })

    })
  }
);

//update
apiRoutes.post('/updateExecution',
(req, res) => {
    console.log("Ingresando a servicio updateExecution");
    db.collection('saypd_execution').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples valores"});

       db.collection('saypd_execution').updateMany({name:req.body.name},{$set : {'funcion': req.body.funcion, 'parameters':req.body.parameters}},
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
       })

    })
  }
);

//update
apiRoutes.post('/testExecution',
(req, res) => {
    console.log("Ingresando a servicio testExecution");
    console.log(req.body);
    var f;
    var f = eval(req.body.grammatic);
    if(f==""){
      f = "Ejecucion correcta de la Funcion";
    }
    return res.status(201).json({estado:"OK", descripcion:"funcion ejecutada", object:f});
  }
);

//updateState
apiRoutes.post('/stateExecution',
  (req, res) => {
    console.log("Ingresando a servicio stateExecution");
    console.log(req.body.email);
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('saypd_execution').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeExecution',
  (req, res) => {
    console.log("Ingresando a servicio removeExecution");
    var stateNew = 'E'
    db.collection('saypd_execution').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);

//getList
apiRoutes.get('/listExecution',
  (req, res) => {
    db.collection('saypd_execution').find({state: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);

//CRUD Actions
//insert
apiRoutes.post('/setAction',
(req, res) => {
    console.log("Ingresando a servicio setAction");
    db.collection('saypd_action').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>0)
           return res.status(201).json({estado:"NOK", descripcion:"Action ya existe."});

         db.collection('saypd_action').save(req.body,
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al ingresar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
         })
    })
  }
);

//update
apiRoutes.post('/updateAction',
(req, res) => {
    console.log("Ingresando a servicio updateAction");
    console.log(req.body);
    db.collection('saypd_action').find({name:req.body.name}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        if (results>1)
           return res.status(201).json({estado:"NOK", descripcion:"Existen multiples valores"});

       db.collection('saypd_action').updateMany({name:req.body.name},{$set : {'grammatic': req.body.grammatic}},
         function (err, result) {
           if (err)
             return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
           return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", object:req.body});
       })

    })
  }
);

//update
apiRoutes.post('/validateAction',
(req, res) => {
    console.log("Ingresando a servicio validateAction");
    console.log(req.body);


    return res.status(201).json({estado:"OK", descripcion:"funcion ejecutada", object:f});
  }
);

//updateState
apiRoutes.post('/stateAction',
  (req, res) => {
    console.log("Ingresando a servicio stateAction");
    console.log(req.body.email);
    var stateNew = req.body.state == 'A' ? 'I' : 'A';
    db.collection('saypd_action').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//updateState
apiRoutes.post('/removeAction',
  (req, res) => {
    console.log("Ingresando a servicio removeAction");
    var stateNew = 'E'
    db.collection('saypd_action').updateMany({name:req.body.name},{$set : {'state': stateNew}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
        return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
    })

  }
);

//getList
apiRoutes.get('/listAction',
  (req, res) => {
    db.collection('saypd_action').find({state: { $in: [ "A", "I" ] }}).toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ types : results });
    })
  }
);



//Other Services

// Obtener alertas
apiRoutes.get('/alertas',
  (req, res) => {
    db.collection('saypd_alerts').find().toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ alertas : results });
    })
  }
);

//Obtener acciones del sensor
apiRoutes.post('/getAccion',
  (req, res) => {
    console.log("entro a servicio getAccion");
    console.log(req.body.idAlerta);
    db.collection('saypd_work').find({idAlert:req.body.idAlerta}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        // if (results>1)
        //   return res.send({estado:"NOK", descripcion:"Existen multiples acciones a un sensor en estado pendiente."});

        db.collection('saypd_work').find({idAlert:req.body.idAlerta}).toArray(
          function(err, results) {
            if (err)
              return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
            return res.send(results[0]);
        })
    })
  }
);

//Agregar accion asociada a un sensor
apiRoutes.post('/endAccion',
  (req, res) => {
    db.collection('acciones').updateMany({idAlerta:req.body.idAlerta,estado:'A'},{$set : {'estado': 'C'}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })

    db.collection('saypd_alerts').updateMany({idAlerta:req.body.idAlerta,estado:'A'},{$set : {'estado': 'C'}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })
    return res.status(201).json({estado:"OK", descripcion:"Accion completada correctamente"});
  }
);

//Agregar accion asociada a un sensor
apiRoutes.post('/setAccion',
  (req, res) => {
    console.log("Ingresando a servicio setAccion");
    console.log(req.body);
    db.collection('saypd_work').save(req.body, (err, result) => {
        if (err) return res.status(201).json({estado:"NOK", descripcion:"Error al guardar el registro"});
    })
    console.log(req.body.idAlerta);
    db.collection('saypd_alerts').updateMany({idAlerta:req.body.idAlerta,estado:'E'},{$set : {'estado': 'A'}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })

    return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente"});
  }
);

function setAction(idAlerta, codigo, descripcion){
  console.log("Ingresando a servicio setAccion");
  console.log(codigo +','+ descripcion);
  var json = {'idAlert':idAlerta,'codigo':codigo,'descripcion':descripcion};
  db.collection('saypd_work').save(json, (err, result) => {
      if (err) return false;
  })

  db.collection('saypd_alerts').updateMany({idAlerta:idAlerta,estado:'E'},{$set : {'estado': 'A'}},
    function (err, result) {
      if (err)
        return false;
  })
  return true;

}

// Add an exclamation
apiRoutes.post('/recibirAlertas',
  (req, res) => {
    console.log(req.body);
    db.collection('saypd_alerts').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
    })

    //obtener Subscripcion
    console.log("buscando suscripciones");
    db.collection('saypd_supcription').find({estado: { $in: [ "A", "I" ] }, alert : req.body.tipo}).toArray(function(err, results) {
      if (err) return console.log(err)
      results.map(function(supcription){
        var html = "Se a ingresado una alerta.\n Nombre:"+req.body.nombre+"\n Tipo:"+req.body.tipo+"\n Fecha:"+req.body.fecha+"\n Hora:"+req.body.hora+"\n Atte. Equipo SAYD"
        sendMailInterno (supcription.email,"Alerta Ingresada con ID"+req.body.idAlerta,html);
      })
    })

    //Generacion de Acciones
    db.collection('saypd_action').find({state: { $in: [ "A", "I" ] }, alertType : req.body.tipo}).toArray(function(err, results) {
      if (err) return console.log(err)
      results.map(function(result){
        if(result.grammatic != ''){
          //console.log(result.grammatic);
          var lineas = result.grammatic.split("\n");
          lineas.map(function(linea){
            if(linea != '')
              //LLamado de tipos de llamadas
              if(linea.startsWith('funcion:')){
                if(linea.includes('(')){
                  //funcion parametrizada
                  //console.log("entro a funcion con parametros");
                  var length = 'funcion:'.length;
                  var funcion = linea.substring(length, (linea.length));
                  //agregamos parametro de alerta
                  var funcionSplit = funcion.split("(");
                  var cabecera = funcionSplit[0];
                  var parametros = funcionSplit[1];
                  funcion = cabecera +'("' + req.body.idAlerta +'",'+parametros;
                  console.log(funcion);
                  eval(funcion);
                }else{
                  var length = 'funcion:'.length;
                  var call = linea.substring(length, (linea.length-1));
                  console.log(call);
                  db.collection('saypd_execution').find({state: { $in: [ "A", "I" ] }, funcion: call }).toArray(function(err, results) {
                    if (err) return console.log(err)
                    results.map(function(result){
                      //console.log(result.funcion);
                      var funcion = result.funcion + '("'+ req.body.idAlerta + '",';
                      var params = '';
                      //console.log(result.parameters);
                      result.parameters.map(function(param){
                        console.log(params);
                        params = params == '' ?  '"'+param.value+'"' : params + ', "'+ param.value+'"';
                      });
                      funcion = funcion + params + ');';
                      console.log(funcion);
                      eval(funcion);
                    })
                  })
                }
              }
          })
        }
      })
    })
    res.status(201).json("OK");
  }
);


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
