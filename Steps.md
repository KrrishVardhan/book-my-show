# Step 1
Start docker and run this command 
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  postgres:17

# Step 2
now you can enter into interactive mode in terminal using following command 

docker exec -it <container_name> psql -U <user> -d <db_name> 

# Step 3
Abh CREATE TABLE etc krke dekho
also exit krne ke liye type exit