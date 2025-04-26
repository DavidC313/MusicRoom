#!/bin/bash

# Clean previous builds
rm -rf .next
rm -rf out

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build
echo "Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "You can now test the build locally by running:"
    echo "npx serve out"
else
    echo "Build failed. Please check the error messages above."
    exit 1
fi 