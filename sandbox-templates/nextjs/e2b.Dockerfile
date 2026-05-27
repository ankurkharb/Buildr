# You can use most Debian-based base images
FROM node:22-slim

# Install curl + git (required by some packages like lucide-react)
RUN apt-get update && apt-get install -y curl git && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set npm registry explicitly for stability
RUN npm config set registry https://registry.npmjs.org/

# Create compile script inline to avoid Windows line ending issues
RUN printf '#!/bin/bash\nfunction ping_server() {\n  counter=0\n  response=$(curl -s -o /dev/null -w "%%{http_code}" "http://localhost:3000")\n  while [[ ${response} -ne 200 ]]; do\n    let counter++\n    if (( counter %% 20 == 0 )); then\n      echo "Waiting for server to start..."\n      sleep 0.1\n    fi\n    response=$(curl -s -o /dev/null -w "%%{http_code}" "http://localhost:3000")\n  done\n}\nping_server &\ncd /home/user && exec npx next dev --turbopack --hostname 0.0.0.0 --port 3000\n' > /compile_page.sh && chmod +x /compile_page.sh

# Set working directory
WORKDIR /home/user/nextjs-app

# Create Next.js app
RUN npx --yes create-next-app@15.3.4 . --yes

# Force non-interactive mode
ENV CI=true

# Run shadcn init - pipe 'yes' + enter to auto-accept all prompts
RUN yes '' | npx --yes shadcn@latest init --force || yes '' | npx --yes shadcn@latest init --force || true

# Add all shadcn components - skip any that don't exist
RUN npx --yes shadcn@latest add accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input input-otp label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip --yes --overwrite || true

# Patch shadcn calendar output for newer react-day-picker type names.
RUN if [ -f components/ui/calendar.tsx ]; then sed -i 's/table: "w-full border-collapse"/month_grid: "w-full border-collapse"/' components/ui/calendar.tsx; fi

# Move the Nextjs app to the user directory
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app

# Set final working directory
WORKDIR /home/user
