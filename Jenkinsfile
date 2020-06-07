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
                dockerImage = docker.image(registry+":builder")
                docker.withRegistry( '', registryCredential ) {
                    dockerImage.pull()
                  }
                
                dockerImage.run('--name="builder" --rm -v "$PWD":/app javierch/meteor:builder', 'test:ci')


            }
        }
        stage('Build') {
            steps {
                dockerImage.run('--name="builder" --rm -v "$PWD":/app javierch/meteor:builder', 'build:ci')
                 
                sh "docker rm builder"
            }
        }
        stage('Backup before release') {
            steps {
                
                docker.withRegistry( '', registryCredential ) {
                    docker.image(registry+":sapens").pull().push("sapens_old")
                  }
                
            }
        }
        stage('Deliver') {
            steps {
                
                sh 'tar xzf app.tar.gz'
                dockerImage = docker.build("javierch/meteor:sapens")
                docker.withRegistry( '', registryCredential ) {
                    dockerImage.push()
                  }

            }
        }
        stage('deploy') {
            steps {
                
                dockerImage = docker.build("javierch/meteor:sapens")
                docker.withRegistry( '', registryCredential ) {
                    dockerImage.push()
                  }

            }
        }
    }
}