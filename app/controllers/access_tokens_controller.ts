import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokensController {
  async store({ request, response, serialize }: HttpContext) {
    let payload: { email: string; password: string }

    try {
      payload = await request.validateUsing(loginValidator)
    } catch {
      return response.badRequest({
        success: false,
        message: 'Invalid email or password format',
      })
    }

    const { email, password } = payload

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return serialize({
        user: UserTransformer.transform(user),
        token: token.value!.release(),
      })
    } catch {
      return response.badRequest({
        success: false,
        message: 'Invalid email or password',
      })
    }
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
