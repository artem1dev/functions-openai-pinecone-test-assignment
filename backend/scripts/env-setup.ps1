# 1) Export dummy AWS creds
$Env:AWS_ACCESS_KEY_ID     = 'test'
$Env:AWS_SECRET_ACCESS_KEY = 'test'
$Env:AWS_DEFAULT_REGION    = 'us-west-1'

# 2) Create S3 bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

# 3) Register State Machine
$roleArn = 'arn:aws:iam::000000000000:role/DummyRole'
aws --endpoint-url=http://localhost:4566 stepfunctions create-state-machine `
  --name MyStateMachine `
  --definition file://state-machine.json `
  --role-arn $roleArn

# 4) Verify
aws --endpoint-url=http://localhost:4566 stepfunctions list-state-machines --output table

# 5) (Optional) DynamoDB table
aws --endpoint-url=http://localhost:4566 dynamodb create-table `
  --table-name Files `
  --attribute-definitions AttributeName=id,AttributeType=S `
  --key-schema AttributeName=id,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# 6) Configure S3 CORS
# cors.json should be in the same directory
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors `
  --bucket my-bucket `
  --cors-configuration file://cors.json