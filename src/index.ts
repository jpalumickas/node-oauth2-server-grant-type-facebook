import {
  AbstractGrantType,
  InvalidArgumentError,
  InvalidRequestError,
  InvalidTokenError,
} from '@node-oauth/oauth2-server';
import type {
  Request,
  Client,
  TokenOptions,
  User,
  Token,
} from '@node-oauth/oauth2-server';
import type { FacebookUserData, Model } from './types.js';

const url = 'https://graph.facebook.com/me';
const defaultFields = ['email', 'first_name', 'last_name'];

export interface Options extends TokenOptions {
  model: Model;
}

export class FacebookGrantType extends AbstractGrantType {
  model: Model;
  fields: string[];

  constructor(options: Options) {
    super(options);

    if (!options.model) {
      throw new InvalidArgumentError('Missing parameter: `model`');
    }

    if (!options.model.getUserWithFacebook) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `getUserWithFacebook()`',
      );
    }

    if (!options.model.saveToken) {
      throw new InvalidArgumentError(
        'Invalid argument: model does not implement `saveToken()`',
      );
    }

    this.model = options.model;
    this.fields = this.model.facebookGrantType?.fields ?? defaultFields;

    this.handle = this.handle.bind(this);
    this.getUser = this.getUser.bind(this);
    this.saveToken = this.saveToken.bind(this);
  }

  async handle(request: Request, client: Client) {
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

  async getUser(request: Request) {
    const token = request.body.facebook_token;

    if (!token) {
      throw new InvalidRequestError('Missing parameter: `facebook_token`');
    }

    let data: FacebookUserData;

    try {
      const params = new URLSearchParams({
        access_token: token,
        fields: this.fields.join(','),
      });

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Facebook graph responded with ${response.status}`);
      }

      data = (await response.json()) as FacebookUserData;
    } catch {
      throw new InvalidTokenError('Facebook token is invalid or expired');
    }

    return await this.model.getUserWithFacebook(data);
  }

  async saveToken(user: User, client: Client, scope: string[]) {
    const validatedScope = await this.validateScope(user, client, scope);
    const accessToken = await this.generateAccessToken(client, user, scope);
    const refreshToken = await this.generateRefreshToken(client, user, scope);
    const accessTokenExpiresAt = this.getAccessTokenExpiresAt();
    const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();

    const token: Token = {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      scope: validatedScope || [],
      user: {
        id: user.id,
      },
      client,
    };

    return await this.model.saveToken(token, client, user);
  }
}
