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
        if (!resp || resp.password !== password) {
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
         })

    })
    const user = getUser(req.body.email);
    return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", usuario : user});
);

//insert
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
             })
           }else{
             db.collection('usuarios').updateMany({email:req.body.email},{$set : {'name': req.body.name, 'lastname':req.body.lastname, 'cel':req.body.cel}},
               function (err, result) {
                 if (err)
                   return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
             })
           }

    })
    const user = getUser(req.body.email);
    return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente", usuario : user});
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


//get
apiRoutes.get('/users',
  (req, res) => {
    db.collection('usuarios').find().toArray(function(err, results) {
      if (err) return console.log(err)
      res.status(201).json({ users : results });
    })
  }
);




// Obtener alertas
apiRoutes.get('/alertas',
  (req, res) => {
    db.collection('alertas').find().toArray(function(err, results) {
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
    db.collection('acciones').find({idAlerta:req.body.idAlerta}).count(
      function(err, results) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al obtener el registro"});
        // if (results>1)
        //   return res.send({estado:"NOK", descripcion:"Existen multiples acciones a un sensor en estado pendiente."});

        db.collection('acciones').find({idAlerta:req.body.idAlerta}).toArray(
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

    db.collection('alertas').updateMany({idAlerta:req.body.idAlerta,estado:'A'},{$set : {'estado': 'C'}},
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
    db.collection('acciones').save(req.body, (err, result) => {
        if (err) return res.status(201).json({estado:"NOK", descripcion:"Error al guardar el registro"});
    })
    console.log(req.body.idAlerta);
    db.collection('alertas').updateMany({idAlerta:req.body.idAlerta,estado:'E'},{$set : {'estado': 'A'}},
      function (err, result) {
        if (err)
          return res.status(201).json({estado:"NOK", descripcion:"Error al actualizar el registro"});
    })

    return res.status(201).json({estado:"OK", descripcion:"Registro guardado correctamente"});
  }
);

// Add an exclamation
apiRoutes.post('/recibirAlertas',
  (req, res) => {
    console.log(req.body);
    db.collection('alertas').save(req.body, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
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
