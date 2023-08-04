#!/usr/bin/env bash
function echoBold () {
    echo $'\e[1m'"${1}"$'\e[0m'
}

echo Which environment you want to build? Options: local qa, staging or production
read env

echo Which environment you want to use for the docker tag? Options: qa, staging or prod-version
read tagName

docker build -t hgdockerza/hello-recon-api:$tagName -f Dockerfile --build-arg ENV=$env .

docker push hgdockerza/hello-recon-api:$tagName
