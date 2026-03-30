# Use Node 20 or 22 for Vite 6+
FROM node:22-alpine

WORKDIR /app

# Copy package files first to cache npm install
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Vite default port is often 5173, but we will force it to match your setup
EXPOSE 47897

# Run vite with the --host flag so it accepts connections from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "47897"]