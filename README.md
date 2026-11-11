# DinoBox ong

Buy imaginary stuff, watch imaginary trucks
get  lost, and maybe get said imaginary money back. 

## What You Need
- Java 21 (the backend insists)
- Node.js + npm (the frontend demands it)
- MySQL running locally on port 3306

## Backend
1. cd Backend/package
2. ./mvnw spring-boot:run
3. It wakes up on port 3770. It's very proud of itself.

## Frontend
1. cd Frontend
2. npm install
3. npm run dev
4. Vite serves it on 5173 and proxies /api to the backend. Magic.

## Bonus Points
Run `product_gen.py` to fill the database with 120 products nobody
asked for. Run `./mvnw test` to see if the whole thing falls apart. It's untested, so just run `./mvnw spring-boot:run` instead pretty please
