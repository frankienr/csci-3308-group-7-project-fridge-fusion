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
const { availableParallelism } = require('os');

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
    res.render("pages/login", {
      "message": "Username and password are required.",
      "error": true
    })
    return
  }

  const result = await db.query(`SELECT user_id, password FROM users WHERE username = $1;`, [username]); 

  if(!result[0]){

    res.render("pages/login", {
      "message": "Invalid username or password.",
      "error": true
    })
    return
  }
  
  const user = result[0];


  const match = await bcrypt.compare(req.body.password, user.password);

  console.log(user.password)
  

  if(!match){

    res.render("pages/login", {
      "message": "Invalid username or password.",
      "error": true
    })
    return
}

  req.session.user = user.user_id;
  req.session.save();
  console.log("Redirecting to profile")
  res.redirect('/profile');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
  try {
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const username = req.body.username;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const email = req.body.email;
    
    if (!username || !password || !confirm_password || !email || !first_name || !last_name) {
      res.render("pages/register", {
        "message": "Complete all required fields",
        "error": true
      })
      return
    }
    
    if(password != confirm_password){
      res.render("pages/register", {
        "message": "Passwords don't match",
        "error": true
      })
      return
    }

    // Hash the password using bcrypt
    const hash = await bcrypt.hash(password, 10);

    console.log(hash)

    // Insert username and hashed password into the 'users' table
    // edit line below to match our database
    await db.query('INSERT INTO users(first_name, last_name, username, password, email) VALUES ($1, $2, $3, $4, $5);', [first_name, last_name, username, hash, email]);

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render("pages/register", {
      "message": "Internal server error. Try again later.",
      "error": true
    })
  }
});

async function getUserIngredients(user_id){
  const fetchUserIngredients = await db.query("SELECT ingredient_name from user_ingredients JOIN ingredients ON ingredients.ingredient_id=user_ingredients.ingredient_id WHERE user_id=$1", [user_id])

  let ingredientsArray = []

  for(ingredientIndex in fetchUserIngredients){
    let ingredient = fetchUserIngredients[ingredientIndex]
    ingredientsArray.push(ingredient.ingredient_name)
  }

  return ingredientsArray

}

async function getAllIngredients(){
  const fetchAllIngredients = await db.query("SELECT ingredient_name FROM ingredients")

  let allIngredientsArray = []

  for(ingredientIndex in fetchAllIngredients){
    let ingredient = fetchAllIngredients[ingredientIndex]
    allIngredientsArray.push(ingredient.ingredient_name)
  }

  return allIngredientsArray
}

app.get('/fridge', async (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }

  res.render('pages/fridge', {
    "ingredients": await getUserIngredients(req.session.user),
    "seen_ingreds": await getAllIngredients()
  });
});

app.post('/fridge/delete', async (req, res) => {
  // try{
    console.log("ingredient_name", req.body.ingredient)
    const getIngredientID = await db.one("SELECT ingredient_id FROM ingredients WHERE ingredient_name=$1", [req.body.ingredient])
    const ingredient_id = getIngredientID.ingredient_id
    const results = await db.none("DELETE FROM user_ingredients WHERE ingredient_id=$1 AND user_id=$2", [ingredient_id, req.session.user])
    console.log(results)
    res.redirect("/fridge")
  // }
  // catch{
  //   console.log("Failed to delete")  
  //   res.render("pages/fridge", {
  //     "error": true,
  //     "message": "Failed to delete item!",
  //     "ingredients": await getUserIngredients(req.session.user),
  //     "seen_ingreds": await getAllIngredients()
  //   })
  // }
});

app.get("/home", (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }
  res.render("pages/home")
})

app.post('/fridge/add', async (req, res) => {
  const new_ingredient = req.body.new_ingredient
  console.log("new_ingredient", new_ingredient)
  // try{
    let getIngredientID = await db.any("SELECT ingredient_id FROM ingredients WHERE ingredient_name=$1", [new_ingredient])
    console.log(getIngredientID)
    if(!getIngredientID[0]){
      // Ingredient does not already exist in database, search for it then try again
      pullSpoonacularAPIByQuery(new_ingredient)
      getIngredientID = await db.any("SELECT ingredient_id FROM ingredients WHERE ingredient_name=$1", [new_ingredient])
      if(!getIngredientID[0]){
        // This means that even though recipes were pulled, that exact ingredient was not found. Should search in dropdown list
        // Fetch everything for rendering so that the message can be passed in.

        res.render("pages/fridge", {
          "error": true,
          "message": "Successfully pulled new recipes, unable to find exact ingredient name. Please select from the recommended options.",
          "ingredients": await getUserIngredients(req.session.user),
          "seen_ingreds": await getAllIngredients()
        })
        return
      }
    }
    // If execution gets this far, then at some point a correct ingredient ID was found. Insert into table

    const ingredientID = getIngredientID[0].ingredient_id
    const linkIngredientWithUser = await db.none("INSERT INTO user_ingredients (user_id, ingredient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.session.user, ingredientID])

    res.redirect("/fridge")
    // }
  // catch{

  // }
})

app.get('/profile', async (req, res) => {
  console.log("Rendering profile")
  if(!req.session.user){
    return res.redirect('/login');
  }

  const retrieveUserData = await db.one("SELECT first_name, last_name, username, email FROM users WHERE user_id = $1", [req.session.user])

  console.log(retrieveUserData)

  res.render('pages/profile', 
    retrieveUserData
  );
});

app.get('/home', async (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }

  res.render('pages/home');
});

app.get('/recipes', async (req, res) => {
  if(!req.session.user){
    return res.redirect('/login');
  }

  const recipeQuery = `SELECT recipes.recipe_id AS recipe_id, recipe_name, ready_time_minutes, recipe_link, recipe_image,
                      COUNT(recipe_ingredients.ingredient_id) AS matchCount FROM
                      (recipes JOIN recipe_ingredients 
                      ON recipe_ingredients.recipe_id=recipes.recipe_id) 
                      JOIN user_ingredients ON user_ingredients.ingredient_id=recipe_ingredients.ingredient_id

                      WHERE user_id=$1 
                      GROUP BY recipes.recipe_id
                      ORDER BY matchCount DESC
                      LIMIT 20;`

  // Right now the query limits to 20 pages, but pagination can be added.
  // Maybe add matchcount as a parameter, or highlight the ingredients they have.

  const availableRecipes = await db.any(recipeQuery, [req.session.user])

  recipeArray = []

  console.log(availableRecipes)

  for(recipeIndex in availableRecipes){
    let recipe = availableRecipes[recipeIndex]

    console.log("Reading ", recipe.recipe_id)

    let recipeIngredients = await db.any("SELECT ingredient_name FROM ingredients JOIN recipe_ingredients ON ingredients.ingredient_id=recipe_ingredients.ingredient_id WHERE recipe_ingredients.recipe_id=$1", [recipe.recipe_id])

    ingredientString = ""

    for(ingredientIndex in recipeIngredients){
      let ingredient = recipeIngredients[ingredientIndex]
      if(ingredientString == ""){
        ingredientString = ingredient.ingredient_name
      }
      else{
        ingredientString += ", " + ingredient.ingredient_name
      }
    }

    let recipeData = {
      "image": recipe.recipe_image,
      "title": recipe.recipe_name,
      "readyInMinutes": recipe.ready_time_minutes,
      "sourceUrl": recipe.recipe_link,
      "ingredients": ingredientString
    }

    recipeArray.push(recipeData)
  }
  
  res.render('pages/recipes', {
    recipes: recipeArray
  });
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