organization = "YOUR_ORGANIZATION_NAME_HERE" # example: myorg
project = "YOUR_PROJECT_NAME_HERE" # example: arcwell
environment = "staging" # example: staging
domain_name = "YOUR_DOMAIN_NAME_HERE" # example: staging.myorg.com
ssl_cert_arn = "YOUR_SSL_CERT_ARN_HERE" # Obtain cert arn from aws certificate manager created cert for *.staging.myorg.com
bastion_key_name = "YOUR_KEY_NAME_HERE" # example arcwell-staging-bastion-key

include_flow_logs = false
include_access_logs = false
