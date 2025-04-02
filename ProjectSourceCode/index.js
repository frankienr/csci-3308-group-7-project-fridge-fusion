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
    //login page
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
    //register page
});



// This function searched Spoonacular for the given query string, then inserts all found recipes into the local tables.
async function pullSpoonacularAPIByQuery(queryString){
  const apiKey = process.env.SPOONACULAR_API_KEY
  const params = {
    "query" : queryString,
    "addRecipeInformation" : true,
    "addRecipeInstructions" : true,
    "fillIngredients" : true 
  }

  let foundRecipes = null

  console.log("Fetching Spoonacular recipes.")

  axios.get('https://api.spoonacular.com/recipes/complexSearch', {
    headers: {
        "x-api-key": apiKey
    },
    "params": params
  }).then(function (response) {
    foundRecipes = response
  })
  .catch(function (error) {
    console.log("Error fetching Spoonacular data. See log below: ")
    console.log(error);
    return error
  });
  console.log("Successfully pulled Spoonacular data, inserting into DB...")
  // Iterates through all of the returned recipes, and grabs the appropriate data to insert.
  for(item in results.results){ 


    // Construct the ingredient insertion query and ingredient ID fetch query

    let insertIngredientsQueryStart = "INSERT INTO ingredients (ingredient_name) VALUES "
    let insertIngredientsQueryMiddle = ""
    
    // Use CONFLICT DO NOTHING for inserting ingredients so that it does not scream about duplicate ingredients.
    let insertIngredientsQueryEnd = " ON CONFLICT DO NOTHING"


    // Iterates throught the extended ingredients, gets the clean names, and adds them to both the insert query and the
    // ID fetch query.
    for (ingredient in item.extendedIngredients){
      let name = ingredient.nameClean
      if (insertIngredientsQuery == ""){
        insertIngredientsQuery = `('${name}')`
      }
      else{
        insertIngredientsQuery += `, ('${name}')`
      }
    }

    let insertIngredientsQuery = insertIngredientsQueryStart + insertIngredientsQueryMiddle + insertIngredientsQueryEnd
    let selectRecipeIngredientIDs = selectRecipeIngredientIDsStart + selectRecipeIngredientIDsMiddle


    // Construct the recipe insertion query

    let insertRecipeQueryStart = "INSERT INTO recipes (recipe_name, recipe_time_minutes, recipe_link) VALUES "
    let insertRecipeQueryMiddle = `('${item.title}', '${item.readyInMinutes}', '${item.image}')`
    let insertRecipeQueryEnd = "RETURNING recipe_id ON CONFLICT DO NOTHING" // Same reason as above, in case a duplicate recipe name ends up getting inserted.

    let insertRecipeQuery = insertRecipeQueryStart + insertRecipeQueryMiddle + insertRecipeQueryEnd

    // Construct the recipe-ingredient linking query.



    let linkRecipeIngredientsStart = "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_unit, ingredient_unit_quantity) VALUES "
    let linkRecipeIngredientsMiddle = "" // This will get set after the recipe and ingredient_ids are known.
    let linkRecipeIngredientsEnd = " " // No ignore conflict, because if the recipe insert returns nothing, this should not even run to begin with. 




    try {
      // use task to execute multiple queries
      const results = await db.task(async t => {
        const insertedIngredientIDs = await t.any(insertIngredientsQuery);
        const insertedRecipeID = await t.one(insertRecipeQuery);


        let recipeID = null

        for(row in insertedRecipeID){
          recipeID = row.recipe_id
        }

        // Check if recipe has been inserted.
        if(recipeID != null){
          // TODO: Iterate through all of the ingredients in the recipe, then find the corresponding ingredient ID from the query, and       
      
          for(ingredient in item.extendedIngredients){
            let name = ingredient.nameClean
            let unit = ingredient.unit
            let amount = ingredient.amount
            const ingredientID = await t.one(`SELECT ingredient_id FROM ingredients WHERE ingredient_name='${name}'`)


          }
        }


        const linkRecipeSuccess = await t.any(linkRecipeIngredients)
        res.status(200).json({
          query1results: insertIngredientsSuccess,
          query2results: insertRecipesSuccess,
          query3results: linkRecipeSuccess
      });
      });
    } catch (err) {
      console.log(err)
      return err
    }
  }
}

// pullSpoonacularAPIByQuery("pasta")

// Currentlly testing

//What other pages will we have?

// Start the server
app.listen(3000);
console.log('Server is listening on port 3000');