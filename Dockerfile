#Base node:20-alpine
FROM node:20-alpine

#Set working directory inside container
WORKDIR /app

#Copy package management files
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy application code
COPY . .

#Expose Vite dev server port 
EXPOSE 5173

#Start Vite with host binding for Docker networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]