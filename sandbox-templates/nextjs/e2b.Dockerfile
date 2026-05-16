# You can use most Debian-based base images
FROM node:21-slim

# Install curl + git (required by some packages like lucide-react)
RUN apt-get update && apt-get install -y curl git && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set npm registry explicitly for stability
RUN npm config set registry https://registry.npmjs.org/

# Copy script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Set working directory
WORKDIR /home/user/nextjs-app

# Create Next.js app
RUN npx --yes create-next-app@15.3.4 . --yes

# Run shadcn init with retry logic
RUN for i in 1 2 3; do npx --yes shadcn@latest init --yes -b neutral --force && break || sleep 5; done

# Run shadcn add --all with retry logic
RUN for i in 1 2 3; do npx --yes shadcn@latest add --all --yes && break || sleep 5; done

# Move the Nextjs app to the user directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app