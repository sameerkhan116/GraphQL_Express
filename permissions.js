/*
  Creating a create resolver function that takes a resolver as argument.
  On the base resolver, we will create a new Resolver that takes a childResolver as argument.
  The new resolver will await the resolver to resolver and return the child resolver with these args.

  We run the createresolver function with the newResolver.
  Finally, we return the baseResolver.
*/

const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async(obj, args, context, info) => {
      await resolver(obj, args, context);
      return childResolver(obj, args, context);
    };
    return createResolver(newResolver);
  }
  return baseResolver;
}

export const requiresAuth = createResolver((obj, args, context) => {
  if (!context.user) {
    throw new Error('Not authenticated');
  }
});

export const requiresAdmin = requiresAuth.createResolver((obj, args, context) => {
  if (!context.user.isAdmin) {
    throw new Error('Requires admin access');
  }
})