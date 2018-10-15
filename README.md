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

## Using

(Assuming a MQTT prefix of `miir/`)

Send `miir/learn` to initiate code learning.

Learned codes will be sent to `miir/learned`.

Broadcast IR codes from the device by sending to `miir/send`.
