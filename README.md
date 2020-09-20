# OAuth2 Server Facebook Grant Type

Adds Facebook grant type for [oauth2-server][oauth2-server]

## Installation

Using Yarn
```sh
yarn add oauth2-server-grant-type-facebook
```

Using NPM

```sh
npm install oauth2-server-grant-type-facebook
```

## Usage


Add `getUserWithFacebook` to [oauth2-server] model.

```js
  const getUserWithFacebook = async (facebookData) => {
    // Find and return user by facebook ID

    // Find and return user by Facebook email

    // If not exists create new user
  };
```

Add Facebook grant type to `extendedGrantTypes` in [oauth2-server] options:

```js
  import FacebookGrantType from 'oauth2-server-grant-type-facebook';

  const options = {
    model: ...
    extendedGrantTypes: {
      facebook: FacebookGrantType,
    }
    requireClientAuthentication: {
      facebook: false,
    },
  }
```

Post request to `/oauth/token` with `facebook` grant type:

```json
{
  "grant_type": "facebook",
  "client_id": "YOUR_CLIENT_ID",
  "facebook_token": "FACEBOOK_TOKEN"
}
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

[oauth2-server]: https://github.com/oauthjs/node-oauth2-server
