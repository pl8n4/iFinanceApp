
To start download the zip file and unzip to where you want it
You will need to download node.js and mySql workbench for this project to run
For node.js make sure you add it to your path, for Mac: /usr/local/bin
VSCode will also be used for this project

In mySQL workbench, connect to your local instance, paste these lines and run them:
CREATE DATABASE Group4_iFINANCEDB;
USE Group4_iFINANCEDB;

Open the IFinanceApp project VSCode and from a terminal in VSCode cd into iFinanceApp(If on windows make sure to you use command propt and not powershell)

Once in the IFinanceApp direcory, in the terminal run: npm install
Then cd from the IFinanceApp into the backend and run: npm install 
Then cd from the IFinanceApp into the frontend/FEUI and run: npm install
Also in the frontend/FEUI run two more installs:
npm install react-scripts
npm install jspdf jspdf-autotable

Note: the front end/backend may display vulnerabilities, but it should be ok to proceed regardless

In the project editor window in VSCode look for a .env file in the backend directory, if there is not one create a file under backend called .env and paste the following into it, be sure to replace DB_USER = “your mySQL root name” as well as DB_PASS = “your mySQL password” with your SQL server info:

PORT=5001 
DB_DIALECT=mysql 
DB_HOST=127.0.0.1 
DB_PORT=3306 
DB_NAME=Group4_iFINANCEDB 
DB_USER=root 
DB_PASS=7777 
JWT_SECRET=supersecretkey 
SALT_ROUNDS=10

You will need to seed some initial data into the database as well before you start, open your backend terminal and run these commands:
node scripts/seedAdmin.js
npm run seed:categories

When logging into the iFinance application for the first time the credentials are
Username:admin
Password:admin

Finally in the the backend run the command: npm run dev
And in the frontend/FEUI run the command: npm start
Note: there is a chance that you may need to install other package(s), if so they should display in the terminal

maybe:
npm install jspdf jspdf-autotable in frontend/feui

Note:
In order to deposit you must have an account with an income group and an asset group
At the end of index.js in the backend, await.sequalize.sync when true updates database schema. Best practice to set it to false after first use of syncing database