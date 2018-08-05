# data-visuals :: to get data as per needs

// TO DO... Remove below junk
Step #0: Setup mongoDB with users collection with 
            { name: String, password: String, admin: Boolean }

Step #1: npm install
Step #2: npm start

Step #3: Authenticate the user with the below end-point and body should be like below
            { "name": "usename", "password": "password" }
            http://localhost:3000/api/users/authenticate

Step #4: Later with the token in headers section you can hit any end-point
            x-access-token = token (returned in Step #3)

Step #5: Extend how ever you want this repo