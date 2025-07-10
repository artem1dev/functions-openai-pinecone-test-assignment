set -e

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_ROOT="${SCRIPTS_DIR}/../lambdas"

for dir in "$LAMBDA_ROOT"/*/; do
  name=$(basename "$dir")
  echo "Building lambda: $name"

  pushd "$dir" > /dev/null
    rm -rf node_modules index.js
    npm ci --production

    if [ -f index.ts ]; then
      npx esbuild index.ts --bundle --platform=node --target=node18 --outfile=index.js
    fi
  popd > /dev/null
done

echo "All lambdas built"
