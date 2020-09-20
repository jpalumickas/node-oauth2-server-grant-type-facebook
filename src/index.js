import {
  AbstractGrantType,
  InvalidArgumentError,
  InvalidRequestError,
  InvalidTokenError,
} from 'oauth2-server';
import axios from 'axios';

const url = 'https://graph.facebook.com/me';
const defaultFields = ['email', 'first_name', 'last_name'];

class FacebookGrantType extends AbstractGrantType {
  constructor(options = {}) {
    super(options);

    this.fields = options.facebookGrantType?.fields || defaultFields;

    if (!options.model) {
      throw new InvalidArgumentError('Missing parameter: `model`');
    }

    if (!options.model.getUserWithFacebook) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getUserWithFacebook()`'
      );
    }

    if (!this.fields) {
      throw new InvalidArgumentError(
        'Invalid argument: fields must be provided in options'
      );
    }

    if (!options.model.saveToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `saveToken()`'
      );
    }

    this.handle = this.handle.bind(this);
    this.getUser = this.getUser.bind(this);
    this.saveToken = this.saveToken.bind(this);
  }

  async handle(request, client) {
    if (!request) {
      throw new InvalidArgumentError('Missing parameter: `request`');
    }

    if (!client) {
      throw new InvalidArgumentError('Missing parameter: `client`');
    }

    const scope = this.getScope(request);
    const user = await this.getUser(request);

    return await this.saveToken(user, client, scope);
  }

  async getUser(request) {
    const token = request.body.facebook_token;

    if (!token) {
      throw new InvalidRequestError('Missing parameter: `facebook_token`');
    }

    try {
      const { data } = await axios.get(url, {
        params: { access_token: token, fields: this.fields.join(',') },
      });

      return await this.model.getUserWithFacebook(data);
    } catch (err) {
      throw new InvalidTokenError('Facebook token is invalid or expired');
    }
  }

  async saveToken(user, client, scope) {
    const scopeData = await this.validateScope(user, client, scope);
    const accessToken = await this.generateAccessToken(client, user, scope);
    const refreshToken = await this.generateRefreshToken(client, user, scope);
    const accessTokenExpiresAt = this.getAccessTokenExpiresAt();
    const refreshTokenExpiresAt = await this.getRefreshTokenExpiresAt();

    const token = {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      scope: scopeData,
    };

    return await this.model.saveToken(token, client, user);
  }
}

export default FacebookGrantType;
