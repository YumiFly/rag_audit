docker run -it  \
  --env-file .env \
  -v /Users/tiantt/Documents/IDEA/Chainlink Hackson/rag-audit-api/app:/app/app \
  -v /Users/tiantt/Documents/IDEA/Chainlink Hackson/rag-audit-api/start.sh:/app/start.sh \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8009:8009 \
  rag-audit-api-dev /bin/bash


docker run -it --rm \
  -v "/Users/tiantt/Documents/IDEA/Chainlink Hackson/rag-audit-api/app:/app/app" \
  rag-audit-api-dev \
  /bin/bash

docker run -it --rm \
  --env-file .env \
  -v "$(pwd)/app:/app/app" \
  -v "$(pwd)/start.sh:/app/start.sh" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  rag-audit-api-dev /bin/bash

docker run -it --rm \
  --env-file .env \
  -v "$(pwd)/:/app" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  rag-audit-api-dev /bin/bash