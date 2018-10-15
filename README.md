# xiaomi-uir-mqtt

Xiaomi Mi Universal IR Remote to MQTT Bridge

## Getting IP and Token

```
miio discover
```

See [miio](https://www.npmjs.com/package/miio)

## Config

```
cp config.example.yml config.yml
```

...then edit.

## Running

```
CONFIG_PATH=./config.yml node index.js
```
