param(
  [string]$EndpointUrl = 'http://localhost:4566',
  [string]$RoleArn     = 'arn:aws:iam::000000000000:role/DummyRole',
  [string]$Runtime     = 'nodejs18.x'
)

# 1) Locate env.json and build a proper file:// URI
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile   = Join-Path $scriptDir 'env.json'
if (-not (Test-Path $envFile)) {
  Write-Host "ERROR: env.json not found at $envFile"
  exit 1
}
# Convert to URI form
$uriPath = ($envFile -replace '\\','/').TrimStart('/')
$envUri  = "file://$uriPath"

Write-Host "Using environment variables from $envUri"

# 2) Iterate over each lambda folder
$lambdasRoot = Join-Path $scriptDir '..\lambdas'
Get-ChildItem -Path $lambdasRoot -Directory | ForEach-Object {
  $name    = $_.Name
  $srcDir  = $_.FullName
  $deploy  = Join-Path $env:TEMP "deploy-$name"
  $zipFile = Join-Path $srcDir "$name.zip"

  Write-Host ""
  Write-Host "Deploying function: $name"

  # Clean previous build
  Remove-Item $deploy -Recurse -Force -ErrorAction SilentlyContinue
  New-Item $deploy -ItemType Directory | Out-Null

  # Install production dependencies
  Push-Location $srcDir
    Write-Host "  npm ci && npm prune --production"
    npm ci | Out-Null
    npm prune --production | Out-Null
  Pop-Location

  # Copy only .js, .json and node_modules (exclude *.d.ts and tests)
  Write-Host "  Copying files to $deploy"
  robocopy $srcDir $deploy *.js *.json /S /XF *.d.ts *test* | Out-Null
  robocopy (Join-Path $srcDir 'node_modules') (Join-Path $deploy 'node_modules') *.* /S /XF *.d.ts *test* | Out-Null

  # Create ZIP
  if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
  Write-Host "  Creating archive -> $zipFile"
  Compress-Archive -Path (Join-Path $deploy '*') -DestinationPath $zipFile -Force

  # Deploy or update
  try {
    Write-Host "  Creating function $name"
    aws --endpoint-url $EndpointUrl lambda create-function `
      --function-name $name `
      --runtime $Runtime `
      --handler index.handler `
      --role $RoleArn `
      --zip-file fileb://$zipFile `
      --timeout 60 `
      --environment $envUri | Out-Null
  }
  catch {
    if ($_.Exception.Message -match 'ResourceConflictException') {
      Write-Host "  Updating function code $name"
      aws --endpoint-url $EndpointUrl lambda update-function-code `
        --function-name $name `
        --zip-file fileb://$zipFile | Out-Null

      Write-Host "  Updating function configuration $name"
      aws --endpoint-url $EndpointUrl lambda update-function-configuration `
        --function-name $name `
        --environment $envUri | Out-Null
    }
    else {
      throw $_
    }
  }
}

# Final list
Write-Host ""
Write-Host "Done. Functions in LocalStack:"
aws --endpoint-url $EndpointUrl lambda list-functions `
  --query "Functions[].FunctionName" --output text
