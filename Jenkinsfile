pipeline {
    agent any
    environment {
        CI = 'true'
        //registry = "javierch/meteor"
        //registryCredential = 'dockerhub_crendencial'
        dockerImage = ''
        //BASE_PATH= "/home/ubuntu"
        //ENV_DEPLOY_PATH ="enviroments"
        /*WORKSPACE="jenkins_home/workspace"
        APP_ENVIROMENT="pro"
        USER_ANSIBLE="ubuntu"*/
       /* APP_NAME="sapens"*/
        
    }
    stages {
        stage('Testing') {
            steps {
                sh 'docker system prune -f --volumes'
                script {
                    dockerImage = docker.image(registry+":builder")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.pull()
                      }
                    
                    sh 'docker run --name="builder" --rm -v $BASE_PATH/$WORKSPACE/$JOB_NAME:/app $registry:builder  test:ci'
                   
                
                    
                }
                
                


            }
        }
        
        stage('Build') {
            steps {
  
                sh 'docker run --name="builder" --rm -v $BASE_PATH/$WORKSPACE/$JOB_NAME:/app $registry:builder build:ci'
        
            }
        }
        stage('Backup before release') {
            steps {
            
                script {
                    try {
                        dockerImage =docker.image(registry+":$JOB_NAME")
                        docker.withRegistry( '', registryCredential ) {
                            dockerImage.pull()
                            dockerImage.push("${JOB_NAME}_old")
                            sh 'docker rmi $registry:JOB_NAME'
                            sh 'docker rmi $registry:${JOB_NAME}_old'
                          }
                    } catch (err) {
                        echo err.getMessage()
                    }
                    
                    
                }
                
                
            }
        }
        stage('Deliver') {
            steps {
                //sh 'docker rmi -f $(docker images | grep "<none>" | awk "{print \$3}")'
                //sh 'docker system prune -f --volumes'
                sh 'docker system prune -af'
                sh 'tar xzf app.tar.gz'
                script {
                    
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage = docker.build("$registry:$JOB_NAME")
                        dockerImage.push()
                      }    
                }
                sh 'rm app.tar.gz'
                sh 'rm -rf bundle'
                
            }
        }
        stage('deploy') {
            
            steps {
               
                build job: 'deployer', parameters: [string(name: 'APP_NAME', value:"$APP_NAME"), string(name:'APP_ENVIROMENT', value: "$APP_ENVIROMENT"), string(name:'USER_ANSIBLE', value: "$USER_ANSIBLE"), string(name:'APP_SERVICE', value: "$JOB_NAME")]
               
               
            }
        }
    }
}
