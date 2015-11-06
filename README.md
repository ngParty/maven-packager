# Maven Packager
Create static assets maven package

## Install

`$ npm install maven-packager`

## Use

create file `pom.template.xml` based on https://github.com/ngParty/maven-packager/blob/master/pom.template.xml

add `maven-packager` to `package.json`

```json
"scripts": {
  ...
  "postbuild": "maven-packager"
}
```

## Develop

Install typings

`$ npm run typings`
