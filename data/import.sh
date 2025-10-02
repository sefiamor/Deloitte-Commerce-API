#!/bin/bash
mongoimport --uri mongodb://deloitte-commerce-api:Deloitte-Pass@mongo-db:27017/deloitte --collection products --drop --file /data/export/products.json
mongoimport --uri mongodb://deloitte-commerce-api:Deloitte-Pass@mongo-db:27017/deloitte --collection users --drop --file /data/export/users.json
mongoimport --uri mongodb://deloitte-commerce-api:Deloitte-Pass@mongo-db:27017/deloitte --collection orders --drop --file /data/export/orders.json