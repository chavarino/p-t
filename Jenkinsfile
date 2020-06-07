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

                    dockerImage.run('-i --rm --name="builder" -v "$PWD":/app javierch/meteor:builder', 'test:ci')
                    
                }
                
                


            }
        }
        
        stage('Build') {
            steps {
                sh 'docker rm builder'
                script {
                    dockerImage.run('-i --rm --name="builder" -v "$PWD":/app javierch/meteor:builder', 'build:ci')
                }
                
            }
        }
        stage('Backup before release') {
            steps {
                sh "docker rm builder"
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
