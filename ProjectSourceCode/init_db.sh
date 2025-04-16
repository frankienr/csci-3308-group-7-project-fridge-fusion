#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://exampleuser:Mf1lhl4DHUK7lz6uK1bjSPwpkYXhQTFc@dpg-d000daa4d50c739pr50g-a.oregon-postgres.render.com/users_db_3whj"

# Execute each .sql file in the directory
for file in postgres/init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done
