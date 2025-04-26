# MusicRoom

A web-based music creation and composition tool built with Next.js and Tone.js.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Testing the Build Locally

1. Install serve globally (if not already installed):
```bash
npm install -g serve
```

2. Run the test build script:
```bash
chmod +x test-build.sh
./test-build.sh
```

3. Test the build locally:
```bash
npx serve out
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Push your code to the main branch
3. Go to your repository settings
4. Navigate to "Pages" under "Code and automation"
5. Under "Build and deployment":
   - Source: Select "GitHub Actions"
6. The GitHub Actions workflow will automatically deploy your site when you push to main

## Important Notes

- The site is configured for static export
- Audio features require user interaction to initialize (browser security policy)
- Make sure to test all features locally before deploying
- The build process generates static files in the `out` directory
- All routes are pre-rendered at build time

## Troubleshooting

If you encounter any issues:

1. Check the GitHub Actions workflow logs
2. Ensure all dependencies are correctly listed in package.json
3. Verify that the Next.js configuration is correct
4. Make sure the .nojekyll file is present in the root directory
5. Check the browser console for any errors
6. Verify that all audio features work after user interaction

## License

MIT
