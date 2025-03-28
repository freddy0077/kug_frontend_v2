/**
 * Safely accesses a nested property in an object using a dot-notation path
 * Prevents errors when trying to access properties of undefined objects
 * 
 * @param obj The object to access properties from
 * @param path Dot-notation path to the desired property (e.g., 'user.profile.name')
 * @param defaultValue Value to return if the property doesn't exist
 * @returns The value at the specified path or the default value
 */
export const safeAccess = (obj: any, path: string, defaultValue: any = undefined) => {
  try {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};
