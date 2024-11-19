# Microservices with Docker

This repository demonstrates the process of developing, Dockerizing, and deploying two simple microservices (User Service and Order Service) using Node.js and Express.

## Table of Contents
- [User Service](#user-service)
  - [Create User Service](#create-user-service)
  - [Dockerize User Service](#dockerize-user-service)
- [Order Service](#order-service)
  - [Create Order Service](#create-order-service)
  - [Dockerize Order Service](#dockerize-order-service)
- [Build and Push Docker Images](#build-and-push-docker-images)

---

## User Service

### Create User Service

1. Create a directory for the User Service:

   ```bash
   mkdir user-service
   cd user-service
   ```

   Create a folder named user-service and inside that folder, create a file named index.js

2. Initialize the Node.js Project
Navigate to the user-service folder in your terminal and run the following command to initialize a new Node.js project:

   ```bash
   npm init -y
   npm install express
   ```
3. Run the Application
Start the application by running the following command:

```bash
node index.js
```
Now, you can open your browser and navigate to http://localhost:3001. You should see the message: User Service is running!

Do the Same for Order-service

## 2. Dockerize Each Microservice
For each microservice, we need to create a Dockerfile to containerize the application.

User Service Dockerfile:

In the user-service directory, create a Dockerfile
```
# user-service/Dockerfile
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
```
For ```Order-Service``` 

```
# order-service/Dockerfile
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "index.js"]

```

2.2 Build and Push Docker Images
Build Docker images for both microservices:

```
# Build User Service Docker image
docker build -t <your-dockerhub-username>/user-service ./user-service

# Build Order Service Docker image
docker build -t <your-dockerhub-username>/order-service ./order-service
# Push User Service image
docker push <your-dockerhub-username>/user-service

# Push Order Service image
docker push <your-dockerhub-username>/order-service
```
### Run the below commands to install Java and Jenkins

Install Java

```
sudo apt update
sudo apt install openjdk-17-jre
```

Verify Java is Installed

```
java -version
```

Now, you can proceed with installing Jenkins

```
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins
```

**Note: ** By default, Jenkins will not be accessible to the external world due to the inbound traffic restriction by AWS. Open port 8080 in the inbound traffic rules as show below.

## 3. Initialize Git Repositories
You need to set up Git to manage your codebase.

Initialize a Git repository for your project:

If you are starting from scratch, create a directory for your project:

```
mkdir microservices-project
cd microservices-project
```
Initialize Git in the project directory:

```
git init
git add .
git commit -m "Initial commit with project structure"
```

Push your code to a GitHub repository:

Create a new repository on GitHub (e.g., microservices-project).
Follow the instructions to add a remote and push your code:

```
git remote add origin https://github.com/<your-github-username>/microservices-project.git
git push -u origin master

```

2. Setup Jenkins Pipeline for Build & Deployment
2.1 Create a Jenkins Pipeline Project
Create a new Jenkins pipeline project:

Open Jenkins and click on New Item.
Select Pipeline and give it a name (e.g., microservices-deployment).
Click OK to create the pipeline project.
Configure GitHub Integration:

In the Jenkins project configuration, go to the Pipeline section and scroll down to the Pipeline Script.
Add a script to pull your code from GitHub using a GitHub repository URL.
Configure Jenkins to trigger builds automatically using a GitHub webhook (you'll need to set this up in GitHub to notify Jenkins of code pushes).

```
pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')  // Jenkins credentials for Docker Hub
    }
    stages {
        stage('Checkout') {
            steps {
                // Pull the latest code from GitHub repository
                git url: 'https://github.com/your-username/microservices-project.git', branch: 'main'
            }
        }
        stage('Build') {
            steps {
                script {
                    // Build Docker images for both services
                    sh 'docker build -t your-dockerhub-username/user-service ./user-service'
                    sh 'docker build -t your-dockerhub-username/order-service ./order-service'
                }
            }
        }
        stage('Push Docker Images') {
            steps {
                script {
                    // Log in to Docker Hub and push the images
                    sh 'docker login -u your-dockerhub-username -p ${DOCKER_CREDENTIALS}'
                    sh 'docker push your-dockerhub-username/user-service'
                    sh 'docker push your-dockerhub-username/order-service'
                }
            }
        }
        stage('Deploy to Server') {
            steps {
                script {
                    // SSH into remote server and deploy containers
                    sh '''#!/bin/bash
                        ssh -o StrictHostKeyChecking=no -i /path/to/your/private-key.pem user@your-ec2-public-ip << 'EOF'
                            docker pull your-dockerhub-username/user-service
                            docker pull your-dockerhub-username/order-service
                            docker stop user-service order-service || true
                            docker run -d -p 3001:3001 --name user-service your-dockerhub-username/user-service
                            docker run -d -p 3002:3002 --name order-service your-dockerhub-username/order-service
                        EOF
                    '''
                }
            }
        }
    }
}
```


