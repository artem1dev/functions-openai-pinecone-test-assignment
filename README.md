$Env:AWS_ACCESS_KEY_ID     = 'test'
$Env:AWS_SECRET_ACCESS_KEY = 'test'
$Env:AWS_DEFAULT_REGION    = 'us-west-1'

aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

$roleArn = 'arn:aws:iam::000000000000:role/DummyRole'
aws --endpoint-url=http://localhost:4566 stepfunctions create-state-machine `
  --name MyStateMachine `
  --definition file://state-machine.json `
  --role-arn $roleArn

aws --endpoint-url=http://localhost:4566 stepfunctions list-state-machines

aws --endpoint-url=http://localhost:4566 dynamodb create-table `
  --table-name Files `
  --attribute-definitions AttributeName=id,AttributeType=S `
  --key-schema AttributeName=id,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST

aws --endpoint-url=http://localhost:4566 dynamodb list-tables

aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors `
  --bucket my-bucket `
  --cors-configuration file://cors.json


docker-compose down -v

docker-compose up -d  

.\scripts\build-lambdas.ps1
.\scripts\env-setup.ps1
.\scripts\package-deploy-lambdas.ps1

//get logs
$execrn = aws --endpoint-url=http://localhost:4566 stepfunctions list-executions `
  --state-machine-arn arn:aws:states:us-west-1:000000000000:stateMachine:MyStateMachine `
  --query 'executions[0].executionArn' `
  --output text
  
aws --endpoint-url=http://localhost:4566 stepfunctions get-execution-history `
  --execution-arn $execrn `
  --output json > history.json


//get functions
aws --endpoint-url http://localhost:4566 lambda list-functions `
  --query "Functions[].FunctionName" `
  --output text

aws --endpoint-url http://localhost:4566 lambda delete-function --function-name ExtractText

aws --endpoint-url http://localhost:4566 lambda create-function `
  --function-name ExtractText `
  --runtime nodejs18.x `
  --handler index.handler `
  --role arn:aws:iam::000000000000:role/DummyRole `
  --zip-file fileb://lambdas/ExtractText/ExtractText.zip `
  --environment file://./scripts/env.json