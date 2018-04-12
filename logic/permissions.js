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

/* 
  requiresAuth wraps the function in createResolver and then, if context doesn't contain user, then return
  not authenticated.
*/
export const requiresAuth = createResolver((obj, args, context) => {
  if (!context.user) {
    throw new Error('Not authenticated');
  }
});

/* 
  requiresAdmin checks for requireAuth and then createResolver on the given resolver.
*/
export const requiresAdmin = requiresAuth.createResolver((obj, args, context) => {
  if (!context.user.isAdmin) {
    throw new Error('Requires admin access');
  }
})