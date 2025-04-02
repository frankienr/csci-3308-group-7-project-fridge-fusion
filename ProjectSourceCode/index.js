/////////////// WE WILL LIKELY NEED TO CHANGE/ADD A FEW THINGS, THIS IS JUST A STARTING GUIDELINE FOR US ///////////////

// Import dependencies
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Create handlebars instance
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

const db = pgp(dbConfig);

// connect to database  
db.connect()
.then(obj => {
    console.log('Database connection successful');
    obj.done();
})
.catch(error => {
    console.log('ERROR:', error.message || error);
});

// Register HBS as viewer
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);
  
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/////////////// ROUTES /////////////// 
app.get('/', (req, res) => {
    res.redirect("/login")
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if(!username || !password){
      return res.status(400).json({ error: 'Username and password are required'});
    }
  
    // edit line below to match our database
    const result = await db.query(`SELECT * FROM users WHERE username = $1;`, [username]); 
  
    if(!result[0]){
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  
    const user = result[0];
  
    const match = await bcrypt.compare(req.body.password, user.password);
  
    if(!match){
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  
    req.session.user = user;
    req.session.save();
  
    res.redirect('/profile');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const confirm_password = req.body.confirm_password;
        const email = req.body.email;
        
        if (!username || !password || !confirm_password || !email) {
          return res.status(400).json({ error: 'Complete all required fields' });
        }
        
        if(password != confirm_password){
          return res.status(400).json( { error : "Passwords don't macth" });
        }

        // Hash the password using bcrypt
        const hash = await bcrypt.hash(password, 10);
    
        // Insert username and hashed password into the 'users' table
        // edit line below to match our database
        await db.query('INSERT INTO users(username, password) VALUES ($1, $2);', [username, hash]);
    
        res.redirect('/login');
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
});

app.get('/fridge', async (req, res) => {
    if(!req.session.user){
      return res.redirect('/login');
    }

    res.render('pages/fridge');
});

app.get('/profile', async (req, res) => {
    if(!req.session.user){
      return res.redirect('/login');
    }

    res.render('pages/profile');
});

app.get('/recipes', async (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }  
  
  res.render('pages/recipes');
});
//What other pages will we have?

// Start the server
app.listen(3000);
console.log('Server is listening on port 3000');