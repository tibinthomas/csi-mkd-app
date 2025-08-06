#!/bin/bash

dotnet publish -c Release -o ./publish

cd ./publish
zip -r ../app.zip .
cd ..

az webapp deploy \
  --resource-group csi-mkd-premarital-counsel-app \
  --name csi-mkd-premarital-counsel-app \
  --src-path ./app.zip \
  --type zip
