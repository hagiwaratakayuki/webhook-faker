# Webhook Faker

Fake data generator for Webhook

## Description

For "webhook test" make easy generate fake data when webhook call your service.
Now fixed for Line Messaging API.

## Installation

    1. git clone https://github.com/hagiwaratakayuki/webhook-faker
    2. cd installed directry.
    3. "npm install"
    4. create "cript" directory.
    5. create channel_secret.txt and  write Line bot channel secret.

## Usage

### Generate fake data for message event

```
npm run faker message {message type} {source}
```

source and message is optional.

### Generate fake data for follow/unfollow event

```
npm run faker follow
```

```
npm run faker unfollow
```

### Generate fake data for join/leave event

```
npm run faker join {source}
```

source can select 'group' or 'room'.default 'group'

```
npm run faker leave
```

### Generate fake data for postback event

```
npm run faker postback {source}
```
source is optional.default is "user"

### Generate fake data for beacon event

```
npm run faker beacon {event type}
```

event type is optional. default is 'enter'

## Author

[hagiwara takayuki](hagiwaratakayuki+webhookfaker@gmail.com)

## License

[MIT](http://b4b4r07.mit-license.org)
