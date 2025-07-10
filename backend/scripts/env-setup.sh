set -e

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "1) Exporting dummy AWS credentials"
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-west-1"

echo "2) Creating S3 bucket in LocalStack"
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

echo "3) Registering Step Functions state machine"
ROLE_ARN="arn:aws:iam::000000000000:role/DummyRole"
aws --endpoint-url=http://localhost:4566 stepfunctions create-state-machine \
  --name MyStateMachine \
  --definition file://"$SCRIPTS_DIR/state-machine.json" \
  --role-arn "$ROLE_ARN"

echo "4) Verifying state machines"
aws --endpoint-url=http://localhost:4566 stepfunctions list-state-machines --output table

echo "5) (Optional) Creating DynamoDB table"
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name Files \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

echo "6) Configuring S3 CORS"
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
  --bucket my-bucket \
  --cors-configuration file://"$SCRIPTS_DIR/cors.json"

echo "Environment setup complete"
