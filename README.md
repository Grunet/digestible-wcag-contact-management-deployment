# digestible-wcag-contact-management-deployment

Exposes the code from the source directory as APIs deployed in the cloud

## Deployment Notes

- Follow the instructions [here](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html) to deploy a local Docker image to AWS Elastic Container Registry

  - Using the 1 line AWS CLI piped-to-Docker option mentioned [here](https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry-auth-token) for getting the temporary access token needed for this seemed to be the simplest option
  - The AWS repository name doesn't need to be the same as the github repo name, but there doesn't seem to be a reason NOT to have them be the same

- Following the guidance [here](https://aws.amazon.com/blogs/architecture/field-notes-integrating-http-apis-with-aws-cloud-map-and-amazon-ecs-services/) allows for the web server to be deployed in AWS API Gateway, with the following changes

  - A custom VPC + subnets don't seem to be needed (using the ECS default public ones available when creating the service seem to work)
  - Making sure all the port settings line up is subtle
    - In the task definition, if the networking mode is "awsvpc" you can only specify one port, which serves as both the container's port and the host's port (e.g. 4000:4000), i.e. the host can't listen on 80
    - To accomodate this, when setting up the "DNS records for service discovery" while creating the service in ECS, the port for the SRV type should be set to match the container's port
    - Running the troubleshooting commands mentioned [here](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-service-discovery.html#create-service-discovery-verify) was helpful in identifying the port issues
  - "Auto-Assign Public IP" needs to be set to Yes, otherwise the task instance has trouble pulling the container image from ECR (as also mentioned [in this troubleshooting page](https://aws.amazon.com/premiumsupport/knowledge-center/ecs-pull-container-api-error-ecr/))

### Security Notes

- Since the task instances have to have a public IP address to pull the container from ECR (when using a public VPC and subnets), they are out in the open on the internet and vulnerable

  - To address this, the security group for the service should have a single inbound traffic rule covering all ports that limits traffic to the security group itself (becoming self-referential). This should make it so only other AWS services using that security group can route traffic to the instances, preventing general access from the public internet.

- AWS API Gateway's HTTP API service as of this writing offers [3 ways](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-access-control.html) to handle authentication and authorization to restrict who can access the endpoint. Lambda functions give flexibility beyond what's needed here, while IAM roles seem to require callers to have AWS credentials (or at least info about them), so JSON Web Tokens (JWTs) seem to be a preferable choice.
  - AWS Cognito offers a user management service that can be used for this, with each caller given a username/password that Cognito can authenticate and turn into a secure JWT that can then be passed to API Gateway in a request. Cognito then checks if the token corresponds to a valid user or has been tampered with before authorizing the request to proceed
    - To start, create 1 User Pool (which the AWS Console walks through step-by-step) and 1 User Pool App Client enabled to access the pool (the client can be created during the initial walkthrough, but may need to be manually enabled for access to the pool afterwards)
    - Test user accounts can be created through the AWS Console, but in order to change their status from "FORCE_CHANGE_PASSWORD" to "ENABLED" aftewards, the [AWS CLI is required](https://stackoverflow.com/a/56948249/11866924)
  - Updating API Gateway to use the Cognito integration requires creating a JWT authorizer for relevant routes and then filling out the fields per [these guidelines](https://stackoverflow.com/a/59597794/11866924) based on info from Cognito (Note that the authorization may take a while, on the order of an hour, to finish deploying)
  - Testing the API's token handling can be done with Postman, where generating the tokens is done by the InitiateAuth command, which [can be done via the AWS CLI](https://sanderknape.com/2020/08/amazon-cognito-jwts-authenticate-amazon-http-api/)
