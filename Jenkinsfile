pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        ECR_REPO        = '099751327159.dkr.ecr.ap-south-1.amazonaws.com/my-app'
        CLUSTER_NAME    = 'my-cluster'
        KUBECONFIG      = '/opt/jenkins/home/.kube/config'
        AWS_SHARED_CREDENTIALS_FILE = '/opt/jenkins/home/.aws/credentials'
        AWS_CONFIG_FILE = '/opt/jenkins/home/.aws/config'
    }

    stages {

        stage('1 - Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }

        stage('2 - Build Docker Image') {
            steps {
                sh """
                    docker build -t ${ECR_REPO}:${BUILD_NUMBER} .
                    docker tag ${ECR_REPO}:${BUILD_NUMBER} ${ECR_REPO}:latest
                """
            }
        }

        stage('3 - Test') {
            steps {
                sh """
                    docker run --rm ${ECR_REPO}:${BUILD_NUMBER} npm test
                """
            }
        }

        stage('4 - Push to ECR') {
            steps {
                sh """
                    aws ecr get-login-password --region ${AWS_REGION} \
                      | docker login --username AWS --password-stdin ${ECR_REPO}
                    docker push ${ECR_REPO}:${BUILD_NUMBER}
                    docker push ${ECR_REPO}:latest
                """
            }
        }

        stage('5 - Update kubeconfig') {
            steps {
                sh """
                    aws eks update-kubeconfig \
                      --name ${CLUSTER_NAME} \
                      --region ${AWS_REGION} \
                      --kubeconfig ${KUBECONFIG}
                """
            }
        }

        stage('6 - Deploy with Helm') {
            steps {
                sh """
                    helm upgrade --install my-app ./helm-chart \
                      --set image.repository=${ECR_REPO} \
                      --set image.tag=${BUILD_NUMBER} \
                      --namespace default \
                      --wait \
                      --timeout 5m
                """
            }
        }

        stage('7 - Verify Deployment') {
            steps {
                sh """
                    kubectl rollout status deployment/my-app --timeout=120s
                    kubectl get pods -l app=my-app
                """
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Pipeline failed! Rolling back..."
            sh 'helm rollback my-app 1 || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
