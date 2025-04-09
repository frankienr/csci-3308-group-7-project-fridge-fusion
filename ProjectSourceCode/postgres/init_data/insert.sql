INSERT INTO users (first_name, last_name, username, email, password)

VALUES 
(
    'Johnny',
    'Smith',
    'J.Smith@smithy.org',
    'Johnny99',
    '$2a$10$uEoMkkP8CpBUYkvm/md57OZ9M2FfilgeWKV31geNcWHJ4fvGQocxq'
),
(
    'Monty',
    'Python',
    'holygrail@flyingcircus.org',
    'MPython',
    '$2a$10$uEoMkkP8CpBUYkvm/md57OZ9M2FfilgeWKV31geNcWHJ4fvGQocxq'
),
(
    'Sarah',
    'Lee',
    's.lee@gmail.com',
    'Sarah.Lee',
    '$2a$10$uEoMkkP8CpBUYkvm/md57OZ9M2FfilgeWKV31geNcWHJ4fvGQocxq'
) ON CONFLICT DO NOTHING;