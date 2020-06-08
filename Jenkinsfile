pipeline {
    agent any
    environment {
        CI = 'true'
        registry = "javierch/meteor"
        registryCredential = 'dockerhub_crendencial'
        dockerImage = ''
    }
    stages {
        stage('Testing') {
            steps {
                script {
                    dockerImage = docker.image(registry+":builder")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.pull()
                      }
                    sh 'ls -la'
                    sh 'docker run --name="builder" --rm -v /home/ubuntu/workspace/sapens:/app javierch/meteor:builder  test:ci'
                    sh 'ls -la'
                
                    
                }
                
                


            }
        }
        
        stage('Build') {
            steps {
               
                sh 'docker run --name="builder" --rm -v /home/ubuntu/workspace/sapens:/app javierch/meteor:builder build:ci'
               
                
            }
        }
        stage('Backup before release') {
            steps {
                
                script {
                    docker.withRegistry( '', registryCredential ) {
                        docker.image(registry+":sapens").pull().push("sapens_old")
                      }
                }
                
                
            }
        }
        stage('Deliver') {
            steps {
                sh 'tar xzf app.tar.gz'
                script {
                    dockerImage = docker.build("javierch/meteor:sapens")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.push()
                      }    
                }
            }
        }
        stage('deploy') {
            steps {
                script {
                    dockerImage = docker.build("javierch/meteor:sapens")
                    docker.withRegistry( '', registryCredential ) {
                        dockerImage.push()
                      }
                }
            }
        }
    }
}
