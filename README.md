# HG Recon Art
Build specs:
Node version: 14.19.3
Npm version: 6.14.17

# Local setup:
Run: npm install

#To start 
Run: hello-recon-{environment}
Eg: npm run hello-recon-qa

#Miscellaneous notes
Validation on required fields is done in the middleware in files names based off the relevant controller name: verify%controller%.js
Eg: verifyCompany.js

All selects to the MySQl database are stored as functions in /services: dbRequests.js

#Troubleshooting
If on Windows OS update the run command(hello-recon-%) in package.json to start with "SET NODE_ENV=" otherwise it will fail to start
The DB user hello_capturer will only work from the relevant frontend servers, to dev you will need to have access to that DB given to your own mysql user and to update those details in environments/local/.env
if the Dockerfile fails to copy the environment specific .env to the environments folder, copy the file manually before build

#Docker
Build using the build.sh file and select relevant environment and docker tag
