/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-params */
import type { GraphQLField } from 'graphql'
import { defaultFieldResolver } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

import type StorefrontPermissions from '../../clients/storefrontPermissions'

export const getCheckUserPermission = async (
  storefrontPermissions: StorefrontPermissions
) =>
  const result = await storefrontPermissions.checkUserPermission()
  return result?.data?.checkUserPermission ?? null

export class WithPermissions extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async (
      root: any,
      args: any,
      context: Context,
      info: any
    ) => {
      const {
        clients: { storefrontPermissions },
        vtex: { adminUserAuthToken, logger },
      } = context

      const appClients = context.vtex as any

      appClients.storefrontPermissions = await getCheckUserPermission(
        storefrontPermissions
      ).catch((error: any) => {
        if (!adminUserAuthToken) {
          logger.error({
            message: 'getPermissionsError',
            error,
          })
        }

        return null
      })

      return resolve(root, args, context, info)
    }
  }
}
