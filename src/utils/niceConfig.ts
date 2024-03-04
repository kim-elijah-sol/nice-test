export const niceConfig = {
  sitecode: process.env.SITECODE ?? "",
  sitepw: process.env.SITEPW ?? "",
  modulePath:
    process.env.NODE_ENV === "production"
      ? process.env.MODULEPATH
      : process.env.LOCAL_MODULEPATH,
} as const;
