CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    ingredient_name VARCHAR(100) UNIQUE
);


CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    recipe_name VARCHAR(100) UNIQUE,
    ready_time_minutes INTEGER,
    recipe_link VARCHAR(200),
    recipe_image VARCHAR(200)
);


CREATE TABLE recipe_ingredients (
    recipe_id INTEGER references recipes(recipe_id),
    ingredient_id INTEGER references ingredients(ingredient_id),
    ingredient_unit VARCHAR(50),
    ingredient_unit_quantity INTEGER,
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(60)
);

CREATE TABLE user_friends (
    user_id INTEGER references users(user_id),
    friend_id INTEGER references users(user_id),
    PRIMARY KEY(user_id, friend_id)
);

CREATE TABLE user_ingredients (
    user_id INTEGER references users(user_id),
    ingredient_id INTEGER references ingredients(ingredient_id),
    ingredient_quantity INTEGER,
    PRIMARY KEY(user_id, ingredient_id)
);


