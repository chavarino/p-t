pipeline {
    agent any
    environment {
        CI = 'true'
        registry = "javierch/meteor"
        registryCredential = 'dockerhub_crendencial'
        dockerImage = ''
    }
    stages {
       /* stage('Testing') {
            steps {
                sh 'docker system prune -f --volumes'
                script {
                    dockerImage = docker.image(registry+":builder")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.pull()
                      }
                    
                    sh 'docker run --name="builder" --rm -v /home/ubuntu/workspace/sapens:/app javierch/meteor:builder  test:ci'
                   
                
                    
                }
                
                


            }
        }
        
        stage('Build') {
            steps {
                //sh 'docker system prune -f --volumes'
                sh 'docker run --name="builder" --rm -v /home/ubuntu/workspace/sapens:/app javierch/meteor:builder build:ci'
        
            }
        }
        stage('Backup before release') {
            steps {
                
                script {
                    dockerImage =docker.image(registry+":sapens")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.pull()
                        dockerImage.push("sapens_old")
                        sh 'docker rmi $registry:sapens'
                        sh 'docker rmi $registry:sapens_old'
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
                        dockerImage = docker.build("javierch/meteor:sapens")
                        dockerImage.push()
                      }    
                }
                sh 'rm app.tar.gz'
                sh 'rm -rf bundle'
                
            }
        }*/
        stage('deploy') {
            
            steps {
                sh 'echo $ENVIROMENT_DEPLOY'
            }
        }
    }
}
