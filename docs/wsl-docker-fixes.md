Issue:
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.47/containers/json": dial unix /var/run/docker.sock: connect: permission denied

Fix

- ls -l /var/run/docker.sock
- sudo usermod -aG docker $USER
- newgrp docker
- docker ps (verify no sudo is needed)

Issue:
sudo apt-get install docker-compose-plugin
Reading package lists... Done
E: Unable to locate package docker-compose-plugin

Fix
Steps to Resolve

1. Update and Install Prerequisites

Ensure your system is up-to-date and has the necessary tools.

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

2. Add Docker's Official GPG Key and Repository

Add Docker's repository to your system.

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

3. Install Docker Compose Plugin

Update the package list and install the plugin.

sudo apt-get update
sudo apt-get install -y docker-compose-plugin

4. Verify Installation

Check if Docker Compose is installed correctly.

docker compose version

Expected output:

`Docker Compose version v2.x.x`

Issue:
Running Docker using Docker Compose

Fix

```
docker compose build --no-cache
docker compose up -d
```

Issue:
Read file inside docker container

Fix:
`docker exec -it notety cat /etc/nginx/conf.d/default.conf`
