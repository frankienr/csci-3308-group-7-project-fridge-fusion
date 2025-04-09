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

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user && req.url != "/login" && req.url != "/register" && req.url != "/welcome") {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }
  try {
    res.status(200).json({
      username: req.session.user.username,
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Internal Server Error');
  }
});


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



// This function searched Spoonacular for the given query string, then inserts all found recipes into the local tables.
async function pullSpoonacularAPIByQuery(queryString){
  const apiKey = process.env.SPOONACULAR_API_KEY

  let foundRecipes = null

  console.log(apiKey)

  console.log("Fetching Spoonacular recipes.")
  try{
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      headers: {
        "x-api-key": apiKey
      },
      "params": {
        "query" : queryString,
        "addRecipeInformation" : true,
        "fillIngredients" : true 
      }
    })
    foundRecipes = response.data
  }
  catch{
    console.log("Error fetching Spoonacular data. See log below: ")
    return
    }    

  if (foundRecipes == null){
    console.log("Error fetching Spoonacular data")
    return
  }


  console.log("Successfully pulled Spoonacular data, inserting into DB...")
  // Iterates through all of the returned recipes, and grabs the appropriate data to insert.
  for(index in foundRecipes.results){ 

    let item = foundRecipes.results[index]

    // Construct the ingredient insertion query and ingredient ID fetch query
    
    // Use CONFLICT DO NOTHING for inserting ingredients so that it does not scream about duplicate ingredients.


    // Iterates throught the extended ingredients, gets the clean names, and adds them to both the insert query and the
    // ID fetch query.

    ingredients = []

    for (ingredient in item.extendedIngredients){
      let name = item.extendedIngredients[ingredient].nameClean
      ingredients.push(name)
    }

    try {
      // use task to execute multiple queries
      const results = await db.task(async t => {
        if(ingredients == []){
          console.log("No ingredients to insert, continuing...")
        }
        else{
          console.log(ingredients)
          for(ingredient in ingredients){
            console.log(ingredient)
            const insertedIngredientIDs = await t.query("INSERT INTO ingredients (ingredient_name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING (ingredient_id)", ingredients[ingredient]);
          }
          console.log("Successfully inserted ingredients.")
        }
        const insertedRecipeID = await t.query("INSERT INTO recipes (recipe_name, ready_time_minutes, recipe_link, recipe_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING(recipe_id)", [
          item.title, item.readyInMinutes, item.sourceUrl, item.image
        ]);

        

        let recipeID = null
        if (insertedRecipeID.length != 0){
          recipeID = insertedRecipeID[0].recipe_id
        }

        await t.query("COMMIT")


        // Check if recipe has been inserted.
        if(recipeID != null){
          console.log("Inserting ingredients")
          // TODO: Iterate through all of the ingredients in the recipe, then find the corresponding ingredient ID from the query, and       
      
          for(ingredientIndex in item.extendedIngredients){
            ingredient = item.extendedIngredients[ingredientIndex]
            let name = ingredient.nameClean
            let unit = ingredient.unit
            let amount = ingredient.amount
            const ingredientID = await t.one(`SELECT ingredient_id FROM ingredients WHERE ingredient_name='${name}'`)
            // Specifically using t.one because this should ALWAYS WORK BECAUSE THE RECIPE WAS FRESHLY INSERTED.
            console.log(ingredientID)
            const linkRecipeIngredients = await t.query(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_unit, ingredient_unit_quantity) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
              [recipeID, ingredientID.ingredient_id, unit, amount])
          }
          console.log(`Successfully inserted recipe ${item.title} into table!`)
        }
        else{
          console.log(`Recipe ${item.title} already exists, skipping.`)
        }

      });
    } catch (err) {
      console.log(err)
      return err
    }
  }
}
// Testing route

app.get('/welcome', (req, res) => {
  
  res.json({status: 'success', message: 'Welcome!'});
});

// pullSpoonacularAPIByQuery("beef")

// Start the server
module.exports = app.listen(3000);

console.log('Server is listening on port 3000');