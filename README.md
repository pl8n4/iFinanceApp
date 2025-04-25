
To start download the zip file and unzip to where you want it
You will need to download node.js and mySql workbench for this project to run
For node.js make sure you add it to your path, for Mac: /usr/local/bin

In mySQL workbench, connect to your local instance and paste these lines and run them:
CREATE DATABASE Group4_iFINANCEDB;
USE Group4_iFINANCEDB;

Open the IFinanceApp project back up and from a terminal cd into iFinanceApp
Once in the IFinanceApp in the terminal run: npm install
Create two more terminals and repeat. These new terminals should have one cd from the IFinanceApp into the backend and the other to the frontend/FEUI and run npm install on both
Note: the front end/backend may display an error/warning, but it should be ok to proceed regardless

In the project editor window look for a .env file in the backend directory, if there is not one create a file under backend called .env and paste the following into it, be sure to replace DB_USER = “your mySQL root name” as well as DB_PASS = “your mySQL password”:
PORT=5001 
DB_DIALECT=mysql 
DB_HOST=127.0.0.1 
DB_PORT=3306 
DB_NAME=Group4_iFINANCEDB 
DB_USER=root 
DB_PASS=7777 
JWT_SECRET=supersecretkey 
SALT_ROUNDS=10

You will need to seed some initial data into the database as well before you start, open your backed terminal and run these commands:
node scripts/seedAdmin.js
npm run seed:categorieswhen logging in for the first time the credentials are
Username:admin
Password:admin

Finally in the the backend run the command: npm run dev
And in the frontend/FEUI run the command: npm start
Note: there is a chance that you may need to install other package(s), if so they should display in the terminal