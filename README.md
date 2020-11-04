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
