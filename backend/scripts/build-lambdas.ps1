Get-ChildItem -Path .\lambdas -Directory | ForEach-Object {
  $name   = $_.Name
  $folder = $_.FullName
  Push-Location $folder

  # Clean previous node_modules and build artifacts
  if (Test-Path node_modules) { Remove-Item node_modules -Recurse -Force }
  if (Test-Path index.js)   { Remove-Item index.js -Force }

  # Install production dependencies
  npm install --production

  # Bundle TypeScript into index.js using esbuild (requires esbuild in root devDependencies)
  if (Test-Path index.ts) {
    npx esbuild index.ts --bundle --platform=node --target=node18 --outfile=index.js
  }
  Pop-Location
}