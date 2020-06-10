#!/bin/bash
echo "Starting application in ${NODE_ENV} environment"


if [ "$WAIT_FOR_MONGO" == "true" ]
then
    echo "Waiting for MongoDB to start"
    ./wait 
fi 
echo "Mongo DB started, starting application"

if [ "$POPULATE_DB"  == "true" ]
then
    echo "Populating Mongo Database"
    ./mongotools/bin/mongorestore --uri=${MONGODB_URI} dump/
    echo "database populated"
fi

# starting NGINX service 
echo "Starting NGINX service"
service nginx start

echo "Strating application with pm2 process manager"
pm2-runtime ./bin/www