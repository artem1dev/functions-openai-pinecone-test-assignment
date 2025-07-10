set -e

ENDPOINT_URL="${1:-http://localhost:4566}"
ROLE_ARN="${2:-arn:aws:iam::000000000000:role/DummyRole}"
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_ROOT="${SCRIPTS_DIR}/../lambdas"

echo "Deploying lambdas to $ENDPOINT_URL with role $ROLE_ARN"

for dir in "$LAMBDA_ROOT"/*/; do
  name=$(basename "$dir")
  echo "Packaging and deploying: $name"

  DEPLOY_DIR="$(mktemp -d)"
  ZIP_FILE="$dir/$name.zip"
  rm -f "$ZIP_FILE"

  rsync -av --exclude='*.d.ts' --exclude='*test*' "$dir/" "$DEPLOY_DIR/"
  rm -rf "$DEPLOY_DIR/node_modules"

  pushd "$dir" > /dev/null
    npm ci --production
    rsync -av node_modules "$DEPLOY_DIR/"
  popd > /dev/null

  (cd "$DEPLOY_DIR" && zip -r "$ZIP_FILE" .)

  if aws --endpoint-url "$ENDPOINT_URL" lambda create-function \
      --function-name "$name" \
      --runtime nodejs18.x \
      --handler index.handler \
      --role "$ROLE_ARN" \
      --zip-file fileb://"$ZIP_FILE" \
      --environment file://$SCRIPTS_DIR/env.json \
      --timeout 60 >/dev/null 2>&1; then
    echo "Created function $name"
  else
    echo "Updating function $name"
    aws --endpoint-url "$ENDPOINT_URL" lambda update-function-code \
      --function-name "$name" \
      --zip-file fileb://"$ZIP_FILE"
    aws --endpoint-url "$ENDPOINT_URL" lambda update-function-configuration \
      --function-name "$name" \
      --environment file://$SCRIPTS_DIR/env.json
  fi

  rm -rf "$DEPLOY_DIR"
done

echo "Deployment complete"
