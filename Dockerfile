# instantiation image for nodejs 22 alpine
FROM node:22-alpine
# set working directory
WORKDIR /app
# copy package.json and package-lock.json so dependencies can be installed separately from the rest of the code
COPY package*.json ./
# install backend dependencies
RUN npm ci
# copy the rest of the code
COPY . .
# expose port 5000 for the backend
EXPOSE 5000
# start the backend
CMD ["npm", "start"]