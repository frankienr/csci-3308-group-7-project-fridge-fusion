INSERT INTO users (first_name, last_name, email, username, password)

VALUES 
(
    'Johnny',
    'Smith',
    'J.Smith@smithy.org',
    'Johnny99',
    '$2a$10$cW.P3w92.R4f9SSc73DJ0.1ehqfm1JxEiOr0tw7ljLDBZypM.NkV6'
),
(
    'Monty',
    'Python',
    'holygrail@flyingcircus.org',
    'MPython',
    '$2a$10$cW.P3w92.R4f9SSc73DJ0.1ehqfm1JxEiOr0tw7ljLDBZypM.NkV6'
),
(
    'Sarah',
    'Lee',
    's.lee@gmail.com',
    'Sarah.Lee',
    '$2a$10$cW.P3w92.R4f9SSc73DJ0.1ehqfm1JxEiOr0tw7ljLDBZypM.NkV6'
) ON CONFLICT DO NOTHING;


INSERT INTO ingredients (ingredient_name) 
VALUES
(
    'apple'
),
(
    'cinnamon'
),
(
    'salt'
),
(
    'milk'
) ON CONFLICT DO NOTHING;


INSERT INTO user_ingredients (user_id, ingredient_id) 
VALUES 
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 3),
(3, 1),
(3, 2),
(3, 4) ON CONFLICT DO NOTHING;